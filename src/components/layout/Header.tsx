import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { Logo } from '@/components/layout/Logo'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
import { getMember } from '@/lib/member-auth'
import { getNavigation } from '@/lib/navigation'
import { getSiteSettings } from '@/lib/payload'

/**
 * The top of every page.
 *
 * A server component, so the navigation is in the HTML rather than appearing
 * after JavaScript runs. Only the small-screen menu, which needs state, is a
 * client component.
 *
 * Everything shown here comes from SiteSettings. The logo, the name and the
 * links in the mockups are placeholders and must never be hardcoded
 * (docs/design/README.md).
 */
export async function Header() {
  const [settings, member] = await Promise.all([getSiteSettings(), getMember()])
  const messages = getMessages()

  const navigation = await getNavigation(settings.mainNavigation ?? [])
  const cta = settings.headerCta

  /*
   * z-50 so the header, and the menu panels hanging from it, stay above the
   * page. Without it a banner image further down — positioned, and later in
   * the document — painted over the top of the open mobile menu.
   */
  return (
    <header className="relative z-50 border-b border-border bg-card">
      <Container>
        {/*
          Logo on the left, the donate button on the right, the menu centred in
          what is left. The bar switches to the full menu at lg rather than md:
          the foundation's name is long, and at md five items and the button
          beside it would wrap.
        */}
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Logo settings={settings} />

          <DesktopNav items={navigation} label={messages.mainNavigationLabel} />

          <div className="flex items-center gap-1 sm:gap-2">
            {/*
              The way in to Mijn omgeving, as docs/design/02 shows it: a quiet
              link beside the donate button rather than a second button
              competing with it. Signed in, it becomes the way back.

              getMember returns immediately when there is no session cookie, so
              this costs an anonymous visitor nothing.
            */}
            <Link
              href={member ? '/mijn' : '/mijn/inloggen'}
              className="hidden min-h-11 items-center px-3 text-sm text-muted-foreground hover:text-primary hover:underline lg:flex"
            >
              {member ? messages.headerMyAccount : messages.headerLogin}
            </Link>

            {cta?.label && cta.url ? (
              <Button asChild variant="cta" size="sm">
                <Link href={cta.url}>{cta.label}</Link>
              </Button>
            ) : null}

            {/*
              The small screen has no room for the link above, so the login
              entry is appended to the menu instead of being dropped.
            */}
            <MobileMenu
              items={[
                ...navigation,
                {
                  id: 'portal',
                  label: member ? messages.headerMyAccount : messages.headerLogin,
                  url: member ? '/mijn' : '/mijn/inloggen',
                },
              ]}
              messages={messages}
            />
          </div>
        </div>
      </Container>
    </header>
  )
}
