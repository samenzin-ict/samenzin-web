import localFont from 'next/font/local'

/*
 * Self-hosted fonts. Nothing is fetched from a third party at build time or
 * at run time, so no visitor IP address reaches a foreign CDN. See
 * ARCHITECTURE.md, "Privacy by design".
 *
 * The house style (docs/SamenZin_Visual_Identity_Guidelines.pdf) sets
 * everything in one family, Avenir: Heavy or Bold for titles, Medium for
 * subtitles and labels, Book for running text. Avenir is a commercial face
 * without a web licence, so Nunito Sans stands in for it; see
 * src/fonts/README.md.
 *
 * One variable file per style covers every weight from 400 to 800. The files
 * are subset to latin + latin-ext.
 */
export const brandSans = localFont({
  src: [
    {
      path: './files/NunitoSans-Variable.woff2',
      weight: '400 800',
      style: 'normal',
    },
    {
      path: './files/NunitoSans-Italic-Variable.woff2',
      weight: '400 800',
      style: 'italic',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})
