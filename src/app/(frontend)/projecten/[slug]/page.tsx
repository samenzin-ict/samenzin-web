import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Users } from 'lucide-react'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { FundingProgress } from '@/components/projects/FundingProgress'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { getProjectBySlug, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

/* The three pictograms the mockup uses beside the facts. */
const factIcons = {
  people: Users,
  duration: CalendarDays,
  location: MapPin,
} as const

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug, undefined, isDraft),
    getSiteSettings(),
  ])

  if (!project) return {}

  const image = typeof project.image === 'object' ? (project.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    title: project.title,
    description: project.excerpt ?? undefined,
    alternates: { canonical: `/projecten/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.excerpt ?? undefined,
      siteName: settings.organisationName,
      type: 'article',
      locale: 'nl_NL',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: image?.alt ?? '' }] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const project = await getProjectBySlug(slug, undefined, isDraft)

  if (!project) notFound()

  const messages = getMessages()
  const media = typeof project.image === 'object' ? (project.image as Media | null) : null
  const facts = project.facts ?? []
  const cta = project.callToAction

  return (
    <>
      {media?.url ? (
        <div className="relative bg-primary">
          <Image
            src={media.url}
            alt={media.alt}
            width={media.width ?? 1600}
            height={media.height ?? 600}
            priority
            sizes="100vw"
            className="h-48 w-full object-cover sm:h-64 md:h-80"
          />
        </div>
      ) : null}

      <Container className="py-10 md:py-14">
        <h1 className="font-heading text-3xl sm:text-4xl">{project.title}</h1>

        <div className="mt-8 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <RichTextContent data={project.body} />
          </div>

          {/*
            The sidebar only appears when there is something to put in it, so a
            project that is not raising money does not get an empty box.
          */}
          {project.funding?.goal ? (
            <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
              <FundingProgress goal={project.funding.goal} raised={project.funding.raised} />

              <Button asChild variant="cta" className="w-full">
                <Link href="/doneren">{messages.projectDonate}</Link>
              </Button>
            </aside>
          ) : null}
        </div>

        {facts.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {facts.map((fact) => {
              const Icon = factIcons[fact.icon]

              return (
                <li key={fact.id ?? fact.label} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span>{fact.label}</span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <p className="mt-10">
          <Link href="/projecten" className="text-accent underline underline-offset-4">
            {messages.projectBackToOverview}
          </Link>
        </p>
      </Container>

      {cta?.heading ? (
        <section className="bg-primary text-primary-foreground">
          <Container className="flex flex-col items-center gap-4 py-10 text-center">
            <h2 className="font-heading text-2xl text-primary-foreground">{cta.heading}</h2>
            {cta.label && cta.url ? (
              <Button asChild variant="cta">
                <Link href={cta.url}>{cta.label}</Link>
              </Button>
            ) : null}
          </Container>
        </section>
      ) : null}
    </>
  )
}
