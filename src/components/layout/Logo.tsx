import Image from 'next/image'
import Link from 'next/link'

import type { Media, SiteSetting } from '@/payload-types'
import { getMessages } from '@/i18n'

/**
 * The link back to the homepage.
 *
 * Falls back to the organisation name in the heading face when no logo has
 * been uploaded. The logo in the mockups is a placeholder and the real one
 * comes from the media commission, so the site has to look right without it
 * (docs/design/README.md).
 */
export function Logo({ settings }: { settings: SiteSetting }) {
  const messages = getMessages()
  const logo = typeof settings.logo === 'object' ? (settings.logo as Media | null) : null

  return (
    <Link
      href="/"
      aria-label={messages.homeLinkLabel}
      className="flex items-center gap-3 rounded-md text-primary"
    >
      {logo?.url ? (
        <Image
          src={logo.url}
          /*
           * Deliberately empty: the link already carries an accessible name
           * and the organisation name sits next to it, so describing the logo
           * again would make a screen reader announce it twice.
           */
          alt=""
          width={logo.width ?? 160}
          height={logo.height ?? 40}
          priority
          className="h-9 w-auto sm:h-10"
        />
      ) : null}
      <span className="font-heading text-lg font-semibold sm:text-xl">
        {settings.organisationName}
      </span>
    </Link>
  )
}
