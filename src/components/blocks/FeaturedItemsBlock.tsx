import Image from 'next/image'
import Link from 'next/link'

import { ProjectStatus } from '@/components/projects/ProjectStatus'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getProjects } from '@/lib/payload'
import type { Media, Project } from '@/payload-types'

type Item = {
  title: string
  description?: string | null
  image?: (number | null) | Media
  url?: string | null
  linkLabel?: string | null
  phase?: Project['phase'] | null
  id?: string | null
}

/**
 * The card grid from the homepage mockup: white cards with soft corners on the
 * crème background, an image, a title, a short text and a link.
 *
 * Mobile first: one column, two from sm, three from lg.
 *
 * With the automatic source the cards are the projects themselves, in the
 * order the projects page uses, so the homepage cannot drift away from them.
 * See src/blocks/FeaturedItems.ts for why an empty source still means manual.
 */
export async function FeaturedItemsBlock({
  heading,
  items,
  source,
  limit,
}: {
  heading: string
  items?: Item[] | null
  source?: 'projects' | 'manual' | null
  limit?: number | null
}) {
  const messages = getMessages()

  const cards: Item[] =
    source === 'projects'
      ? (await getProjects()).slice(0, limit ?? 3).map((project) => ({
          id: String(project.id),
          title: project.title,
          description: project.excerpt,
          image: project.image,
          url: `/projecten/${project.slug}`,
          linkLabel: messages.featuredReadMore,
          phase: project.phase,
        }))
      : (items ?? [])

  if (cards.length === 0) return null

  return (
    <Container className="py-10 md:py-14">
      <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => {
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
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
                  className="aspect-[3/2] w-full rounded-md object-cover"
                />
              ) : null}

              <div className="flex flex-1 flex-col gap-2 p-3">
                {item.phase ? <ProjectStatus phase={item.phase} className="self-start" /> : null}

                <h3 className="font-heading text-xl text-primary">
                  {/*
                    The title is the link, so a card can be reached by clicking
                    the thing it is named after rather than only by the small
                    line underneath it.
                  */}
                  {item.url ? (
                    <Link href={item.url} className="underline-offset-4 hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>

                {item.description ? <p className="flex-1 text-sm">{item.description}</p> : null}

                {item.url && item.linkLabel ? (
                  <Link
                    href={item.url}
                    className="mt-1 font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {item.linkLabel}
                    {/*
                      "Lees meer" on its own tells a screen reader nothing, and
                      a page of them tells it nothing three times over. The
                      title is read out with it without appearing on screen.
                    */}
                    <span className="sr-only"> over {item.title}</span>
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
