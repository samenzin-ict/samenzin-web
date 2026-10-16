/**
 * The two rubrieken an article is published in, and where each lives.
 *
 * Nieuws is what is happening now: an announcement, a report of an evening,
 * news about a project. Artikelen are the pieces written to be read later:
 * reflections, interviews, background. They share one collection because they
 * are written the same way; the rubriek decides which overview shows them and
 * which address they get.
 *
 * In one place because the collection (preview links), the pages, the cards,
 * the menu and the sitemap all need the same answer.
 */
export const ARTICLE_SECTIONS = ['nieuws', 'artikelen'] as const

export type ArticleSection = (typeof ARTICLE_SECTIONS)[number]

export const sectionPath = (section: ArticleSection): string => `/${section}`

export const articlePath = (article: { section?: ArticleSection | null; slug?: string | null }): string =>
  `${sectionPath(article.section ?? 'artikelen')}/${article.slug ?? ''}`
