import Image from 'next/image'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { getAnbiGegevens } from '@/lib/payload'
import type { Media } from '@/payload-types'

/**
 * The bestuur: a portrait, a name, a role and a short biography each.
 *
 * The people are read from the ANBI-gegevens rather than from the block, so
 * /over-ons and /anbi can never disagree about how a name is spelled.
 *
 * Photographs are shown only when every member has one. A row where two people
 * have a portrait and the third has a grey placeholder looks like a mistake and
 * invites the reader to wonder about the one who is missing; three name cards
 * look deliberate. The board can therefore add photographs at its own pace
 * without the page ever passing through the ugly state.
 */
export async function BoardBlock({ heading, intro }: { heading: string; intro?: string | null }) {
  const anbi = await getAnbiGegevens()
  const members = anbi.boardMembers ?? []

  if (members.length === 0) return null

  const photoOf = (member: (typeof members)[number]): Media | null =>
    member.photo && typeof member.photo === 'object' ? member.photo : null

  const withPhotos = members.every((member) => Boolean(photoOf(member)?.url))

  return (
    <Container className="py-10 md:py-14">
      <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>
      {intro ? <p className="mt-3 max-w-prose">{intro}</p> : null}

      <ul className="mt-8 grid gap-6 lg:grid-cols-3">
        {members.map((member) => {
          const photo = photoOf(member)

          return (
            <li
              key={member.id ?? member.name}
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              {withPhotos && photo?.url ? (
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  width={photo.width ?? 800}
                  height={photo.height ?? 1000}
                  sizes="224px"
                  /*
                   * Fixed portrait shape, so three photographs taken on three
                   * different days still line up. object-cover crops rather
                   * than distorts; a stretched face is worse than a tight one.
                   */
                  className="aspect-[4/5] w-full max-w-56 rounded-md object-cover"
                />
              ) : null}

              <h3 className="mt-4 font-heading text-xl text-primary">{member.name}</h3>
              <p className="text-sm font-medium text-accent">{member.role}</p>

              <RichTextContent data={member.bio} className="mt-3 text-sm" />
            </li>
          )
        })}
      </ul>

      <RichTextContent data={anbi.boardComposition} className="mt-8 max-w-prose text-sm" />
    </Container>
  )
}
