import Image from 'next/image'
import Link from 'next/link'

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
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 600}
          height={media.height ?? 400}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/2] w-full rounded-md object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="font-heading text-xl text-primary">
          <Link href={`/projecten/${project.slug}`} className="underline-offset-4 hover:underline">
            {project.title}
          </Link>
        </h2>

        {project.excerpt ? <p className="flex-1 text-sm">{project.excerpt}</p> : null}

        {project.category ? (
          <span className="mt-1 self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary">
            {project.category}
          </span>
        ) : null}
      </div>
    </li>
  )
}
