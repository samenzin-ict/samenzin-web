import { defaultLocale, getMessages } from '@/i18n'
import type { Event } from '@/payload-types'

const euro = new Intl.NumberFormat(defaultLocale, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** "Gratis", or the price. Nothing when neither is known. */
export function PriceBadge({ price }: { price?: Event['price'] }) {
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
