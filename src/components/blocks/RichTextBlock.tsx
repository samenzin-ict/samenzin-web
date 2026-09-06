import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'

/**
 * A block of formatted text. Headings inside it start at h2: the page title is
 * the h1, and skipping a level breaks the outline for screen reader users.
 */
export function RichTextBlock({ content }: { content: SerializedEditorState }) {
  return (
    <Container className="py-10 md:py-14">
      <RichTextContent data={content} />
    </Container>
  )
}
