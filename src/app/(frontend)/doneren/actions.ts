'use server'

import { redirect } from 'next/navigation'

import { getMessages } from '@/i18n'
import { formatAmount, getMollieClient, MAX_AMOUNT, MIN_AMOUNT } from '@/lib/mollie'
import { getPayloadClient } from '@/lib/payload'
import { getSiteUrl } from '@/lib/site-url'

export type DonationFormState = {
  status: 'idle' | 'error'
  errors?: Partial<Record<'amount' | 'name' | 'email' | 'form', string>>
  values?: { amount: string; name: string; email: string; anonymous: boolean; fund: string }
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

  const anonymous = formData.get('anonymous') === 'on'
  const values = {
    amount: readField(formData, 'amount'),
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    fund: readField(formData, 'fund'),
    anonymous,
  }

  const mollie = getMollieClient()

  if (!mollie) {
    return { status: 'error', errors: { form: messages.donateUnavailableTitle }, values }
  }

  const amount = Number(values.amount.replace(',', '.'))
  const errors: DonationFormState['errors'] = {}

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
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

  const siteUrl = getSiteUrl()
  let checkoutUrl: string

  try {
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: formatAmount(amount) },
      description: values.fund
        ? `${messages.donateDescription} — ${values.fund}`
        : messages.donateDescription,
      redirectUrl: `${siteUrl}/doneren/bedankt`,
      // Mollie cannot reach a laptop, so local runs simply get no callback and
      // the record stays "open" until someone reconciles it.
      webhookUrl: process.env.MOLLIE_WEBHOOK_URL?.trim() || undefined,
      metadata: { fund: values.fund || null },
    })

    const payload = await getPayloadClient()

    await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        molliePaymentId: payment.id,
        amount,
        status: 'open',
        fund: values.fund || null,
        anonymous,
        donorName: anonymous ? null : values.name,
        donorEmail: anonymous ? null : values.email,
      },
    })

    checkoutUrl = payment.getCheckoutUrl() ?? ''
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
