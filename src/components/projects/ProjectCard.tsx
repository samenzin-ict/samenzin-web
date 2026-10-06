import Image from 'next/image'
import Link from 'next/link'

import { ProjectStatus } from '@/components/projects/ProjectStatus'
import type { Media, Project } from '@/payload-types'

/**
 * A project in the overview grid: image, title, short text and the category
 * label, as drawn in the mockup.
 *
 * The whole card is not a link. Only the title is, so a screen reader hears
 * one link with a meaningful name rather than the same destination repeated
 * for the image, the heading and the text.
 */
export function ProjectCard({ project }: { project: Project }) {
  const media = typeof project.image === 'object' ? (project.image as Media | null) : null

  return (
    <li className="flex flex-col rounded-lg border border-border bg-card p-3">
      {/*
        The image is what makes the grid a grid. Without one the card is three
        lines of text and the overview reads as a list, which is not the page
        docs/design/06-projecten-overzicht-en-detail.png draws. The band of
        colour below stands in when a project has no image yet, so one missing
        picture does not leave a hole in the row.
      */}
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 600}
          height={media.height ?? 400}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
          className="aspect-[3/2] w-full rounded-md object-cover"
        />
      ) : (
        <div aria-hidden className="aspect-[3/2] w-full rounded-md bg-muted" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatus phase={project.phase} />

          {project.category ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary">
              {project.category}
            </span>
          ) : null}
        </div>

        <h2 className="font-heading text-xl text-primary">
          <Link href={`/projecten/${project.slug}`} className="underline-offset-4 hover:underline">
            {project.title}
          </Link>
        </h2>

        {project.excerpt ? <p className="flex-1 text-sm">{project.excerpt}</p> : null}
      </div>
    </li>
  )
}
