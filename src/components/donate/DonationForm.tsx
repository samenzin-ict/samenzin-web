'use client'

import Link from 'next/link'
import { useActionState, useId, useState } from 'react'

import { startDonation, type DonationFormState } from '@/app/(frontend)/doneren/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'
import { SUGGESTED_AMOUNTS } from '@/lib/mollie'

const initialState: DonationFormState = { status: 'idle' }

type Frequency = 'once' | 'monthly' | 'periodic'

/**
 * The donation form of docs/design/04-doneren.png.
 *
 * The three frequency tabs are all drawn, because they are what the page
 * offers. Only "Eenmalig" can be paid here: a monthly or five-year gift needs a
 * SEPA mandate, which is ROADMAP 3.3 and has legal weight, so choosing one
 * explains how it is arranged instead of showing a pay button that cannot
 * honour what it promises.
 *
 * Built on a server action, so it still submits without JavaScript. The amount
 * buttons are a convenience on top of a plain number field, which is what is
 * actually submitted.
 *
 * `enabled` is false until MOLLIE_API_KEY is set. The form is still shown, so
 * the page can be reviewed and so a visitor can see what is coming, but the
 * button cannot start a payment that would fail.
 */
export function DonationForm({
  messages,
  funds,
  enabled,
}: {
  messages: Messages
  funds: string[]
  enabled: boolean
}) {
  const [state, formAction, isPending] = useActionState(startDonation, initialState)
  const [amount, setAmount] = useState<string>(String(SUGGESTED_AMOUNTS[1]))
  const [anonymous, setAnonymous] = useState(false)
  const [frequency, setFrequency] = useState<Frequency>('once')

  const ids = {
    amount: useId(),
    fund: useId(),
    name: useId(),
    email: useId(),
    anonymous: useId(),
    privacy: useId(),
    frequency: useId(),
  }

  const fieldError = (key: 'amount' | 'name' | 'email') => state.errors?.[key]

  const inputClass = (invalid: boolean) =>
    cn(
      'min-h-11 w-full rounded-md border bg-card px-3 py-2 text-foreground',
      invalid ? 'border-destructive' : 'border-input',
    )

  const tabs: { value: Frequency; label: string }[] = [
    { value: 'once', label: messages.donateOnce },
    { value: 'monthly', label: messages.donateMonthly },
    { value: 'periodic', label: messages.donatePeriodic },
  ]

  /*
   * Written out rather than shown as brand logos. The marks belong to the
   * payment providers and are not ours to ship; the names carry the same
   * information. Mollie shows the real logos on its own checkout.
   */
  const methods = ['iDEAL', 'SEPA-incasso', 'Mastercard', 'Creditcard']

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.errors?.form ? (
        <p role="alert" className="rounded-md border border-destructive bg-card p-3 text-destructive">
          {state.errors.form}
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="sr-only">{messages.donateFrequencyLabel}</legend>
        <div className="flex rounded-full border border-border bg-muted p-1">
          {tabs.map((tab) => {
            const isCurrent = frequency === tab.value

            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => setFrequency(tab.value)}
                className={cn(
                  'min-h-11 flex-1 rounded-full px-3 text-sm',
                  isCurrent ? 'bg-card font-semibold text-primary shadow-sm' : 'text-foreground',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="sr-only">{messages.donateAmountLabel}</legend>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_AMOUNTS.map((suggested) => {
              const isSelected = amount === String(suggested)

              return (
                <button
                  key={suggested}
                  type="button"
                  // Reports selection rather than relying on colour alone.
                  aria-pressed={isSelected}
                  onClick={() => setAmount(String(suggested))}
                  className={cn(
                    'min-h-11 min-w-20 rounded-md border px-4 font-medium',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-cta bg-cta text-cta-foreground',
                  )}
                >
                  € {suggested}
                </button>
              )
            })}
          </div>

          <div className="space-y-1">
            <label htmlFor={ids.amount} className="block text-sm font-semibold text-primary">
              {messages.donateOtherAmount}
            </label>
            <input
              id={ids.amount}
              name="amount"
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={Boolean(fieldError('amount'))}
              aria-describedby={fieldError('amount') ? `${ids.amount}-error` : undefined}
              className={cn(inputClass(Boolean(fieldError('amount'))), 'max-w-40')}
            />
          </div>
        </div>

        {fieldError('amount') ? (
          <p id={`${ids.amount}-error`} className="text-sm text-destructive">
            {fieldError('amount')}
          </p>
        ) : null}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor={ids.fund} className="block font-semibold text-primary">
          {messages.donateFundLabel}
        </label>
        <select id={ids.fund} name="fund" className={inputClass(false)}>
          <option value="">{messages.donateFundGeneral}</option>
          {funds.map((fund) => (
            <option key={fund} value={fund}>
              {fund}
            </option>
          ))}
        </select>
        {funds.length > 0 ? (
          <p className="text-sm">{funds.join(' · ')}</p>
        ) : null}
      </div>

      <div>
        <h2 className="sr-only">{messages.donatePaymentMethods}</h2>
        <ul className="flex flex-wrap gap-2">
          {methods.map((method) => (
            <li
              key={method}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              {method}
            </li>
          ))}
        </ul>
      </div>

      {/*
        Name and e-mail are only asked for when the gift is not anonymous.
        Hiding them is not enough on its own; the action also refuses to store
        them in that case.
      */}
      {!anonymous ? (
        <>
          <div className="space-y-1.5">
            <label htmlFor={ids.name} className="block font-semibold text-primary">
              {messages.donateNameLabel}
            </label>
            <input
              id={ids.name}
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state.values?.name}
              aria-invalid={Boolean(fieldError('name'))}
              aria-describedby={fieldError('name') ? `${ids.name}-error` : undefined}
              className={inputClass(Boolean(fieldError('name')))}
            />
            {fieldError('name') ? (
              <p id={`${ids.name}-error`} className="text-sm text-destructive">
                {fieldError('name')}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.email} className="block font-semibold text-primary">
              {messages.donateEmailLabel}
            </label>
            <input
              id={ids.email}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values?.email}
              aria-invalid={Boolean(fieldError('email'))}
              aria-describedby={fieldError('email') ? `${ids.email}-error` : ids.privacy}
              className={inputClass(Boolean(fieldError('email')))}
            />
            {fieldError('email') ? (
              <p id={`${ids.email}-error`} className="text-sm text-destructive">
                {fieldError('email')}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="flex items-start gap-2">
        <input
          id={ids.anonymous}
          name="anonymous"
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="mt-1 size-5"
        />
        <label htmlFor={ids.anonymous}>
          <span className="font-semibold text-primary">{messages.donateAnonymousLabel}</span>
          <span className="block text-sm">{messages.donateAnonymousHint}</span>
        </label>
      </div>

      <p id={ids.privacy} className="text-sm">
        {messages.donatePrivacyNotice}
      </p>

      {frequency === 'once' ? (
        <>
          {/*
            The explanation lives once, in the notice above the form. Repeating
            it next to the button would say the same thing twice.
          */}
          <Button type="submit" variant="cta" size="lg" disabled={isPending || !enabled}>
            {isPending
              ? messages.donateSubmitting
              : messages.donateSubmitWithAmount.replace('%s', `€ ${amount || '0'}`)}
          </Button>
        </>
      ) : (
        <div className="space-y-3 rounded-md border border-border bg-muted p-4">
          <p className="font-semibold text-primary">{messages.donateRecurringTitle}</p>
          <p className="text-sm">{messages.donateRecurringBody}</p>
          <Button asChild variant="default" size="sm">
            <Link href="/contact">{messages.donateRecurringAction}</Link>
          </Button>
        </div>
      )}
    </form>
  )
}
