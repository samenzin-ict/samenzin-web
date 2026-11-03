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
 * Three frequency tabs, three different things (docs/SEPA_otomatik_incasso.pdf, B1):
 *
 * - **Eenmalig** pays once, anonymously if the donor wants.
 * - **Maandelijks** pays the first month by iDEAL and thereby lays down a SEPA
 *   mandate; Mollie collects every month after that. Never anonymous: the
 *   donor must be told before each collection and must be able to stop. Before
 *   the button the page says who collects, how much, how often, from when and
 *   how to stop (B2), and the donor ticks that they agree.
 * - **Periodieke gift** is not started here at all. It needs a written
 *   agreement signed before anything is collected, so the tab explains how to
 *   get one; once it is signed the foundation sends a link to start.
 *
 * `recurringEnabled` is false until mail and the daily job are set up, since
 * the monthly gift's promises depend on both. The monthly tab then explains
 * instead of offering a mandate that could not be kept.
 *
 * Built on a server action, so it still submits without JavaScript. The amount
 * buttons are a convenience on top of a plain number field, which is what is
 * actually submitted.
 *
 * `enabled` is false until MOLLIE_API_KEY is set. The form is still shown, so
 * the page can be reviewed and so a visitor can see what is coming, but the
 * button cannot start a payment that would fail.
 */
/** A project a gift can be earmarked for. */
export type Fund = { id: number; title: string }

export function DonationForm({
  messages,
  funds,
  enabled,
  recurringEnabled,
  firstCollectionDate,
  contactEmail,
  selectedFundId,
}: {
  messages: Messages
  funds: Fund[]
  enabled: boolean
  recurringEnabled: boolean
  /** Roughly when the first incasso would fall, already formatted. */
  firstCollectionDate: string
  contactEmail: string | null
  /** Preselected from ?project= on the donate page. Null means general. */
  selectedFundId?: number | null
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
    mandate: useId(),
  }

  const fieldError = (key: 'amount' | 'name' | 'email' | 'mandate') => state.errors?.[key]

  // The form itself is for one-off gifts and, once possible, monthly ones.
  const showForm = frequency === 'once' || (frequency === 'monthly' && recurringEnabled)
  const monthly = frequency === 'monthly'
  // A monthly donor is never anonymous; see the comment above.
  const showIdentity = monthly || !anonymous
  const amountLabel = `€ ${amount || '0'}`

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
  const methods = monthly
    ? // The first month by iDEAL, which lays down the mandate; then incasso.
      ['iDEAL', 'SEPA-incasso']
    : ['iDEAL', 'SEPA-incasso', 'Mastercard', 'Creditcard']

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.errors?.form ? (
        <p
          role="alert"
          className="rounded-md border border-destructive bg-card p-3 text-destructive"
        >
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

      <input type="hidden" name="frequency" value={frequency} />

      {monthly && recurringEnabled ? <p>{messages.donateMonthlyIntro}</p> : null}

      {showForm ? (
        <>
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
            {/*
          The value is the project's id, not its title. A title can be edited
          and the gift has to stay attached to the project it was meant for;
          the action stores the title alongside as a label.
        */}
            <select
              id={ids.fund}
              name="project"
              defaultValue={selectedFundId ? String(selectedFundId) : ''}
              className={inputClass(false)}
            >
              <option value="">{messages.donateFundGeneral}</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.title}
                </option>
              ))}
            </select>
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
          {showIdentity ? (
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

          {monthly ? null : (
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
          )}

          <p id={ids.privacy} className="text-sm">
            {monthly ? messages.donateMonthlyPrivacyNotice : messages.donatePrivacyNotice}
          </p>

          {monthly ? (
            /*
          What the donor agrees to, in full, before the button (B2): who
          collects, how much, how often, from when, and how to stop.
        */
            <fieldset className="space-y-3 rounded-md border border-border bg-muted p-4">
              <legend className="sr-only">{messages.donateMandateTitle}</legend>
              <p className="font-semibold text-primary" aria-hidden="true">
                {messages.donateMandateTitle}
              </p>
              <p className="text-sm">
                {messages.donateMandateSummary
                  .replace('%amount', amountLabel)
                  .replace('%date', firstCollectionDate)}
              </p>
              <p className="text-sm">
                {contactEmail
                  ? messages.donateMandateStopWithEmail.replace('%email', contactEmail)
                  : messages.donateMandateStop}
              </p>
              <div className="flex items-start gap-2">
                <input
                  id={ids.mandate}
                  name="mandate"
                  type="checkbox"
                  required
                  aria-invalid={Boolean(fieldError('mandate'))}
                  aria-describedby={fieldError('mandate') ? `${ids.mandate}-error` : undefined}
                  className="mt-1 size-5"
                />
                <label htmlFor={ids.mandate} className="font-semibold text-primary">
                  {messages.donateMandateConsent.replace('%amount', amountLabel)}
                </label>
              </div>
              {fieldError('mandate') ? (
                <p id={`${ids.mandate}-error`} className="text-sm text-destructive">
                  {fieldError('mandate')}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {/*
        The explanation lives once, in the notice above the form. Repeating
        it next to the button would say the same thing twice.
      */}
          <Button type="submit" variant="cta" size="lg" disabled={isPending || !enabled}>
            {isPending
              ? messages.donateSubmitting
              : (monthly ? messages.donateMonthlySubmit : messages.donateSubmitWithAmount).replace(
                  '%s',
                  amountLabel,
                )}
          </Button>
        </>
      ) : (
        <div className="space-y-3 rounded-md border border-border bg-muted p-4">
          <p className="font-semibold text-primary">
            {frequency === 'periodic'
              ? messages.donatePeriodicTitle
              : messages.donateRecurringTitle}
          </p>
          {frequency === 'periodic' ? (
            <>
              <p className="text-sm">{messages.donatePeriodicBody}</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                <li>{messages.donatePeriodicStepOne}</li>
                <li>{messages.donatePeriodicStepTwo}</li>
                <li>{messages.donatePeriodicStepThree}</li>
              </ol>
            </>
          ) : (
            <p className="text-sm">{messages.donateRecurringBody}</p>
          )}
          <Button asChild variant="default" size="sm">
            <Link href="/contact">{messages.donateRecurringAction}</Link>
          </Button>
        </div>
      )}
    </form>
  )
}
