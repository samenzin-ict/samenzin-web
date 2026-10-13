import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils'

/**
 * A titled section: the heading in its own column, the text beside it.
 *
 * On a wide screen the heading sits in a rail on the left and the text keeps a
 * comfortable measure on the right, so the page uses its width without the
 * lines getting longer. On a phone the two simply stack.
 *
 * The "lead" layout is for the opening of a page. Its heading shrinks to a
 * label and its first paragraph is set large, because the first thing on Over
 * ons should be what the foundation is, not the words "Wie wij zijn".
 */
export function SectionBlock({
  heading,
  content,
  layout,
  tone,
}: {
  heading: string
  content: SerializedEditorState
  layout?: 'rail' | 'lead' | null
  tone?: 'plain' | 'soft' | null
}) {
  const band = tone === 'soft' ? 'border-y border-border bg-card' : ''

  if (layout === 'lead') {
    return (
      <section className={band}>
        <Container className="py-10 md:py-16">
          <h2 className="font-sans text-sm font-semibold tracking-widest text-accent uppercase">
            {heading}
          </h2>
          <RichTextContent data={content} className="rich-text-statement mt-4" />
        </Container>
      </section>
    )
  }

  return (
    <section className={band}>
      <Container className="grid gap-x-12 gap-y-4 py-10 md:grid-cols-12 md:py-16">
        <h2 className="font-heading text-2xl text-primary md:col-span-4 md:text-3xl">{heading}</h2>
        <RichTextContent data={content} className={cn('md:col-span-8')} />
      </Container>
    </section>
  )
}
