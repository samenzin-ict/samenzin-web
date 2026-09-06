import localFont from 'next/font/local'

/*
 * Self-hosted fonts. Nothing is fetched from a third party at build time or
 * at run time, so no visitor IP address reaches a foreign CDN. See
 * ARCHITECTURE.md, "Privacy by design".
 *
 * Both faces are variable, so one file covers every weight from 400 to 700.
 * The files are subset to latin + latin-ext; see src/fonts/README.md for
 * provenance and how to regenerate them.
 */

/** Headings. Replaces Cambria from the mockups. */
export const serifHeading = localFont({
  src: [
    {
      path: './files/SourceSerif4-Variable.woff2',
      weight: '400 700',
      style: 'normal',
    },
  ],
  variable: '--font-serif-heading',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

/** Body copy and interface. Replaces Calibri from the mockups. */
export const sansBody = localFont({
  src: [
    {
      path: './files/SourceSans3-Variable.woff2',
      weight: '400 700',
      style: 'normal',
    },
    {
      path: './files/SourceSans3-Italic-Variable.woff2',
      weight: '400 700',
      style: 'italic',
    },
  ],
  variable: '--font-sans-body',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})
