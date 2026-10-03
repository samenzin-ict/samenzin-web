/**
 * The site's own origin.
 *
 * Needed by anything that has to be absolute: canonical URLs, the sitemap,
 * Open Graph images, Mollie's redirect, and every link in an e-mail — the
 * password-reset link above all, which is useless if it points somewhere the
 * recipient cannot reach.
 *
 * Three sources, in order:
 *
 * 1. `NEXT_PUBLIC_SERVER_URL`, which is the real answer and the only one that
 *    gives a stable public address. Set it in Production.
 * 2. `VERCEL_URL`, the deployment's own hostname. This is for Preview, where
 *    every deployment has a different address and there is nothing stable to
 *    pin. Without it a preview would put http://localhost:3000 into the
 *    password-reset mail, which is a dead link for whoever receives it.
 *    Read at runtime, which is fine because every caller is server-side; it is
 *    not a NEXT_PUBLIC_ variable and would be undefined in the browser.
 * 3. localhost, so a local clone and the container build work with nothing set.
 */
export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL?.trim()

  if (configured) return configured.replace(/\/$/, '')

  const deployment = process.env.VERCEL_URL?.trim()

  // Vercel gives the host without a scheme, and it is always https.
  if (deployment) return `https://${deployment.replace(/\/$/, '')}`

  return 'http://localhost:3000'
}
