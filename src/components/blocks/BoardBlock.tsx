import Image from 'next/image'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { getAnbiGegevens } from '@/lib/payload'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

/**
 * The bestuur: a portrait, a name, a role and a short biography each.
 *
 * The people are read from the ANBI-gegevens rather than from the block, so
 * /over-ons and /anbi can never disagree about how a name is spelled.
 *
 * One person per card, the portrait beside the text, in the same centred
 * column as the rest of the page. Three columns looked tidy and read badly: a
 * biography of three paragraphs in a third of the page is a narrow strip of
 * small type, and the whole point of the section is that somebody reads who
 * these people are.
 *
 * On a phone the portrait shrinks and sits beside the name and role, and the
 * biography takes the full width under them; a full-width portrait would fill
 * the screen before the reader learns whose it is.
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
      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl text-primary md:text-3xl">{heading}</h2>
          {intro ? <p className="mt-3 leading-relaxed">{intro}</p> : null}

          <ul className="mt-8 space-y-5">
            {members.map((member) => {
              const photo = withPhotos ? photoOf(member) : null

              return (
                <li
                  key={member.id ?? member.name}
                  className={cn(
                    'grid items-start gap-x-5 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 sm:gap-x-8 sm:p-7',
                    photo?.url && 'grid-cols-[5.5rem_1fr] sm:grid-cols-[11rem_1fr]',
                  )}
                >
                  {photo?.url ? (
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      width={photo.width ?? 480}
                      height={photo.height ?? 600}
                      sizes="(min-width: 640px) 176px, 88px"
                      /*
                       * Fixed portrait shape, so three photographs taken on
                       * three different days still line up. object-cover
                       * crops rather than distorts; a stretched face is worse
                       * than a tight one.
                       */
                      className="aspect-[4/5] w-full rounded-xl object-cover sm:row-span-2"
                    />
                  ) : null}

                  <div className="self-center sm:self-start">
                    <p className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
                      {member.role}
                    </p>
                    <h3 className="mt-2 font-heading text-xl text-primary sm:text-2xl">{member.name}</h3>
                  </div>

                  <RichTextContent
                    data={member.bio}
                    className={cn('mt-4 max-w-none', photo?.url && 'col-span-2 sm:col-span-1 sm:col-start-2')}
                  />
                </li>
              )
            })}
          </ul>

          <RichTextContent
            data={anbi.boardComposition}
            className="mt-8 max-w-none text-sm text-muted-foreground"
          />
        </div>
      </Container>
    </section>
  )
}
