import React from 'react'
import type { Metadata } from 'next'

import { sansBody, serifHeading } from '@/fonts'
import { defaultLocale, getMessages } from '@/i18n'

import '../(frontend)/globals.css'

/**
 * Root layout for Mijn omgeving. ROADMAP 3.2.
 *
 * A second root layout rather than a nested one, because the member area has
 * its own chrome: no public menu, no footer, no donate bar. Next supports
 * several root layouts as long as `/` lives in one of the groups, which it
 * does, in (frontend).
 *
 * The whole area is kept out of search engines. Nothing here is public, and
 * the login page being indexed serves nobody.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const messages = getMessages()

  return (
    <html lang={defaultLocale} className={`${serifHeading.variable} ${sansBody.variable}`}>
      <body className="flex min-h-dvh flex-col bg-muted">
        <a
          href="#inhoud"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-primary"
        >
          {messages.skipToContent}
        </a>

        {children}
      </body>
    </html>
  )
}
