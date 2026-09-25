import { cn } from '@/lib/utils'
import type { Messages } from '@/i18n'

export const VOLUNTEER_STEPS = [
  { slug: '/vrijwilligers', key: 'volunteerStepDetails' },
  { slug: '/vrijwilligers/interesses', key: 'volunteerStepInterests' },
  { slug: '/vrijwilligers/beschikbaarheid', key: 'volunteerStepAvailability' },
  { slug: '/vrijwilligers/bevestiging', key: 'volunteerStepConfirm' },
] as const

/**
 * The four-segment progress bar of docs/design/07.
 *
 * An ordered list rather than a row of divs, so a screen reader announces
 * "3 of 4". The current step carries aria-current; colour alone never
 * communicates which step you are on.
 */
export function StepIndicator({ messages, current }: { messages: Messages; current: number }) {
  return (
    <nav aria-label={messages.volunteerStepsLabel}>
      <ol className="flex flex-wrap gap-1 rounded-full border border-primary p-1 text-sm">
        {VOLUNTEER_STEPS.map((step, index) => {
          const isCurrent = index === current
          const isDone = index < current

          return (
            <li key={step.slug} className="flex-1">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex min-h-11 items-center justify-center rounded-full px-3 text-center',
                  isCurrent && 'bg-cta font-semibold text-cta-foreground',
                  isDone && 'bg-primary text-primary-foreground',
                  !isCurrent && !isDone && 'text-primary',
                )}
              >
                {messages[step.key]}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="sr-only">{messages.volunteerStepOf.replace('%s', String(current + 1))}</p>
    </nav>
  )
}
