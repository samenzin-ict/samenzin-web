import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getSiteSettings } from '@/lib/payload'
import type { SiteSetting } from '@/payload-types'

type SocialLink = NonNullable<SiteSetting['socialLinks']>[number]

/*
 * The mockup draws social media as brand icons. lucide-react 1.x removed every
 * brand icon for trademark reasons, and shipping the marks ourselves means
 * taking on their licensing and keeping them current. The platform name as a
 * legible label costs nothing, reads correctly on a screen reader and needs no
 * maintenance. Revisit if the media commission wants the icons back.
 */
const socialLabels: Record<SocialLink['platform'], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
}

/**
 * The bottom of every page, modelled on docs/design/02-homepage-desktop.png:
 * columns of links, contact details and social media on the deep green.
 *
 * Every part is optional. A section with nothing in it is left out entirely
 * rather than rendering an empty heading, so the footer stays tidy while the
 * board is still filling the settings in.
 */
export async function Footer() {
  const settings = await getSiteSettings()
  const messages = getMessages()

  const columns = settings.footerColumns ?? []
  const socialLinks = settings.socialLinks ?? []
  const addresses = settings.addresses ?? []
  const hasContact = Boolean(settings.email || settings.phone || addresses.length > 0)

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-3">
            <p className="font-heading text-lg">{settings.organisationName}</p>
            {settings.footerIntro ? (
              <p className="text-sm opacity-90">{settings.footerIntro}</p>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav
              key={column.id ?? column.title}
              aria-label={`${messages.footerNavigationLabel}: ${column.title}`}
            >
              <h2 className="font-heading text-base text-primary-foreground">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {(column.links ?? []).map((link) => (
                  <li key={link.id ?? link.url}>
                    <Link href={link.url} className="text-sm opacity-90 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {hasContact ? (
            <div>
              <h2 className="font-heading text-base">{messages.contactHeading}</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {addresses.map((address) => (
                  <li key={address.id ?? address.city} className="flex gap-2">
                    <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <span className="not-italic opacity-90">
                      {address.street ? `${address.street}, ` : ''}
                      {address.postalCode ? `${address.postalCode} ` : ''}
                      {address.city}
                    </span>
                  </li>
                ))}
                {settings.phone ? (
                  <li className="flex gap-2">
                    <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:underline">
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li className="flex gap-2">
                    <Mail aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <a href={`mailto:${settings.email}`} className="hover:underline">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-6 border-t border-primary-foreground/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {settings.copyright ? (
              <p className="text-sm opacity-80">{settings.copyright}</p>
            ) : null}

            {/*
              Permanent, not one of the configurable footer columns. Publishing
              the ANBI page and linking to it from the site is a statutory
              requirement (docs/ANBI_guide.docx), so an editor rearranging the
              footer must not be able to remove it.
            */}
            <Link href="/anbi" className="text-sm underline underline-offset-4">
              {messages.anbiFooterLink}
            </Link>
          </div>

            {socialLinks.length > 0 ? (
              <nav aria-label={messages.socialNavigationLabel}>
                <ul className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <li key={link.id ?? link.url}>
                      <a
                        href={link.url}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="inline-flex min-h-11 items-center rounded-md px-3 text-sm underline-offset-4 hover:underline"
                      >
                        {socialLabels[link.platform]}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
        </div>
      </Container>
    </footer>
  )
}
