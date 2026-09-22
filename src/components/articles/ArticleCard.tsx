import Image from 'next/image'
import Link from 'next/link'

import { ArticleMeta } from '@/components/articles/ArticleMeta'
import { CategoryPill } from '@/components/articles/CategoryPill'
import type { Article, Media } from '@/payload-types'
import { cn } from '@/lib/utils'

/**
 * An article in the overview.
 *
 * `featured` renders the wide lead card from the mockup. It is the same
 * component rather than a second one, because the difference is layout, and
 * two components would drift apart the first time someone changed one.
 *
 * Only the title is a link, so the same destination is not announced three
 * times to anyone listening to the page.
 */
export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const media = typeof article.image === 'object' ? (article.image as Media | null) : null

  return (
    <li
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-card',
        featured && 'sm:col-span-2 lg:col-span-3 sm:flex-row',
      )}
    >
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 800}
          height={media.height ?? 500}
          sizes={featured ? '(min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
          className={cn('w-full object-cover', featured ? 'sm:w-1/2 sm:self-stretch' : 'aspect-[3/2]')}
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <CategoryPill category={article.category} />

        <h2
          className={cn(
            'font-heading text-primary',
            featured ? 'text-2xl md:text-3xl' : 'text-xl',
          )}
        >
          <Link href={`/nieuws/${article.slug}`} className="underline-offset-4 hover:underline">
            {article.title}
          </Link>
        </h2>

        {article.excerpt ? <p className="flex-1 text-sm">{article.excerpt}</p> : null}

        <ArticleMeta author={article.author} publishedAt={article.publishedAt} className="mt-1" />
      </div>
    </li>
  )
}
