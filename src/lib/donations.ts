/*
 * Recurring gifts by SEPA automatische incasso, and the messages around every
 * gift. ROADMAP 3.3; the requirements are in docs/SEPA_otomatik_incasso.pdf,
 * the API is Mollie's: https://docs.mollie.com/docs/recurring-payments.
 *
 * The flow, end to end:
 *
 * 1. A Mollie customer is created and the donor pays the first term by iDEAL
 *    as a `first` payment. Paying it lays down a SEPA mandate at Mollie.
 * 2. The webhook sees that payment paid and creates a Mollie subscription on
 *    the mandate, starting one term later. Mollie does all the scheduling.
 * 3. Every collection arrives at the same webhook as a payment we did not
 *    create; its `subscriptionId` says whose it is, and it becomes an ordinary
 *    record in Donaties.
 * 4. Mollie has no webhook for the subscription itself, so after each of those
 *    payments the subscription is re-read: that is how a gift cancelled by the
 *    bank, or a periodic gift that has run its course, is noticed.
 * 5. A daily job sends the pre-notification a few days before each collection.
 *    Mollie does not send one; under the SEPA rules the creditor must, and
 *    Mollie's answer was that this means us.
 *
 * Like ./email, no `server-only` marker: the collection config imports this,
 * and the payload CLI loads collection configs outside Next.
 */

import { randomBytes } from 'node:crypto'

import { MollieApiError, PaymentMethod, SequenceType, type Payment } from '@mollie/api-client'
import type { Payload } from 'payload'

import { getMessages } from '@/i18n'
import { nlEmail } from '@/i18n/locales/nl-email'
import { adminUrlFor, isEmailConfigured, sendMail, sendNotification } from '@/lib/email'
import { formatAmount, getMollieClient, getWebhookUrl } from '@/lib/mollie'
import { getSiteUrl } from '@/lib/site-url'
import type { Donation, RecurringDonation } from '@/payload-types'

/** Mollie's default ceiling for one SEPA direct debit. */
export const MAX_RECURRING_AMOUNT = 1000

/** A periodic gift runs five years: that is what makes it one. */
export const PERIODIC_YEARS = 5

/**
 * How many days before a collection the donor hears about it. The donor is
 * promised "a few days" and "at least three" in the texts; the job aims for
 * five, so a missed cron run or two still keeps the promise.
 */
export const PRENOTICE_DAYS = 5

/**
 * The mandate record is kept at least 14 months after the last collection
 * (B7): an unauthorised-debit claim can be made up to 13 months later, and
 * the mandate is what answers it.
 */
export const RECURRING_RETENTION_MONTHS = 14

type Kind = RecurringDonation['kind']
type Interval = RecurringDonation['interval']

/* --- Dates ------------------------------------------------------------- */
/*
 * Mollie's dates are plain YYYY-MM-DD and so are ours. Today is taken in
 * Amsterdam, not UTC, so a gift paid at half past midnight belongs to the day
 * the donor thinks it is.
 */

export const todayInAmsterdam = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

/** Adds months, keeping the day where it can: 31 January plus one is 28 or 29 February. */
export const addMonths = (ymd: string, months: number): string => {
  const [year, month, day] = ymd.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()

  target.setUTCDate(Math.min(day, lastDay))
  return target.toISOString().slice(0, 10)
}

export const addDays = (ymd: string, days: number): string => {
  const date = new Date(`${ymd}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const daysUntil = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)

export const formatDate = (ymd: string): string =>
  new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${ymd}T00:00:00Z`))

export const formatEuro = (amount: number): string =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

/* --- Terms ------------------------------------------------------------- */

export const intervalMonths = (interval: Interval): number => (interval === 'yearly' ? 12 : 1)

/** "elke maand" / "elk jaar", for the texts. */
export const intervalLabel = (interval: Interval): string => {
  const messages = getMessages()
  return interval === 'yearly' ? messages.recurringEveryYear : messages.recurringEveryMonth
}

/** All terms of a periodic gift, the first payment included; null when it runs until stopped. */
export const totalTermsFor = (kind: Kind, interval: Interval): number | null =>
  kind === 'periodic' ? (PERIODIC_YEARS * 12) / intervalMonths(interval) : null

/** What the bank statement says. Unique per customer, as Mollie requires: each gift has its own customer. */
const statementText = (kind: Kind): string => {
  const messages = getMessages()
  return kind === 'periodic' ? messages.recurringPeriodicDescription : messages.recurringMonthlyDescription
}

/* --- Switches and links ------------------------------------------------ */

/**
 * Whether a recurring gift may be started at all.
 *
 * Besides Mollie, two things the law and the texts rely on: mail, because the
 * pre-notification is the creditor's duty and the confirmation is the
 * donor's proof of the mandate; and the cron secret, because without it the
 * daily job that sends the pre-notifications refuses to run. Missing either,
 * the page explains instead of offering a promise it cannot keep.
 */
export const isRecurringEnabled = (): boolean =>
  getMollieClient() !== null && isEmailConfigured() && Boolean(process.env.CRON_SECRET?.trim())

export const newAccessKey = (): string => randomBytes(24).toString('base64url')

export const stopUrlFor = (key: string): string => `${getSiteUrl()}/doneren/stopzetten/${key}`

export const startUrlFor = (key: string): string => `${getSiteUrl()}/doneren/periodiek/${key}`

/** The gift behind a link in the donor's e-mail, or null. The key is the only credential. */
export async function findRecurringByKey(
  payload: Payload,
  key: string,
): Promise<RecurringDonation | null> {
  // A key is 32 characters of base64url; anything else cannot match.
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(key)) return null

  const { docs } = await payload.find({
    collection: 'recurring-donations',
    where: { accessKey: { equals: key } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return docs[0] ?? null
}

const relationId = (value: number | { id: number } | null | undefined): number | null =>
  value === null || value === undefined ? null : typeof value === 'object' ? value.id : value

const getContactEmail = async (payload: Payload): Promise<string | null> => {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return settings.email?.trim() || null
  } catch {
    return null
  }
}

const isGone = (error: unknown): boolean =>
  error instanceof MollieApiError && (error.statusCode === 404 || error.statusCode === 410)

const updateRecurring = (
  payload: Payload,
  id: number,
  data: Partial<RecurringDonation>,
): Promise<RecurringDonation> =>
  payload.update({
    collection: 'recurring-donations',
    id,
    data,
    overrideAccess: true,
    // Moves made by the system, not by a person: see the collection's hook.
    context: { system: true },
  })

/* --- 1. The first payment ---------------------------------------------- */

/**
 * Starts the first payment of a recurring gift and returns where to send the
 * donor. Used by the monthly form and by the periodic link alike.
 *
 * iDEAL only. It is what creates a SEPA direct-debit mandate; a card would
 * create a card mandate, and every text here speaks of automatische incasso.
 */
export async function startFirstPayment(
  payload: Payload,
  recurring: RecurringDonation,
): Promise<{ paymentId: string; checkoutUrl: string }> {
  const mollie = getMollieClient()
  if (!mollie) throw new Error('Mollie is not configured')

  const messages = getMessages()

  // A new customer per gift: it keeps the subscription description unique
  // per customer, which Mollie requires, without inventing suffixes.
  const customerId =
    recurring.mollieCustomerId ||
    (
      await mollie.customers.create({
        name: recurring.donorName ?? '',
        email: recurring.donorEmail ?? '',
        metadata: { recurringDonation: recurring.id },
      })
    ).id

  const payment = await mollie.payments.create({
    amount: { currency: 'EUR', value: formatAmount(recurring.amount) },
    description:
      recurring.kind === 'periodic'
        ? messages.recurringPeriodicFirstDescription
        : messages.recurringMonthlyFirstDescription,
    customerId,
    sequenceType: SequenceType.first,
    method: PaymentMethod.ideal,
    redirectUrl: `${getSiteUrl()}/doneren/bedankt`,
    webhookUrl: getWebhookUrl(),
    metadata: { recurringDonation: recurring.id },
  })

  await updateRecurring(payload, recurring.id, { mollieCustomerId: customerId, status: 'pending' })

  await payload.create({
    collection: 'donations',
    overrideAccess: true,
    data: {
      molliePaymentId: payment.id,
      amount: recurring.amount,
      status: 'open',
      project: relationId(recurring.project),
      fund: recurring.fund || messages.donateFundGeneral,
      anonymous: false,
      donorName: recurring.donorName,
      donorEmail: recurring.donorEmail,
      recurringDonation: recurring.id,
    },
  })

  return { paymentId: payment.id, checkoutUrl: payment.getCheckoutUrl() ?? '' }
}

/* --- 2–4. What the webhook does with a payment -------------------------- */

/**
 * A collection made by a subscription arrives as a payment we never created.
 * Records it in Donaties, or returns null when the subscription is not ours.
 */
export async function recordSubscriptionPayment(
  payload: Payload,
  payment: Payment,
): Promise<Donation | null> {
  if (!payment.subscriptionId) return null

  const { docs } = await payload.find({
    collection: 'recurring-donations',
    where: { mollieSubscriptionId: { equals: payment.subscriptionId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const recurring = docs[0]

  if (!recurring) return null

  try {
    return await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        molliePaymentId: payment.id,
        amount: Number(payment.amount.value),
        status: 'open',
        project: relationId(recurring.project),
        fund: recurring.fund || getMessages().donateFundGeneral,
        anonymous: false,
        donorName: recurring.donorName,
        donorEmail: recurring.donorEmail,
        recurringDonation: recurring.id,
      },
    })
  } catch (error) {
    // Mollie calling twice at once: the other call created it. Use that one.
    const again = await payload.find({
      collection: 'donations',
      where: { molliePaymentId: { equals: payment.id } },
      limit: 1,
      overrideAccess: true,
    })
    if (again.docs[0]) return again.docs[0]
    throw error
  }
}

/** Called by the webhook after it has updated the donation for this payment. */
export async function afterRecurringPayment(
  payload: Payload,
  donation: Donation,
  payment: Payment,
): Promise<void> {
  const recurringId = relationId(donation.recurringDonation)
  if (!recurringId) return

  const recurring = await payload.findByID({
    collection: 'recurring-donations',
    id: recurringId,
    depth: 0,
    overrideAccess: true,
  })

  if (payment.sequenceType === SequenceType.first) {
    await afterFirstPayment(payload, recurring, payment)
    return
  }

  if (payment.subscriptionId) await syncSubscription(payload, recurring, payment)
}

async function afterFirstPayment(
  payload: Payload,
  recurring: RecurringDonation,
  payment: Payment,
): Promise<void> {
  const mollie = getMollieClient()
  if (!mollie || !recurring.mollieCustomerId) return

  if (payment.status === 'paid') {
    // Stopped while the donor was still at the bank: the mandate the payment
    // just created is withdrawn again, and nothing is scheduled.
    if (recurring.status === 'stopped') {
      if (payment.mandateId) {
        await mollie.customerMandates
          .revoke(payment.mandateId, { customerId: recurring.mollieCustomerId })
          .catch((error: unknown) => {
            if (!isGone(error)) throw error
          })
      }
      return
    }

    // Already running: a repeated webhook call, nothing more to do.
    if (recurring.mollieSubscriptionId || recurring.status !== 'pending') return

    if (!payment.mandateId) {
      payload.logger.error(`First payment ${payment.id} was paid but carries no mandate`)
      await sendNotification(
        payload,
        nlEmail.recurringNotification({
          event: 'kon niet starten',
          name: recurring.donorName ?? '',
          amount: formatEuro(recurring.amount),
          reason: 'De eerste betaling is binnen, maar Mollie gaf geen machtiging terug. Neem contact op met de gever.',
          url: adminUrlFor('recurring-donations', recurring.id),
        }),
      )
      return
    }

    const months = intervalMonths(recurring.interval)
    const paidOn = todayInAmsterdam(payment.paidAt ? new Date(payment.paidAt) : new Date())
    const startDate = addMonths(paidOn, months)
    const totalTerms = totalTermsFor(recurring.kind, recurring.interval)

    const subscription = await mollie.customerSubscriptions.create({
      customerId: recurring.mollieCustomerId,
      amount: { currency: 'EUR', value: formatAmount(recurring.amount) },
      interval: `${months} months`,
      description: statementText(recurring.kind),
      startDate,
      mandateId: payment.mandateId,
      // The first payment was the first term.
      times: totalTerms ? totalTerms - 1 : undefined,
      webhookUrl: getWebhookUrl(),
      metadata: { recurringDonation: recurring.id },
      // Two webhook calls racing here get the same subscription, not two.
      idempotencyKey: `recurring-donation-${recurring.id}-subscription`,
    })

    // The confirmation mail goes out from the status change; see onRecurringStatusChange.
    await updateRecurring(payload, recurring.id, {
      status: 'active',
      mollieMandateId: payment.mandateId,
      mollieSubscriptionId: subscription.id,
      startDate,
      nextPaymentDate: subscription.nextPaymentDate ?? startDate,
      totalTerms,
    })
    return
  }

  if (['failed', 'canceled', 'expired'].includes(payment.status) && recurring.status === 'pending') {
    // A periodic donor keeps their link and can try again; a monthly one
    // simply starts again on the website.
    await updateRecurring(payload, recurring.id, {
      status: recurring.kind === 'periodic' ? 'invited' : 'failed',
    })
  }
}

/**
 * Re-reads the subscription after one of its payments. Mollie sends no webhook
 * when a subscription ends, so this is where a gift the bank cancelled (AC01
 * at once; MD01, MS02 and the like after three failures) or a periodic gift
 * that has run its course is noticed.
 */
async function syncSubscription(
  payload: Payload,
  recurring: RecurringDonation,
  payment: Payment | null,
): Promise<RecurringDonation> {
  const mollie = getMollieClient()
  if (!mollie || !recurring.mollieSubscriptionId || !recurring.mollieCustomerId) return recurring

  const subscription = await mollie.customerSubscriptions.get(recurring.mollieSubscriptionId, {
    customerId: recurring.mollieCustomerId,
  })

  if (recurring.status !== 'active') return recurring

  const today = todayInAmsterdam()

  if (subscription.status === 'canceled') {
    const details = payment?.details as { bankReasonCode?: string; bankReason?: string } | null
    const reason = [details?.bankReasonCode, details?.bankReason].filter(Boolean).join(' — ')

    return updateRecurring(payload, recurring.id, {
      status: 'stopped',
      stoppedBy: 'mollie',
      stopReason: reason || null,
      endedOn: today,
      nextPaymentDate: null,
      deleteAfter: `${addMonths(today, RECURRING_RETENTION_MONTHS)}T00:00:00.000Z`,
    })
  }

  if (subscription.status === 'completed') {
    return updateRecurring(payload, recurring.id, {
      status: 'completed',
      endedOn: today,
      nextPaymentDate: null,
      deleteAfter: `${addMonths(today, RECURRING_RETENTION_MONTHS)}T00:00:00.000Z`,
    })
  }

  const next = subscription.nextPaymentDate ?? null
  if (next === recurring.nextPaymentDate) return recurring

  return updateRecurring(payload, recurring.id, { nextPaymentDate: next })
}

/* --- Stopping ---------------------------------------------------------- */

/**
 * Withdraws the mandate at Mollie, which also cancels every subscription on
 * it ("You will no longer be able to charge the customer's bank account").
 * Called from the collection's hook before a record may say "stopgezet".
 * Throws when Mollie cannot be reached, so the save fails rather than lies.
 */
export async function revokeAtMollie(
  recurring: Pick<RecurringDonation, 'mollieCustomerId' | 'mollieMandateId' | 'mollieSubscriptionId'> | undefined,
  payload: Payload,
): Promise<void> {
  if (!recurring?.mollieCustomerId) return

  const mollie = getMollieClient()
  if (!mollie) throw new Error('Mollie is niet ingesteld; de machtiging kan niet worden ingetrokken.')

  const customerId = recurring.mollieCustomerId

  try {
    if (recurring.mollieMandateId) {
      await mollie.customerMandates.revoke(recurring.mollieMandateId, { customerId })
    } else if (recurring.mollieSubscriptionId) {
      await mollie.customerSubscriptions.cancel(recurring.mollieSubscriptionId, { customerId })
    }
  } catch (error) {
    // Already revoked or cancelled is the outcome we wanted.
    if (isGone(error)) return
    payload.logger.error({ err: error }, 'Could not revoke a mandate at Mollie')
    throw error
  }
}

/* --- Messages on a status change --------------------------------------- */

/** Called by the collection's afterChange hook whenever a status changes. */
export async function onRecurringStatusChange(
  payload: Payload,
  recurring: RecurringDonation,
  previous: string | undefined,
): Promise<void> {
  const to = recurring.donorEmail ?? ''
  const name = recurring.donorName ?? ''
  const amount = formatEuro(recurring.amount)
  const adminUrl = adminUrlFor('recurring-donations', recurring.id)
  const contactEmail = await getContactEmail(payload)
  const key = recurring.accessKey ?? ''

  if (recurring.status === 'invited' && previous === 'draft') {
    const result = await sendMail(payload, {
      to,
      template: nlEmail.periodicInvite({
        name,
        amount,
        interval: intervalLabel(recurring.interval),
        terms: totalTermsFor('periodic', recurring.interval) ?? 0,
        url: startUrlFor(key),
      }),
    })
    if (!result.sent) payload.logger.error(`Periodic invitation for ${recurring.id} not sent: ${result.reason}`)
    return
  }

  if (recurring.status === 'active') {
    const result = await sendMail(payload, {
      to,
      template: nlEmail.recurringStarted({
        name,
        kind: recurring.kind,
        amount,
        interval: intervalLabel(recurring.interval),
        firstDate: recurring.startDate ? formatDate(recurring.startDate) : '',
        terms: recurring.totalTerms ?? null,
        stopUrl: stopUrlFor(key),
        contactEmail,
      }),
    })

    await sendNotification(
      payload,
      nlEmail.recurringNotification({
        event: recurring.kind === 'periodic' ? 'periodieke gift gestart' : 'maandelijkse gift gestart',
        name,
        amount,
        reason: result.sent
          ? null
          : 'De bevestiging aan de gever kon niet worden verstuurd. Stuur die zelf, met datum en bedrag van de eerste afschrijving.',
        url: adminUrl,
      }),
    )
    return
  }

  if (recurring.status === 'stopped') {
    await sendMail(payload, {
      to,
      template: nlEmail.recurringStopped({
        name,
        kind: recurring.kind,
        byBank: recurring.stoppedBy === 'mollie',
        contactEmail,
      }),
    })

    // An administrator who stopped it already knows.
    if (recurring.stoppedBy !== 'admin') {
      await sendNotification(
        payload,
        nlEmail.recurringNotification({
          event: recurring.stoppedBy === 'mollie' ? 'gestopt door de bank' : 'stopgezet door de gever',
          name,
          amount,
          reason: recurring.stopReason ?? null,
          url: adminUrl,
        }),
      )
    }
    return
  }

  if (recurring.status === 'completed') {
    await sendMail(payload, { to, template: nlEmail.recurringCompleted({ name }) })
  }
}

/* --- Receipts ---------------------------------------------------------- */

/** The dated confirmation of a one-off gift. Collections of a running gift are confirmed in the next pre-notification. */
export async function sendDonationReceipt(payload: Payload, donation: Donation): Promise<void> {
  if (donation.anonymous || !donation.donorEmail) return

  const paidOn = todayInAmsterdam(donation.paidAt ? new Date(donation.paidAt) : new Date())
  const result = await sendMail(payload, {
    to: donation.donorEmail,
    template: nlEmail.donationReceipt({
      name: donation.donorName ?? '',
      amount: formatEuro(donation.amount),
      date: formatDate(paidOn),
      fund: donation.fund || getMessages().donateFundGeneral,
    }),
  })

  if (!result.sent) payload.logger.error(`Receipt for donation ${donation.id} not sent: ${result.reason}`)
}

/* --- 5. Pre-notifications ---------------------------------------------- */

export type PreNoticeResult = { sent: number; failed: number; late: number }

/**
 * The daily job. For every running gift whose next collection is within
 * PRENOTICE_DAYS and not yet announced, re-reads the date from Mollie and
 * mails the donor.
 *
 * Idempotent: the announced date is stored, so a duplicated cron run sends
 * nothing twice, and a missed one is caught up by the next. A message that
 * fails to send is tried again the next day, and the foundation hears about it.
 */
export async function sendPreNotifications(payload: Payload): Promise<PreNoticeResult> {
  const today = todayInAmsterdam()
  const horizon = addDays(today, PRENOTICE_DAYS)
  const result: PreNoticeResult = { sent: 0, failed: 0, late: 0 }
  const contactEmail = await getContactEmail(payload)

  const { docs } = await payload.find({
    collection: 'recurring-donations',
    where: { status: { equals: 'active' } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  for (const stored of docs) {
    if (!stored.nextPaymentDate || stored.nextPaymentDate > horizon) continue
    if (stored.notifiedFor === stored.nextPaymentDate) continue

    try {
      const recurring = await syncSubscription(payload, stored, null)
      const next = recurring.nextPaymentDate

      if (recurring.status !== 'active' || !next || next > horizon || recurring.notifiedFor === next) continue

      // The most recent collection that came in, to confirm it in passing.
      const { docs: paid } = await payload.find({
        collection: 'donations',
        where: {
          and: [{ recurringDonation: { equals: recurring.id } }, { status: { equals: 'paid' } }],
        },
        sort: '-paidAt',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const last = paid[0]

      const sent = await sendMail(payload, {
        to: recurring.donorEmail ?? '',
        template: nlEmail.recurringPreNotice({
          name: recurring.donorName ?? '',
          kind: recurring.kind,
          amount: formatEuro(recurring.amount),
          date: formatDate(next),
          previous:
            last?.paidAt && recurring.notifiedFor
              ? { amount: formatEuro(last.amount), date: formatDate(todayInAmsterdam(new Date(last.paidAt))) }
              : null,
          stopUrl: stopUrlFor(recurring.accessKey ?? ''),
          contactEmail,
        }),
      })

      if (!sent.sent) {
        result.failed += 1
        await sendNotification(
          payload,
          nlEmail.recurringNotification({
            event: 'vooraankondiging niet verstuurd',
            name: recurring.donorName ?? '',
            amount: formatEuro(recurring.amount),
            reason: `De afschrijving van ${formatDate(next)} kon niet per e-mail worden aangekondigd (${sent.reason}). Morgen wordt het opnieuw geprobeerd.`,
            url: adminUrlFor('recurring-donations', recurring.id),
          }),
        )
        continue
      }

      if (daysUntil(today, next) < 3) result.late += 1

      await updateRecurring(payload, recurring.id, { notifiedFor: next })
      result.sent += 1
    } catch (error) {
      result.failed += 1
      payload.logger.error({ err: error }, `Pre-notification for recurring donation ${stored.id} failed`)
    }
  }

  return result
}
