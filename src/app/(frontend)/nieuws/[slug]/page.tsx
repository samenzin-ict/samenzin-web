import type { Metadata } from 'next'

import { ArticleDetailPage, articleMetadata } from '@/components/articles/article-pages'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return articleMetadata((await params).slug)
}

export default async function Page({ params }: Params) {
  return <ArticleDetailPage section="nieuws" slug={(await params).slug} />
}
