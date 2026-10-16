import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { RichTextContent } from '@/components/RichTextContent'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleMeta } from '@/components/articles/ArticleMeta'
import { CategoryPill } from '@/components/articles/CategoryPill'
import { Container } from '@/components/layout/Container'
import { getMessages, type Messages } from '@/i18n'
import { articlePath, sectionPath, type ArticleSection } from '@/lib/article-sections'
import { getArticleBySlug, getArticles, getRelatedArticles, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

/**
 * The overview and the detail page of a rubriek, shared by /nieuws and
 * /artikelen. The two look the same on purpose — what differs is which items
 * they list and the words around them — so they are one implementation with
 * the rubriek passed in, and the route files are a few lines each.
 */

const sectionMessages = (section: ArticleSection, messages: Messages) =>
  section === 'nieuws'
    ? {
        title: messages.newsTitle,
        intro: messages.newsIntro,
        empty: messages.newsEmpty,
        related: messages.newsRelated,
        backToOverview: messages.newsBackToOverview,
      }
    : {
        title: messages.articlesTitle,
        intro: messages.articlesIntro,
        empty: messages.articlesEmpty,
        related: messages.articlesRelated,
        backToOverview: messages.articlesBackToOverview,
      }

export async function overviewMetadata(section: ArticleSection): Promise<Metadata> {
  const settings = await getSiteSettings()
  const text = sectionMessages(section, getMessages())

  return {
    title: text.title,
    description: text.intro,
    alternates: { canonical: sectionPath(section) },
    openGraph: {
      title: text.title,
      description: text.intro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

export async function ArticleOverviewPage({ section }: { section: ArticleSection }) {
  const { isEnabled: isDraft } = await draftMode()
  const articles = await getArticles(section, undefined, isDraft)
  const text = sectionMessages(section, getMessages())

  /*
   * The lead card is the newest article marked as featured. The list is
   * already sorted by date, so the first match is the newest one and more than
   * one marked article is not a problem.
   */
  const featured = articles.find((article) => article.featured)
  const rest = featured ? articles.filter((article) => article.id !== featured.id) : articles

  return (
    <Container className="py-10 md:py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">{text.title}</h1>
        <p>{text.intro}</p>
      </div>

      {articles.length === 0 ? (
        <p className="mt-8">{text.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured ? <ArticleCard article={featured} featured /> : null}
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </ul>
      )}
    </Container>
  )
}

export async function articleMetadata(slug: string): Promise<Metadata> {
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
    alternates: { canonical: articlePath(article) },
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

export async function ArticleDetailPage({ section, slug }: { section: ArticleSection; slug: string }) {
  const { isEnabled: isDraft } = await draftMode()
  const article = await getArticleBySlug(slug, undefined, isDraft)

  if (!article) notFound()

  /*
   * Asked for under the other rubriek: an old link from before the split, or
   * an item an editor moved. Send the reader, and search engines, to where it
   * lives now rather than showing it at two addresses.
   */
  if (article.section !== section) permanentRedirect(articlePath(article))

  const messages = getMessages()
  const media = typeof article.image === 'object' ? (article.image as Media | null) : null
  const tags = article.tags ?? []
  const related = await getRelatedArticles(article.id, section)
  const text = sectionMessages(section, messages)

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
          <Link href={sectionPath(section)} className="text-accent underline underline-offset-4">
            {text.backToOverview}
          </Link>
        </p>
      </article>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl text-primary">{text.related}</h2>
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
