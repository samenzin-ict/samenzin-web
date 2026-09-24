import type { Article } from '@/payload-types'

/*
 * The Dutch labels for the category values. They live here rather than in the
 * locale file because they must match the options in the collection exactly;
 * keeping them next to the only component that renders them makes a mismatch
 * obvious.
 */
const labels: Record<NonNullable<Article['category']>, string> = {
  nieuws: 'Nieuws',
  artikel: 'Artikel',
  interview: 'Interview',
  verslag: 'Verslag',
  project: 'Project',
  vrijwilliger: 'Vrijwilliger',
}

/** The small label on an article card, as drawn in the mockup. */
export function CategoryPill({ category }: { category?: Article['category'] }) {
  if (!category) return null

  return (
    <span className="self-start rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
      {labels[category]}
    </span>
  )
}
