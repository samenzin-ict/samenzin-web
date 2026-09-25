import type { Messages } from '@/i18n'

/** The green note the mockup puts beside the "Volgende stap" button. */
export function IntakeNotice({ messages }: { messages: Messages }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
      <span aria-hidden className="font-semibold text-accent">
        i
      </span>
      {messages.volunteerIntakeNotice}
    </p>
  )
}
