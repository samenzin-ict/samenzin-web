import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'

/**
 * A titled section: the heading, and the text under it, in one centred column.
 *
 * Every block on a text page shares this column (max-w-3xl), so headings,
 * paragraphs, cards and the bestuur all start at the same left edge. A heading
 * rail on the left with the text pushed right was tried and read as a page
 * with a hole in it; so was a first paragraph set at heading size, which read
 * as a heading far too long to be one.
 */
export function SectionBlock({
  heading,
  content,
  tone,
}: {
  heading: string
  content: SerializedEditorState
  tone?: 'plain' | 'soft' | null
}) {
  return (
    <section className={tone === 'soft' ? 'border-y border-border bg-card' : undefined}>
      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>
          <RichTextContent data={content} className="mt-4 max-w-none" />
        </div>
      </Container>
    </section>
  )
}
