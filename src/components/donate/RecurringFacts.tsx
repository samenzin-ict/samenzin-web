import type { Messages } from '@/i18n'
import { formatDate, formatEuro, intervalLabel, totalTermsFor } from '@/lib/donations'
import type { RecurringDonation } from '@/payload-types'

/** What a running or proposed gift amounts to, on the pages behind the e-mail links. */
export function RecurringFacts({
  recurring,
  messages,
  showNext = false,
}: {
  recurring: RecurringDonation
  messages: Messages
  showNext?: boolean
}) {
  const terms = recurring.totalTerms ?? totalTermsFor(recurring.kind, recurring.interval)
  const fund =
    recurring.fund ||
    (typeof recurring.project === 'object' && recurring.project ? recurring.project.title : null) ||
    messages.donateFundGeneral

  const rows: { label: string; value: string }[] = [
    { label: messages.recurringAmountLabel, value: formatEuro(recurring.amount) },
    { label: messages.recurringIntervalLabel, value: intervalLabel(recurring.interval) },
    ...(terms ? [{ label: messages.recurringTermsLabel, value: String(terms) }] : []),
    { label: messages.recurringProjectLabel, value: fund },
    ...(showNext && recurring.nextPaymentDate
      ? [{ label: messages.recurringNextLabel, value: formatDate(recurring.nextPaymentDate) }]
      : []),
  ]

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-md border border-border bg-card p-4">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="font-semibold text-primary">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
