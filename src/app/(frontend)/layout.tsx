import React from 'react'
import type { Metadata } from 'next'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { StickyDonateBar } from '@/components/layout/StickyDonateBar'
import { sansBody, serifHeading } from '@/fonts'
import { defaultLocale, getMessages } from '@/i18n'
import { getSiteSettings } from '@/lib/payload'
import { getSiteUrl } from '@/lib/site-url'

import './globals.css'

/**
 * Site-wide defaults every page inherits.
 *
 * metadataBase is what turns the relative Open Graph image paths coming out of
 * the CMS into the absolute URLs that social platforms require. The title
 * template appends the organisation name, so a page only has to supply its own
 * title and the name is never hardcoded.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.organisationName

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: name ? `${name}${settings.tagline ? ` — ${settings.tagline}` : ''}` : '',
      template: name ? `%s — ${name}` : '%s',
    },
    description: settings.tagline ?? undefined,
  }
}

/*
 * Root layout for the public site. The font variables are attached here so
 * --font-serif-heading and --font-sans-body are available to the tokens in
 * globals.css.
 *
 * lang comes from the default locale rather than a hardcoded string, so
 * enabling a second locale does not leave every page claiming to be Dutch.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = getMessages()

  return (
    <html lang={defaultLocale} className={`${serifHeading.variable} ${sansBody.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {/*
          Lets a keyboard user jump past the navigation instead of tabbing
          through every link on every page. Visible only once focused.
        */}
        <a
          href="#inhoud"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-primary"
        >
          {messages.skipToContent}
        </a>

        <Header />

        {/*
          pb-24 on small screens keeps the sticky donate bar from covering the
          last of the content.
        */}
        <main id="inhoud" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>

        <Footer />
        <StickyDonateBar />
      </body>
    </html>
  )
}
