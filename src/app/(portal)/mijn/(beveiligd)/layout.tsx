import React from 'react'

import { Container } from '@/components/layout/Container'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { getMessages } from '@/i18n'
import { requireMember } from '@/lib/member-auth'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Everything behind the member login.
 *
 * The session is checked here rather than in middleware. Middleware runs on
 * every matching request before the page does, but verifying a Payload token
 * means reaching the database, which middleware is the wrong place for. A
 * layout is on the server, runs before any page in the group renders, and
 * every route in (beveiligd) inherits it, so a page added later is protected
 * by existing.
 */
export default async function ProtectedPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [member, settings] = await Promise.all([requireMember(), getSiteSettings()])
  const messages = getMessages()

  return (
    <>
      <PortalHeader
        messages={messages}
        organisationName={settings.organisationName}
        memberName={member.name}
      />

      <main id="inhoud" className="flex-1 py-8 md:py-12">
        <Container className="space-y-8">{children}</Container>
      </main>
    </>
  )
}
