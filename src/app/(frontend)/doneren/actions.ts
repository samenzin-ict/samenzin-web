'use server'

import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import { isRecurringEnabled, MAX_RECURRING_AMOUNT, startFirstPayment } from '@/lib/donations'
import {
  formatAmount,
  getMollieClient,
  getWebhookUrl,
  MAX_AMOUNT,
  MIN_AMOUNT,
} from '@/lib/mollie'
import { getPayloadClient } from '@/lib/payload'
import { getSiteUrl } from '@/lib/site-url'

import { rememberPayment } from './payment-cookie'

export type DonationFormState = {
  status: 'idle' | 'error'
  errors?: Partial<Record<'amount' | 'name' | 'email' | 'mandate' | 'form', string>>
  values?: { amount: string; name: string; email: string; anonymous: boolean; project: string }
}

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Starts a donation and sends the visitor to Mollie's own checkout.
 *
 * The record is created as "open" before the visitor leaves. It is never
 * trusted as paid here: only the webhook, after re-fetching the payment from
 * Mollie, may change that (ARCHITECTURE.md). The return URL proves nothing —
 * anyone can visit it.
 *
 * Card and bank details never touch this application.
 */
export async function startDonation(
  _previous: DonationFormState,
  formData: FormData,
): Promise<DonationFormState> {
  const messages = getMessages()

  // Only one-off gifts can be anonymous; see DonationForm.
  const monthly = formData.get('frequency') === 'monthly'
  const anonymous = !monthly && formData.get('anonymous') === 'on'
  const values = {
    amount: readField(formData, 'amount'),
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    project: readField(formData, 'project'),
    anonymous,
  }

  const mollie = getMollieClient()

  if (!mollie) {
    return { status: 'error', errors: { form: messages.donateUnavailableTitle }, values }
  }

  const amount = Number(values.amount.replace(',', '.'))
  const errors: DonationFormState['errors'] = {}

  if (monthly) {
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_RECURRING_AMOUNT) {
      errors.amount = messages.donateErrorMonthlyAmount
    }
    // The donor's agreement to the mandate, as summarised above the box.
    if (formData.get('mandate') !== 'on') errors.mandate = messages.donateErrorMandate
  } else if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    errors.amount = messages.donateErrorAmount
  }

  // A name and address are only asked for, and only stored, when the gift is
  // not anonymous. What is not collected cannot leak.
  if (!anonymous) {
    if (!values.name) errors.name = messages.donateErrorName
    if (!EMAIL_PATTERN.test(values.email)) errors.email = messages.donateErrorEmail
  }

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors, values }
  }

  const payload = await getPayloadClient()

  /*
   * Which project the gift is for, resolved from the id the form posted.
   *
   * Looked up rather than trusted: the id comes from a select that anybody can
   * edit, and an unpublished or deleted project must not become a destination.
   * `overrideAccess: false` is what enforces that — the same rule that governs
   * the public project pages. An unrecognised id falls back to a general gift
   * rather than refusing the donation.
   */
  const projectId = Number(values.project)
  const project =
    Number.isInteger(projectId) && projectId > 0
      ? await payload
          .findByID({ collection: 'projects', id: projectId, depth: 0, overrideAccess: false })
          .catch(() => null)
      : null

  const siteUrl = getSiteUrl()
  let checkoutUrl: string

  if (monthly) {
    // Checked again here: the tab could be posted by hand.
    if (!isRecurringEnabled()) {
      return { status: 'error', errors: { form: messages.donateErrorGeneric }, values }
    }

    try {
      // Rounded to cents: this amount is collected every month.
      const monthlyAmount = Math.round(amount * 100) / 100
      const recurring = await payload.create({
        collection: 'recurring-donations',
        overrideAccess: true,
        context: { system: true },
        data: {
          kind: 'monthly',
          interval: 'monthly',
          status: 'pending',
          amount: monthlyAmount,
          donorName: values.name,
          donorEmail: values.email,
          project: project?.id ?? null,
          fund: project?.title ?? messages.donateFundGeneral,
        },
      })
      const started = await startFirstPayment(payload, recurring)

      checkoutUrl = started.checkoutUrl
      await rememberPayment(started.paymentId, siteUrl)
    } catch (error) {
      console.error('Could not start a monthly gift', error)
      return { status: 'error', errors: { form: messages.donateErrorGeneric }, values }
    }

    if (!checkoutUrl) {
      return { status: 'error', errors: { form: messages.donateErrorGeneric }, values }
    }

    redirect(checkoutUrl)
  }

  try {
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: formatAmount(amount) },
      description: project
        ? `${messages.donateDescription} — ${project.title}`
        : messages.donateDescription,
      redirectUrl: `${siteUrl}/doneren/bedankt`,
      // None locally: the record then stays "open". See getWebhookUrl.
      webhookUrl: getWebhookUrl(),
      metadata: { project: project?.slug ?? null },
    })

    await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        molliePaymentId: payment.id,
        amount,
        status: 'open',
        project: project?.id ?? null,
        // The title as it reads now, so a later rename cannot rewrite history.
        // A general gift says so rather than leaving the field empty.
        fund: project?.title ?? messages.donateFundGeneral,
        anonymous,
        donorName: anonymous ? null : values.name,
        donorEmail: anonymous ? null : values.email,
      },
    })

    checkoutUrl = payment.getCheckoutUrl() ?? ''

    await rememberPayment(payment.id, siteUrl)
  } catch (error) {
    // Logged for the maintainer; the visitor is told nothing about our
    // internals, only that it did not work.
    console.error('Could not start a Mollie payment', error)
    return { status: 'error', errors: { form: messages.donateErrorGeneric }, values }
  }

  if (!checkoutUrl) {
    return { status: 'error', errors: { form: messages.donateErrorGeneric }, values }
  }

  // Outside the try: redirect works by throwing, and catching it here would
  // turn a successful start into an error message.
  redirect(checkoutUrl)
}
