import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import type { Media } from '@/payload-types'

type Item = {
  title: string
  description?: string | null
  image?: (number | null) | Media
  url?: string | null
  linkLabel?: string | null
  id?: string | null
}

/**
 * The card grid from the homepage mockup: white cards with soft corners on the
 * crème background, an image, a title, a short text and a link.
 *
 * Mobile first: one column, two from sm, three from lg.
 */
export function FeaturedItemsBlock({ heading, items }: { heading: string; items?: Item[] | null }) {
  if (!items || items.length === 0) return null

  return (
    <Container className="py-10 md:py-14">
      <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const media = typeof item.image === 'object' ? item.image : null

          return (
            <li
              key={item.id ?? item.title}
              className="flex flex-col rounded-lg border border-border bg-card p-3"
            >
              {media?.url ? (
                <Image
                  src={media.url}
                  alt={media.alt}
                  width={media.width ?? 600}
                  height={media.height ?? 400}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[3/2] w-full rounded-md object-cover"
                />
              ) : null}

              <div className="flex flex-1 flex-col gap-2 p-3">
                <h3 className="font-heading text-xl text-primary">{item.title}</h3>
                {item.description ? <p className="flex-1 text-sm">{item.description}</p> : null}

                {item.url && item.linkLabel ? (
                  <Link
                    href={item.url}
                    className="mt-1 font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {item.linkLabel}
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}
