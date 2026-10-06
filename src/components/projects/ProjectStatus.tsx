import { getMessages } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Project } from '@/payload-types'

/**
 * Whether a project is running or still being prepared.
 *
 * Shown on the card and on the project page, because the distinction is the
 * first thing a fonds or a gemeente looks for and the easiest thing for a
 * reader to get wrong on their own. A plan described in the present tense
 * reads as a promise; a label saying "In voorbereiding" does not.
 *
 * Colour alone does not carry it — the word is in the label — so it still works
 * for a reader who cannot tell the two greens apart.
 */
export function ProjectStatus({
  phase,
  className,
}: {
  phase: Project['phase']
  className?: string
}) {
  const messages = getMessages()
  const running = phase === 'loopt'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        running ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', running ? 'bg-accent' : 'bg-muted-foreground')}
      />
      {running ? messages.projectStatusRunning : messages.projectStatusPreparing}
    </span>
  )
}
