import Image from 'next/image'
import Link from 'next/link'

import { ProjectStatus } from '@/components/projects/ProjectStatus'
import { Container } from '@/components/layout/Container'
import { getProjects } from '@/lib/payload'
import { cn } from '@/lib/utils'
import type { Media, Project } from '@/payload-types'

type Item = {
  title: string
  description?: string | null
  image?: (number | null) | Media
  url?: string | null
  phase?: Project['phase'] | null
  id?: string | null
}

/**
 * The card grid from the homepage mockup: white cards with soft corners on the
 * crème background, an image, a title and a short text.
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
  const cards: Item[] =
    source === 'projects'
      ? (await getProjects()).slice(0, limit ?? 3).map((project) => ({
          id: String(project.id),
          title: project.title,
          description: project.excerpt,
          image: project.image,
          url: `/projecten/${project.slug}`,
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
              /*
               * The whole card is clickable, through the one link on its title
               * stretched over it. A separate "Lees meer" under the title did
               * the same thing twice; a screen reader now hears one link per
               * card, named after the project.
               */
              className={cn(
                'relative flex flex-col rounded-lg border border-border bg-card p-3 transition-shadow',
                item.url && 'hover:shadow-md has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring',
              )}
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
                  {item.url ? (
                    <Link
                      href={item.url}
                      className="underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>

                {item.description ? <p className="flex-1 text-sm">{item.description}</p> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}
