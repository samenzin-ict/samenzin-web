import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { getMessages } from '@/i18n'
import { getProjects, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

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
  const projects = await getProjects(undefined, isDraft)
  const messages = getMessages()

  return (
    <Container className="py-10 md:py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.projectsTitle}</h1>
        <p>{messages.projectsIntro}</p>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8">{messages.projectsEmpty}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </Container>
  )
}
