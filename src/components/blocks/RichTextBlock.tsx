import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { Container } from '@/components/layout/Container'

/**
 * A block of formatted text.
 *
 * The prose styling lives here rather than on each element, so text an editor
 * writes in the CMS comes out with the same rhythm everywhere. Headings inside
 * the text start at h2: the page title is the h1, and skipping a level breaks
 * the document outline for screen reader users.
 */
export function RichTextBlock({ content }: { content: SerializedEditorState }) {
  return (
    <Container className="py-10 md:py-14">
      <div
        className="
          max-w-prose
          [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
          [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic
          [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl
          [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
        "
      >
        <RichText data={content} />
      </div>
    </Container>
  )
}
