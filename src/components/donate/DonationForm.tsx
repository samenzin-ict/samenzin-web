'use client'

import { useActionState, useId, useState } from 'react'

import { startDonation, type DonationFormState } from '@/app/(frontend)/doneren/actions'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/i18n'
import { cn } from '@/lib/utils'
import { SUGGESTED_AMOUNTS } from '@/lib/mollie'

const initialState: DonationFormState = { status: 'idle' }

/**
 * The donation form, modelled on docs/design/04-doneren.png.
 *
 * One-off gifts only. The monthly and five-year tabs in the mockup need a
 * mandate and are ROADMAP 3.3; drawing them now would be drawing controls that
 * cannot work.
 *
 * Built on a server action, so it still submits without JavaScript. The amount
 * buttons are a convenience on top of a plain number field, which is what is
 * actually submitted.
 */
export function DonationForm({ messages, funds }: { messages: Messages; funds: string[] }) {
  const [state, formAction, isPending] = useActionState(startDonation, initialState)
  const [amount, setAmount] = useState<string>(String(SUGGESTED_AMOUNTS[1]))
  const [anonymous, setAnonymous] = useState(false)

  const ids = {
    amount: useId(),
    fund: useId(),
    name: useId(),
    email: useId(),
    anonymous: useId(),
    privacy: useId(),
  }

  const fieldError = (key: 'amount' | 'name' | 'email') => state.errors?.[key]

  const inputClass = (invalid: boolean) =>
    cn(
      'min-h-11 w-full rounded-md border bg-card px-3 py-2 text-foreground',
      invalid ? 'border-destructive' : 'border-input',
    )

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.errors?.form ? (
        <p role="alert" className="rounded-md border border-destructive bg-card p-3 text-destructive">
          {state.errors.form}
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="font-semibold text-primary">{messages.donateAmountLabel}</legend>

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
                    : 'border-input bg-card text-primary',
                )}
              >
                € {suggested}
              </button>
            )
          })}
        </div>

        <label htmlFor={ids.amount} className="block pt-2 text-sm">
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
        {fieldError('amount') ? (
          <p id={`${ids.amount}-error`} className="text-sm text-destructive">
            {fieldError('amount')}
          </p>
        ) : null}
      </fieldset>

      {funds.length > 0 ? (
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
        </div>
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

      {/*
        Name and address are only asked for when the gift is not anonymous.
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

      <p id={ids.privacy} className="text-sm">
        {messages.donatePrivacyNotice}
      </p>

      <Button type="submit" variant="cta" size="lg" disabled={isPending}>
        {isPending ? messages.donateSubmitting : `${messages.donateSubmit} € ${amount || '0'}`}
      </Button>
    </form>
  )
}
