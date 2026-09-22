'use client'

import { useEffect } from 'react'

import { sansBody, serifHeading } from '@/fonts'
import { getMessages } from '@/i18n'

import './(frontend)/globals.css'

/**
 * The last resort: shown when the root layout itself fails, which in practice
 * means the database is unreachable, since the header and footer read
 * SiteSettings on every request.
 *
 * error.tsx cannot help there. It renders inside the layout, so if the layout
 * is what threw there is nothing left to render into. Without this file the
 * visitor gets a blank page with a 500.
 *
 * It replaces the whole document, so it has to supply html and body itself and
 * cannot use the site header or footer. The stylesheet is imported directly to
 * keep the brand colours rather than hardcoding them here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const messages = getMessages()

  useEffect(() => {
    console.error('Root layout failed to render', error)
  }, [error])

  return (
    /*
     * The font variables are attached here too. This document replaces the
     * root layout, so nothing else sets them and the headings would otherwise
     * fall back to Georgia.
     */
    <html lang="nl" className={`${serifHeading.variable} ${sansBody.variable}`}>
      <body className="bg-background font-body text-foreground">
        <main className="mx-auto max-w-prose px-4 py-16 sm:px-6 md:py-24">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl text-primary sm:text-4xl">
              {messages.errorTitle}
            </h1>
            <p>{messages.errorBody}</p>

            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground"
            >
              {messages.errorRetry}
            </button>

            {error.digest ? (
              <p className="pt-2 text-sm opacity-70">Referentie: {error.digest}</p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  )
}
