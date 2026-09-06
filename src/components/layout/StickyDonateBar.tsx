import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getSiteSettings } from '@/lib/payload'

/**
 * The bar pinned to the bottom of the screen on a phone, as drawn in
 * docs/design/03-homepage-mobile.png.
 *
 * Most visitors arrive on a phone (CLAUDE.md rule 7) and the donate action is
 * the reason several of them came, so it stays reachable without scrolling
 * back to the header. Hidden from md upwards, where the header button is
 * always in view anyway.
 *
 * Renders nothing when no call to action has been configured, so the bar
 * cannot appear empty while Mollie is still being arranged.
 */
export async function StickyDonateBar() {
  const settings = await getSiteSettings()
  const cta = settings.headerCta

  if (!cta?.label || !cta.url) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3 md:hidden">
      <Button asChild variant="cta" className="w-full">
        <Link href={cta.url}>{cta.label}</Link>
      </Button>
    </div>
  )
}
