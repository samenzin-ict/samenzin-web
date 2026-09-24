import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { VolunteerForm } from '@/components/volunteer/VolunteerForm'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getProjects, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const VOLUNTEER_SLUG = 'vrijwilligers'

/**
 * Where somebody offers to help. ROADMAP 2.6.
 *
 * A fixed route rather than a plain CMS page, because the form has to live
 * somewhere. An editor can still add an introduction by creating a page with
 * the slug "vrijwilligers"; its blocks render above the form.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: isDraft } = await draftMode()
  const [page, settings] = await Promise.all([
    getPageBySlug(VOLUNTEER_SLUG, undefined, isDraft),
    getSiteSettings(),
  ])
  const messages = getMessages()

  if (!page) {
    return {
      title: messages.volunteerTitle,
      description: messages.volunteerIntro,
      alternates: { canonical: '/vrijwilligers' },
    }
  }

  return buildPageMetadata({ page, settings })
}

export default async function VolunteerPage() {
  const { isEnabled: isDraft } = await draftMode()
  const [page, projects] = await Promise.all([
    getPageBySlug(VOLUNTEER_SLUG, undefined, isDraft),
    getProjects(),
  ])
  const messages = getMessages()

  const hasHero = page?.body?.[0]?.blockType === 'hero'

  return (
    <>
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {page?.title ?? messages.volunteerTitle}
          </h1>
        </Container>
      ) : null}

      <RenderBlocks blocks={page?.body} />

      <Container className="py-10 md:py-14">
        <div className="max-w-prose space-y-6">
          {!page ? <p>{messages.volunteerIntro}</p> : null}

          <VolunteerForm
            messages={messages}
            projects={projects.map((project) => ({ id: project.id, title: project.title }))}
          />
        </div>
      </Container>
    </>
  )
}
