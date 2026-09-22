'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'

/**
 * Shown when a page throws at run time.
 *
 * Without this the visitor gets Next's built-in error screen: unstyled,
 * unbranded and in English. This keeps the site's own header and footer, so a
 * failure looks like a hiccup rather than the site being gone.
 *
 * Deliberately says nothing about what broke. The message could name a
 * database column or a connection string, which is useful to a maintainer and
 * to nobody else; it goes to the server log instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const messages = getMessages()

  useEffect(() => {
    console.error('Page failed to render', error)
  }, [error])

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-prose space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl">{messages.errorTitle}</h1>
        <p>{messages.errorBody}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* reset() re-renders the segment, which is worth a try for a transient fault. */}
          <Button onClick={reset}>{messages.errorRetry}</Button>
          <Button asChild variant="outline">
            <Link href="/">{messages.errorHome}</Link>
          </Button>
        </div>

        {/*
          The digest is the only handle a maintainer has to find this exact
          failure in the server log, so it is shown, quietly.
        */}
        {error.digest ? <p className="pt-2 text-sm opacity-70">Referentie: {error.digest}</p> : null}
      </div>
    </Container>
  )
}
