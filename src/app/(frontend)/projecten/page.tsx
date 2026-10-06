import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { getMessages } from '@/i18n'
import { getPageBySlug, getProjects, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/*
 * The CMS page that introduces the list. Like /contact and /doneren, this is a
 * fixed route that still renders the blocks of the page with its own slug, so
 * the board can write the opening text without anybody touching code. Here the
 * blocks come above the grid rather than below it: lead text that follows the
 * cards it introduces is not lead text.
 */
const PROJECTS_SLUG = 'projecten'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const messages = getMessages()

  return {
    title: messages.projectsTitle,
    description: messages.projectsIntro,
    alternates: { canonical: '/projecten' },
    openGraph: {
      title: messages.projectsTitle,
      description: messages.projectsIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

export default async function ProjectsPage() {
  const { isEnabled: isDraft } = await draftMode()
  const [projects, page] = await Promise.all([
    getProjects(undefined, isDraft),
    getPageBySlug(PROJECTS_SLUG, undefined, isDraft),
  ])
  const messages = getMessages()

  return (
    <>
      <Container className="pt-10 md:pt-16">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.projectsTitle}</h1>
      </Container>

      {/*
        The introduction, when the board has written one. A block brings its own
        Container, so it sits beside this one rather than inside it. Without a
        page there is still a heading and the grid, so the route never depends
        on content that may not exist yet.
      */}
      <RenderBlocks blocks={page?.body} />

      <Container className={page?.body?.length ? 'pb-10 md:pb-16' : 'py-10 md:py-16'}>
        {projects.length === 0 ? (
          <p>{messages.projectsEmpty}</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}
