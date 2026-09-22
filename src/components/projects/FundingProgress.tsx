import { getMessages } from '@/i18n'
import { defaultLocale } from '@/i18n'

const euro = new Intl.NumberFormat(defaultLocale, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/**
 * The fundraising bar from docs/design/06-projecten-*.png: a teal fill on a
 * light track, with the amounts underneath.
 *
 * The bar is aria-hidden and the amounts are read instead. A progress element
 * announced as "62 percent" tells a screen reader user less than
 * "EUR 2.000 of EUR 5.000 raised", and announcing both says the same thing
 * twice. The visible text is the accessible text.
 *
 * Renders nothing without a goal, so a project that is not raising money does
 * not show an empty bar.
 */
export function FundingProgress({ goal, raised }: { goal?: number | null; raised?: number | null }) {
  if (!goal || goal <= 0) return null

  const amountRaised = Math.max(0, raised ?? 0)
  // Capped so passing the target cannot overflow the track.
  const percentage = Math.min(100, Math.round((amountRaised / goal) * 100))

  return (
    <div className="space-y-2">
      <div
        aria-hidden
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} />
      </div>

      <p className="text-sm">
        <span className="font-semibold text-primary">{euro.format(amountRaised)}</span>{' '}
        {getMessages().projectFundingOf} {euro.format(goal)}{' '}
        {getMessages().projectFundingRaised}
      </p>
    </div>
  )
}
