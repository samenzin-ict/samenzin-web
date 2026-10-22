import Image from 'next/image'
import Link from 'next/link'

import logoNegative from '@/assets/brand/logo-negative.png'
import logoPositive from '@/assets/brand/logo.png'
import mark from '@/assets/brand/mark.png'
import type { Media, SiteSetting } from '@/payload-types'
import { getMessages } from '@/i18n'
import { cn } from '@/lib/utils'

type Tone = 'positive' | 'negative'

/**
 * The foundation's logo, from the media commission's house style
 * (docs/SamenZin_Visual_Identity_Guidelines.pdf). The files are made from
 * docs/Logo/ by scripts/build-brand-assets.py.
 *
 * Two rules from the guidelines (page 9) decide the sizes here:
 *
 * - The full logo is not shown narrower than about 220 px. Below that the
 *   symbol is used on its own. A phone header has room for the symbol, the
 *   donate button and the menu, not for 220 px of logo beside them, so with
 *   `compact` the full logo only appears from the sm breakpoint.
 * - The symbol and the wordmark keep their proportions. They are one image,
 *   never two pieces laid out next to each other.
 *
 * `negative` is the white-wordmark version for navy grounds such as the
 * footer.
 *
 * A logo uploaded in SiteSettings overrides the house-style one on light
 * grounds, so the board can change it without a developer. The negative
 * version has no such field: an uploaded logo is drawn for a light ground and
 * would vanish on navy.
 *
 * alt is deliberately empty. Wherever the logo is a link, the link carries an
 * accessible name; elsewhere the organisation name is written out nearby.
 */
export function BrandLogo({
  settings,
  tone = 'positive',
  compact = false,
  className,
}: {
  settings: Pick<SiteSetting, 'logo'>
  tone?: Tone
  compact?: boolean
  className?: string
}) {
  const uploaded =
    tone === 'positive' && typeof settings.logo === 'object' ? (settings.logo as Media | null) : null

  if (uploaded?.url) {
    return (
      <Image
        src={uploaded.url}
        alt=""
        width={uploaded.width ?? 220}
        height={uploaded.height ?? 64}
        priority
        className={cn('h-10 w-auto sm:h-12', className)}
      />
    )
  }

  return (
    <span className={cn('flex items-center', className)}>
      {compact ? (
        <Image src={mark} alt="" priority sizes="40px" className="size-10 sm:hidden" />
      ) : null}
      <Image
        src={tone === 'negative' ? logoNegative : logoPositive}
        alt=""
        priority={tone === 'positive'}
        sizes="240px"
        className={cn('h-auto w-[220px] lg:w-[240px]', compact && 'hidden sm:block')}
      />
    </span>
  )
}

/** The logo as the link back to the homepage, for the top of a page. */
export function Logo({ settings }: { settings: Pick<SiteSetting, 'logo'> }) {
  const messages = getMessages()

  return (
    <Link href="/" aria-label={messages.homeLinkLabel} className="flex shrink-0 rounded-md">
      <BrandLogo settings={settings} compact />
    </Link>
  )
}
