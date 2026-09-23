import { formatDayBlock } from '@/lib/dates'

/**
 * The dark square with the day over the month, as drawn in the mockup.
 *
 * aria-hidden: the readable date sits next to it in a <time> element. A screen
 * reader hearing "20 MRT" split across two lines is worse than hearing the
 * full date once.
 */
export function EventDateBlock({ startsAt }: { startsAt: string }) {
  const { day, month } = formatDayBlock(startsAt)

  return (
    <div
      aria-hidden
      className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground"
    >
      <span className="font-heading text-lg leading-none">{day}</span>
      <span className="text-xs uppercase">{month}</span>
    </div>
  )
}
