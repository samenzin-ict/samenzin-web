import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils'

type Item = {
  title: string
  text?: string | null
  url?: string | null
  id?: string | null
}

const EMAIL = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/

/**
 * A line of text in which an e-mail address becomes a link.
 *
 * The closing line of a page is very often "mail ons op …", and an address a
 * visitor has to select and copy is a small rudeness on a phone.
 */
function WithEmailLinks({ text }: { text: string }) {
  return (
    <>
      {text.split(EMAIL).map((part, index) =>
        EMAIL.test(part) ? (
          <a key={index} href={`mailto:${part}`} className="font-medium underline underline-offset-4">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  )
}

/**
 * Named points with a line of explanation each, as rows or as cards.
 *
 * Rows share the heading rail of SectionBlock, so a page that mixes the two
 * keeps one left edge for its headings. Cards take the full width.
 *
 * Only the title of an item is a link, never the card: a screen reader then
 * hears one link with a meaningful name per item.
 */
export function HighlightsBlock({
  heading,
  intro,
  items,
  outro,
  layout,
  tone,
}: {
  heading: string
  intro?: string | null
  items?: Item[] | null
  outro?: string | null
  layout?: 'cards' | 'rows' | null
  tone?: 'plain' | 'soft' | 'strong' | null
}) {
  if (!items || items.length === 0) return null

  const strong = tone === 'strong'
  const band = strong
    ? 'bg-accent text-accent-foreground'
    : tone === 'soft'
      ? 'border-y border-border bg-card'
      : ''
  const headingColour = strong ? 'text-accent-foreground' : 'text-primary'

  const title = (item: Item) =>
    item.url ? (
      <Link href={item.url} className="group inline-flex items-center gap-2 underline-offset-4 hover:underline">
        {item.title}
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    ) : (
      item.title
    )

  if (layout === 'rows') {
    return (
      <section className={band}>
        <Container className="grid gap-x-12 gap-y-4 py-10 md:grid-cols-12 md:py-16">
          <div className="md:col-span-4">
            <h2 className={cn('font-heading text-2xl md:text-3xl', headingColour)}>{heading}</h2>
            {intro ? <p className="mt-3">{intro}</p> : null}
          </div>

          <div className="md:col-span-8">
            <dl className={cn('divide-y border-y', strong ? 'divide-white/25 border-white/25' : 'divide-border border-border')}>
              {items.map((item) => (
                <div key={item.id ?? item.title} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-3">
                  <dt className={cn('font-heading text-lg', headingColour)}>{title(item)}</dt>
                  {item.text ? <dd className="sm:col-span-2">{item.text}</dd> : null}
                </div>
              ))}
            </dl>

            {outro ? (
              <p className="mt-6 max-w-prose">
                <WithEmailLinks text={outro} />
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    )
  }

  // The card surface has to differ from whatever it sits on: white on the
  // crème page and on the green band, crème on the white band.
  const card = tone === 'soft' ? 'bg-background' : 'bg-card'

  return (
    <section className={band}>
      <Container className="py-10 md:py-16">
        <div className="max-w-2xl">
          <h2 className={cn('font-heading text-2xl md:text-3xl', headingColour)}>{heading}</h2>
          {intro ? <p className="mt-3">{intro}</p> : null}
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id ?? item.title}
              className={cn('rounded-lg border border-border p-6 text-foreground', card)}
            >
              <h3 className="font-heading text-lg text-primary">{title(item)}</h3>
              {item.text ? <p className="mt-2 text-sm leading-relaxed">{item.text}</p> : null}
            </li>
          ))}
        </ul>

        {outro ? (
          <p className="mt-8 max-w-prose">
            <WithEmailLinks text={outro} />
          </p>
        ) : null}
      </Container>
    </section>
  )
}
