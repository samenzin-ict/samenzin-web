import { defaultLocale, getMessages } from '@/i18n'

/*
 * Structural rather than tied to Event, so courses use the same badge. Two
 * components that both render a price would drift apart.
 */
export type Priced = { isFree?: boolean | null; amount?: number | null } | null

const euro = new Intl.NumberFormat(defaultLocale, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** "Gratis", or the price. Nothing when neither is known. */
export function PriceBadge({ price }: { price?: Priced }) {
  const messages = getMessages()

  if (price?.isFree) {
    return (
      <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
        {messages.eventsFree}
      </span>
    )
  }

  if (typeof price?.amount === 'number') {
    return (
      <span className="shrink-0 rounded-full bg-cta px-3 py-1 text-xs font-medium text-cta-foreground">
        {euro.format(price.amount)}
      </span>
    )
  }

  return null
}
