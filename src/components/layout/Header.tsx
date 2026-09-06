import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Logo } from '@/components/layout/Logo'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { Button } from '@/components/ui/button'
import { getMessages } from '@/i18n'
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
  const settings = await getSiteSettings()
  const messages = getMessages()

  const navigation = settings.mainNavigation ?? []
  const cta = settings.headerCta

  return (
    <header className="relative border-b border-border bg-card">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Logo settings={settings} />

          <nav aria-label={messages.mainNavigationLabel} className="hidden md:block">
            <ul className="flex items-center gap-6">
              {navigation.map((item) => (
                <li key={item.id ?? item.url}>
                  <Link
                    href={item.url}
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {cta?.label && cta.url ? (
              <Button asChild variant="cta" size="sm">
                <Link href={cta.url}>{cta.label}</Link>
              </Button>
            ) : null}

            <MobileMenu items={navigation} messages={messages} />
          </div>
        </div>
      </Container>
    </header>
  )
}
