import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cn } from '@/lib/utils'

/**
 * Formatted text from the CMS, with the site's reading rhythm applied.
 *
 * The styling lives in one place so text written in the editor comes out the
 * same wherever it appears, and so a change to link colour or line height does
 * not have to be repeated per page.
 *
 * Renders nothing for empty content, which keeps a heading from appearing
 * above a blank space when a field has not been filled in yet.
 */
export function RichTextContent({
  data,
  className,
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null

  return (
    <div
      className={cn('rich-text', className)}
    >
      <RichText data={data} />
    </div>
  )
}
