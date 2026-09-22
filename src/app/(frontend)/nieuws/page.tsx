import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getArticles, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const messages = getMessages()

  return {
    title: messages.articlesTitle,
    description: messages.articlesIntro,
    alternates: { canonical: '/nieuws' },
    openGraph: {
      title: messages.articlesTitle,
      description: messages.articlesIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

export default async function ArticlesPage() {
  const { isEnabled: isDraft } = await draftMode()
  const articles = await getArticles(undefined, isDraft)
  const messages = getMessages()

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
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.articlesTitle}</h1>
        <p>{messages.articlesIntro}</p>
      </div>

      {articles.length === 0 ? (
        <p className="mt-8">{messages.articlesEmpty}</p>
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
