import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RichTextContent } from '@/components/RichTextContent'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleMeta } from '@/components/articles/ArticleMeta'
import { CategoryPill } from '@/components/articles/CategoryPill'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getArticleBySlug, getRelatedArticles, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const [article, settings] = await Promise.all([
    getArticleBySlug(slug, undefined, isDraft),
    getSiteSettings(),
  ])

  if (!article) return {}

  const image = typeof article.image === 'object' ? (article.image as Media | null) : null
  const ogImage = image?.sizes?.og?.url ?? image?.url

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `/nieuws/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      siteName: settings.organisationName,
      type: 'article',
      locale: 'nl_NL',
      publishedTime: article.publishedAt ?? undefined,
      authors: article.author ? [article.author] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: image?.alt ?? '' }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const article = await getArticleBySlug(slug, undefined, isDraft)

  if (!article) notFound()

  const messages = getMessages()
  const media = typeof article.image === 'object' ? (article.image as Media | null) : null
  const tags = article.tags ?? []
  const related = await getRelatedArticles(article.id)

  return (
    <Container className="py-10 md:py-16">
      {/*
        One column, narrow. An article is for reading, and prose that runs the
        full width of a desktop screen is hard to follow.
      */}
      <article className="mx-auto max-w-3xl">
        <CategoryPill category={article.category} />

        <h1 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl">{article.title}</h1>

        <ArticleMeta
          author={article.author}
          publishedAt={article.publishedAt}
          className="mt-3 text-base"
        />

        {media?.url ? (
          <Image
            src={media.url}
            alt={media.alt}
            width={media.width ?? 1200}
            height={media.height ?? 700}
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="mt-8 aspect-[16/9] w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="mt-8">
          <RichTextContent data={article.body} className="max-w-none" />
        </div>

        {tags.length > 0 ? (
          <div className="mt-10">
            <h2 className="sr-only">{messages.articlesTopics}</h2>
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag.id ?? tag.label}
                  className="rounded-full border border-border px-3 py-1 text-sm"
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10">
          <Link href="/nieuws" className="text-accent underline underline-offset-4">
            {messages.articlesBackToOverview}
          </Link>
        </p>
      </article>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl text-primary">{messages.articlesRelated}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  )
}
