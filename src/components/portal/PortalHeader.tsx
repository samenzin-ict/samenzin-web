import { logout } from '@/app/(portal)/mijn/(beveiligd)/actions'
import { Container } from '@/components/layout/Container'
import { Logo } from '@/components/layout/Logo'
import { PortalNav } from '@/components/portal/PortalNav'
import type { Messages } from '@/i18n'
import type { SiteSetting } from '@/payload-types'

/**
 * The chrome of Mijn omgeving, per `08-ledenportaal-mijn-taken.png`.
 *
 * The same logo as the public site's header, so a member signing in can see
 * they have not left it.
 *
 * `print:hidden` keeps all of it off a printed page. The only thing worth
 * printing in Mijn omgeving is a certificate (ROADMAP 3.6), and it should come
 * out as a document rather than as a screenshot of a website with tabs and a
 * sign-out link across the top.
 */
export function PortalHeader({
  messages,
  settings,
  memberName,
}: {
  messages: Messages
  settings: Pick<SiteSetting, 'logo'>
  memberName: string
}) {
  return (
    <header className="border-b border-border bg-card print:hidden">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <Logo settings={settings} />

        <div className="flex items-center gap-4">
          <span className="text-sm">{memberName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-11 rounded-md px-3 text-sm text-primary underline underline-offset-4 hover:text-accent"
            >
              {messages.portalLogout}
            </button>
          </form>
        </div>
      </Container>

      <PortalNav messages={messages} />
    </header>
  )
}
