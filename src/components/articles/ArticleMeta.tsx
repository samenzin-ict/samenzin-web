import { getMessages } from '@/i18n'
import { formatLongDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * The byline: "Door Jan de Vries · 10 juni 2026".
 *
 * The date is a <time> element with a machine-readable datetime, so it is not
 * just a string that happens to look like a date.
 */
export function ArticleMeta({
  author,
  publishedAt,
  className,
}: {
  author?: string | null
  publishedAt?: string | null
  className?: string
}) {
  const messages = getMessages()
  const formatted = formatLongDate(publishedAt)

  if (!author && !formatted) return null

  return (
    <p className={cn('text-sm', className)}>
      {author ? `${messages.articlesBy} ${author}` : null}
      {author && formatted ? ' · ' : null}
      {formatted && publishedAt ? <time dateTime={publishedAt}>{formatted}</time> : null}
    </p>
  )
}
