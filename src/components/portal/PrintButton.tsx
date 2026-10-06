'use client'

import { Button } from '@/components/ui/button'

/**
 * Opens the browser's print dialogue, which is where "Opslaan als pdf" lives.
 *
 * A client component for one line, because window.print() has to run in the
 * browser. Rendered inside `print:hidden`, so it never appears on the page it
 * prints. There is no fallback needed: with JavaScript off the visitor still
 * has their browser's own print command, and the page is styled for it.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="cta" onClick={() => window.print()}>
      {label}
    </Button>
  )
}
