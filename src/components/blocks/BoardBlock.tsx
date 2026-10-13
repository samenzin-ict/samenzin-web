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
 * One person per row, the portrait beside the text. Three columns looked tidy
 * and read badly: a biography of three paragraphs in a third of the page is a
 * narrow strip of small type, and the whole point of the section is that
 * somebody reads who these people are. A row gives the text a proper measure
 * at the size the rest of the page is set in.
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
    <section>
      <Container className="py-10 md:py-16">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>
          {intro ? <p className="mt-3">{intro}</p> : null}
        </div>

        <ul className="mt-8 max-w-4xl space-y-6">
          {members.map((member) => {
            const photo = photoOf(member)

            return (
              <li
                key={member.id ?? member.name}
                className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:gap-8 md:p-8"
              >
                {withPhotos && photo?.url ? (
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    width={photo.width ?? 480}
                    height={photo.height ?? 600}
                    sizes="(min-width: 640px) 208px, 160px"
                    /*
                     * Fixed portrait shape, so three photographs taken on three
                     * different days still line up. object-cover crops rather
                     * than distorts; a stretched face is worse than a tight one.
                     */
                    className="aspect-[4/5] w-40 shrink-0 self-start rounded-md object-cover sm:w-52"
                  />
                ) : null}

                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-widest text-accent uppercase">
                    {member.role}
                  </p>
                  <h3 className="mt-1 font-heading text-2xl text-primary">{member.name}</h3>

                  <RichTextContent data={member.bio} className="mt-4" />
                </div>
              </li>
            )
          })}
        </ul>

        <RichTextContent
          data={anbi.boardComposition}
          className="mt-8 text-sm text-muted-foreground"
        />
      </Container>
    </section>
  )
}
