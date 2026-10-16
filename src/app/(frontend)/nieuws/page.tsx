import type { Metadata } from 'next'

import { ArticleOverviewPage, overviewMetadata } from '@/components/articles/article-pages'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return overviewMetadata('nieuws')
}

export default async function Page() {
  return <ArticleOverviewPage section="nieuws" />
}
