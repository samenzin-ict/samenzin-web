import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Users } from 'lucide-react'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { FundingProgress } from '@/components/projects/FundingProgress'
import { ProjectStatus } from '@/components/projects/ProjectStatus'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { getPaidForProject, totalRaised } from '@/lib/funding'
import { getPayloadClient, getProjectBySlug, getSiteSettings } from '@/lib/payload'
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

  /*
   * What the project has raised: the amount an editor typed in for gifts that
   * arrived away from the website, plus the paid donations earmarked for it.
   * Only paid ones count — an "open" donation is somebody who reached Mollie
   * and may never have finished.
   */
  const raised = project.funding?.goal
    ? totalRaised(project, await getPaidForProject(await getPayloadClient(), project.id))
    : 0
  const media = typeof project.image === 'object' ? (project.image as Media | null) : null
  const facts = project.facts ?? []
  const details = project.details ?? []
  const cta = project.callToAction

  return (
    <>
      {/*
        The title sits on the banner, as drawn in
        docs/design/06-projecten-overzicht-en-detail.png. The banners are made
        with their left side faded back to a flat colour for exactly this, so
        the text has dependable contrast wherever the pattern happens to fall.
      */}
      {media?.url ? (
        <div className="relative isolate">
          <Image
            src={media.url}
            alt={media.alt}
            width={media.width ?? 1600}
            height={media.height ?? 1000}
            priority
            sizes="100vw"
            className="h-56 w-full object-cover sm:h-64 md:h-80"
          />

          {/*
            A wash of the page background rising from the foot of the banner.
            The banners are drawn with their left side already faded, which is
            enough on a wide screen, but a long title wraps across the whole
            width on a phone and the second line lands on whatever shape happens
            to be there. This makes the strip the text sits on readable at every
            width instead of at most of them.
          */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent"
          />

          <Container className="absolute inset-0 flex flex-col justify-end pb-6 md:pb-8">
            <h1 className="font-heading text-3xl text-primary sm:text-4xl md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <ProjectStatus phase={project.phase} />
              {project.phaseNote ? (
                <span className="text-sm text-primary">{project.phaseNote}</span>
              ) : null}
            </p>
          </Container>
        </div>
      ) : null}

      <Container className="py-10 md:py-14">
        {/* Without a banner the heading has nowhere to sit, so it goes here. */}
        {!media?.url ? (
          <>
            <h1 className="font-heading text-3xl sm:text-4xl">{project.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <ProjectStatus phase={project.phase} />
              {project.phaseNote ? (
                <span className="text-sm text-muted-foreground">{project.phaseNote}</span>
              ) : null}
            </p>
          </>
        ) : null}

        <div className={`grid gap-10 md:grid-cols-3${media?.url ? '' : ' mt-8'}`}>
          <div className="md:col-span-2">
            <RichTextContent data={project.body} className="rich-text-lead" />
          </div>

          {/*
            The sidebar holds what a reader came to look up — who it is for,
            where the dates are, how to join — and the funding box when there is
            one. It only appears when there is something to put in it, so a
            project with neither does not get an empty box.
          */}
          {details.length > 0 || project.funding?.goal ? (
            <aside className="h-fit space-y-6">
              {details.length > 0 ? (
                <dl className="divide-y divide-border rounded-lg border border-border bg-card">
                  {details.map((detail) => (
                    <div key={detail.id ?? detail.label} className="p-5">
                      <dt className="font-heading text-base text-primary">{detail.label}</dt>
                      <dd className="mt-1 text-sm">{detail.text}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {/*
                The amount shown is what an editor typed in for gifts that came
                in away from the website, plus the paid donations earmarked for
                this project. See src/lib/funding.ts.
              */}
              {project.funding?.goal ? (
                <div className="space-y-4 rounded-lg border border-border bg-card p-5">
                  <FundingProgress goal={project.funding.goal} raised={raised} />

                  <Button asChild variant="cta" className="w-full">
                    <Link href={`/doneren?project=${encodeURIComponent(project.slug)}`}>
                      {messages.projectDonate}
                    </Link>
                  </Button>
                </div>
              ) : null}
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
