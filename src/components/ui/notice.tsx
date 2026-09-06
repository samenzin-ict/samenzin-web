import { TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * The inline alert bar from the design system
 * (docs/design/01-design-system.png): gold, with an icon.
 *
 * role="status" rather than "alert": these notices are present when the page
 * loads and are not urgent interruptions, so a screen reader should announce
 * them in turn rather than cutting off whatever it is reading.
 *
 * Text is forest green on the gold, not white. White on this gold measures
 * 2.4:1 and fails WCAG 2.1 AA.
 */
export function Notice({
  title,
  children,
  className,
}: {
  title: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn('flex gap-3 rounded-lg bg-cta px-4 py-4 text-cta-foreground', className)}
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-2">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  )
}
