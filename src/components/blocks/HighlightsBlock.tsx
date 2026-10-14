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
 * Shares the centred reading column of SectionBlock, so a page that mixes the
 * two keeps one left edge for every heading, paragraph and card.
 *
 * Cards are filled surfaces rather than outlined boxes: white and lifted on
 * the crème page and on the green band, crème and flat on the white band, so
 * the card always reads as a surface of its own. Each carries a small badge —
 * its number for a list of principles, an arrow when it leads somewhere.
 *
 * A card that leads somewhere is clickable as a whole, but through the one
 * link on its title, stretched over the card: a screen reader still hears one
 * link per card, named after it, and the text is not read twice.
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
  const soft = tone === 'soft'
  const band = strong
    ? 'bg-accent text-accent-foreground'
    : soft
      ? 'border-y border-border bg-card'
      : undefined
  const headingColour = strong ? 'text-accent-foreground' : 'text-primary'

  const header = (
    <>
      <h2 className={cn('font-heading text-2xl md:text-3xl', headingColour)}>{heading}</h2>
      {intro ? <p className="mt-3 leading-relaxed">{intro}</p> : null}
    </>
  )

  const closing = outro ? (
    <p className="mt-8 leading-relaxed">
      <WithEmailLinks text={outro} />
    </p>
  ) : null

  if (layout === 'rows') {
    return (
      <section className={band}>
        <Container className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl">
            {header}

            <dl className={cn('mt-6 divide-y border-y', strong ? 'divide-white/25 border-white/25' : 'divide-border border-border')}>
              {items.map((item) => (
                <div key={item.id ?? item.title} className="py-5">
                  <dt className={cn('font-heading text-lg', headingColour)}>{item.title}</dt>
                  {item.text ? <dd className="mt-1 leading-relaxed">{item.text}</dd> : null}
                </div>
              ))}
            </dl>

            {closing}
          </div>
        </Container>
      </section>
    )
  }

  const surface = soft
    ? 'bg-background ring-1 ring-border'
    : 'bg-card shadow-sm ring-1 ring-black/5'

  return (
    <section className={band}>
      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          {header}

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
              <li
                key={item.id ?? item.title}
                className={cn(
                  'relative flex flex-col rounded-2xl p-6 text-foreground transition-shadow',
                  surface,
                  // The focus ring goes round the whole card. Teal vanishes on
                  // the green band, so there it is gold.
                  item.url && 'hover:shadow-md has-[a:focus-visible]:ring-[3px]',
                  item.url && (strong ? 'has-[a:focus-visible]:ring-cta' : 'has-[a:focus-visible]:ring-ring'),
                )}
              >
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-accent/10 font-heading text-lg text-accent"
                >
                  {item.url ? <ArrowRight className="size-5" /> : index + 1}
                </span>

                <h3 className="mt-4 font-heading text-lg leading-snug text-primary">
                  {item.url ? (
                    <Link
                      href={item.url}
                      className="underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.text ? <p className="mt-2 text-[0.9375rem] leading-relaxed">{item.text}</p> : null}
              </li>
            ))}
          </ul>

          {closing}
        </div>
      </Container>
    </section>
  )
}
