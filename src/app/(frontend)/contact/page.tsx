import type { Metadata } from 'next'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container } from '@/components/layout/Container'
import { ContactForm } from '@/components/contact/ContactForm'
import { getMessages } from '@/i18n'
import { buildPageMetadata } from '@/lib/metadata'
import { getPageBySlug, getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const CONTACT_SLUG = 'contact'

/**
 * The contact page: form, addresses and opening hours (ROADMAP.md).
 *
 * A fixed route rather than a plain CMS page, because the form has to live
 * somewhere. An editor can still add an introduction by creating a page with
 * the slug "contact"; its blocks render above the form.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(CONTACT_SLUG), getSiteSettings()])
  const messages = getMessages()

  if (!page) {
    return { title: messages.contactHeading, description: messages.contactFormHeading }
  }

  return buildPageMetadata({ page, settings })
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug(CONTACT_SLUG), getSiteSettings()])
  const messages = getMessages()

  const addresses = settings.addresses ?? []
  const hasHero = page?.body?.[0]?.blockType === 'hero'

  return (
    <>
      {!hasHero ? (
        <Container className="pt-10 md:pt-14">
          <h1 className="font-heading text-3xl sm:text-4xl">
            {page?.title ?? messages.contactHeading}
          </h1>
        </Container>
      ) : null}

      <RenderBlocks blocks={page?.body} />

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl text-primary">{messages.contactFormHeading}</h2>
            <div className="mt-5 max-w-prose">
              <ContactForm messages={messages} />
            </div>
          </div>

          <div className="space-y-8">
            {addresses.length > 0 ? (
              <section>
                <h2 className="font-heading text-2xl text-primary">
                  {messages.contactAddresses}
                </h2>
                <ul className="mt-4 space-y-4">
                  {addresses.map((address) => (
                    <li key={address.id ?? address.city}>
                      <p className="font-semibold">{address.label}</p>
                      <address className="not-italic">
                        {address.street ? (
                          <>
                            {address.street}
                            <br />
                          </>
                        ) : null}
                        {address.postalCode ? `${address.postalCode} ` : ''}
                        {address.city}
                      </address>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {settings.email || settings.phone ? (
              <section>
                <h2 className="font-heading text-2xl text-primary">{messages.contactHeading}</h2>
                <ul className="mt-4 space-y-2">
                  {settings.phone ? (
                    <li>
                      <a
                        href={`tel:${settings.phone.replace(/\s/g, '')}`}
                        className="text-accent underline underline-offset-4"
                      >
                        {settings.phone}
                      </a>
                    </li>
                  ) : null}
                  {settings.email ? (
                    <li>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-accent underline underline-offset-4"
                      >
                        {settings.email}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>
            ) : null}

            {settings.openingHours ? (
              <section>
                <h2 className="font-heading text-2xl text-primary">
                  {messages.contactOpeningHours}
                </h2>
                <p className="mt-4 whitespace-pre-line">{settings.openingHours}</p>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  )
}
