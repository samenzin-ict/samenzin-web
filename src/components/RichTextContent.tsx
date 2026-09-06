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
      className={cn(
        `max-w-prose
         [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
         [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic
         [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl
         [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6
         [&_p]:mb-4 [&_p]:leading-relaxed [&_p:last-child]:mb-0
         [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6`,
        className,
      )}
    >
      <RichText data={data} />
    </div>
  )
}
