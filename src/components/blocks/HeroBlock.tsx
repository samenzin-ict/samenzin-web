import Image from 'next/image'

import { BlockLinks, type BlockLinkData } from '@/components/blocks/BlockLink'
import { Container } from '@/components/layout/Container'
import type { Media } from '@/payload-types'

type Stat = {
  value?: string | null
  label: string
  id?: string | null
}

/**
 * The banner at the top of a page, as drawn in
 * docs/design/02-homepage-desktop.png.
 *
 * Mobile first: one column with the image below the text, becoming two columns
 * from md upwards. The band of figures sits underneath on the teal accent.
 *
 * The heading is the page's h1. There is one hero per page by convention; if a
 * second is ever added the outline needs revisiting.
 */
export function HeroBlock({
  heading,
  intro,
  links,
  image,
  stats,
}: {
  heading: string
  intro?: string | null
  links?: BlockLinkData[] | null
  image?: (number | null) | Media
  stats?: Stat[] | null
}) {
  const media = typeof image === 'object' ? image : null
  const hasStats = Boolean(stats && stats.length > 0)

  return (
    <section className="bg-primary text-primary-foreground">
      <Container className="py-12 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="font-heading text-3xl leading-tight text-balance text-primary-foreground sm:text-4xl md:text-5xl">
              {heading}
            </h1>
            {intro ? <p className="max-w-prose text-lg opacity-90">{intro}</p> : null}
            <BlockLinks links={links} onDark />
          </div>

          {media?.url ? (
            <Image
              src={media.url}
              alt={media.alt}
              width={media.width ?? 800}
              height={media.height ?? 600}
              /*
               * Not shown on a phone, as in docs/design/03-homepage-mobile.png.
               * Combined with lazy loading this means a phone never downloads
               * it at all: browsers skip lazy images that are display:none.
               * Mobile first is the rule (CLAUDE.md rule 7), and the heading
               * is the better thing to paint first there anyway.
               */
              loading="lazy"
              sizes="(min-width: 768px) 50vw, 0px"
              className="hidden h-auto w-full rounded-lg md:block"
            />
          ) : null}
        </div>
      </Container>

      {hasStats ? (
        <div className="bg-accent text-accent-foreground">
          <Container className="py-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:flex-wrap md:items-center md:gap-x-0">
              {stats?.map((stat) => (
                <div
                  key={stat.id ?? stat.label}
                  // Separators between the figures, as in the mockup.
                  className="md:border-l md:border-accent-foreground/25 md:px-8 md:first:border-l-0 md:first:pl-0"
                >
                  {stat.value ? (
                    <dt className="font-heading text-2xl leading-tight md:text-3xl">{stat.value}</dt>
                  ) : null}
                  <dd className="text-sm opacity-90">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      ) : null}
    </section>
  )
}
