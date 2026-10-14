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
 * Without an image it is the deep green band with the text on it. With one,
 * the image fills the banner and the text sits on it, the way a project page
 * puts its title on its banner.
 *
 * When the image already carries the heading and the introduction — a
 * designed banner rather than a photograph — they are not set over it a
 * second time. They stay in the page for screen readers and search engines,
 * and the image itself gets an empty alt text so its words are not read out
 * twice. The buttons then sit on the image, directly under its text: the
 * banner is sized from its width, so a position in cqw lands on the same spot
 * of the picture at every screen width. On a phone the picture is cropped to
 * its left half, where the text is, and the buttons go underneath it.
 *
 * The heading is the page's h1. There is one hero per page by convention; if a
 * second is ever added the outline needs revisiting.
 */
export function HeroBlock({
  heading,
  intro,
  links,
  image,
  textInImage,
  stats,
}: {
  heading: string
  intro?: string | null
  links?: BlockLinkData[] | null
  image?: (number | null) | Media
  textInImage?: boolean | null
  stats?: Stat[] | null
}) {
  const media = typeof image === 'object' && image?.url ? image : null
  const hasStats = Boolean(stats && stats.length > 0)

  const picture = (className: string, alt: string) =>
    media?.url ? (
      <Image
        src={media.url}
        alt={alt}
        fill
        // The largest thing on the homepage: it is what a visitor waits for.
        priority
        sizes="100vw"
        className={className}
      />
    ) : null

  let banner: React.ReactNode

  if (media && textInImage) {
    banner = (
      <div className="@container">
        <h1 className="sr-only">{heading}</h1>
        {intro ? <p className="sr-only">{intro}</p> : null}

        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-[34cqw]">
          {picture('object-cover object-left-top', '')}

          <div className="absolute top-[26cqw] left-[7.8cqw] hidden md:block">
            <BlockLinks links={links} raised />
          </div>
        </div>

        {links && links.length > 0 ? (
          <Container className="py-6 md:hidden">
            <BlockLinks links={links} />
          </Container>
        ) : null}
      </div>
    )
  } else if (media) {
    banner = (
      <div className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {picture('-z-20 object-cover', media.alt)}
        {/*
          A wash from the left, so the text keeps its contrast whatever the
          photograph does behind it.
        */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/80 to-primary/10" />

        <Container className="py-16 md:py-24">
          <div className="max-w-xl space-y-6">
            <h1 className="font-heading text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">{heading}</h1>
            {intro ? <p className="text-lg opacity-90">{intro}</p> : null}
            <BlockLinks links={links} onDark />
          </div>
        </Container>
      </div>
    )
  } else {
    banner = (
      <div className="bg-primary text-primary-foreground">
        <Container className="py-12 md:py-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-heading text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">{heading}</h1>
            {intro ? <p className="max-w-prose text-lg opacity-90">{intro}</p> : null}
            <BlockLinks links={links} onDark />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <section>
      {banner}

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
