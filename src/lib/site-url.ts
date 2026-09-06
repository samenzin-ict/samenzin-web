/**
 * The site's own origin, used for canonical URLs, the sitemap and Open Graph
 * images, all of which have to be absolute.
 *
 * Falls back to localhost so development and the container build work without
 * the variable being set. Anything user-visible that depends on the real
 * domain will be wrong until NEXT_PUBLIC_SERVER_URL is configured on the
 * server; the canonical domain is still an open question in PROGRESS.md.
 */
export const getSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
