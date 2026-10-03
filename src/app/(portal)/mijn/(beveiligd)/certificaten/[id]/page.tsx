import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/portal/PrintButton'
import { getMessages } from '@/i18n'
import { getCertificate } from '@/lib/certificates'
import { formatLongDate } from '@/lib/dates'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Certificaat',
  robots: { index: false, follow: false },
}

/**
 * One certificate. ROADMAP 3.6.
 *
 * A page with a print stylesheet rather than a generated PDF. The browser's
 * own "Opslaan als pdf" produces the file, which means no PDF library in the
 * bundle, no fonts to embed by hand, and a document that is real text — so it
 * can be read by a screen reader, zoomed on a phone and searched. The cost is
 * that margins vary a little between browsers, which for a certificate of
 * participation is not worth a dependency.
 *
 * `print:hidden` takes the portal header, the tabs and the buttons out of the
 * printed page, leaving the certificate alone on it. The wording comes from
 * Instellingen, so the board can change it without a deploy.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  // A non-numeric id is not a certificate that could exist.
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const member = await requireMember()
  const payload = await getPayloadClient()
  const [certificate, settings] = await Promise.all([
    getCertificate(payload, member, numericId),
    getSiteSettings(),
  ])

  // Somebody else's enrolment, one that does not exist, or one not finished.
  if (!certificate) notFound()

  const messages = getMessages()
  const logo = typeof settings.logo === 'object' ? (settings.logo as Media | null) : null
  const statement =
    settings.certificate?.statement?.trim() || messages.certificateStatementDefault

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <PrintButton label={messages.certificatePrint} />
        <Link href="/mijn/certificaten" className="text-accent underline underline-offset-4">
          {messages.certificateBackToList}
        </Link>
      </div>

      <p className="text-sm print:hidden">{messages.certificatePrintHint}</p>

      {/*
        The document. `certificate` carries the print rules in globals.css; the
        rest is ordinary layout so it reads properly on a phone too.
      */}
      <article className="certificate rounded-lg border border-border bg-card p-6 text-center sm:p-10">
        <header className="space-y-3">
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={logo.alt ?? settings.organisationName}
              width={logo.width ?? 200}
              height={logo.height ?? 80}
              className="mx-auto h-16 w-auto object-contain"
            />
          ) : (
            <p className="font-heading text-xl text-primary">{settings.organisationName}</p>
          )}

          <h1 className="font-heading text-2xl text-primary sm:text-3xl">
            {messages.certificateHeading}
          </h1>
        </header>

        <p className="mt-8 text-sm uppercase tracking-wide">
          {messages.certificateAwardedTo}
        </p>
        <p className="font-heading text-3xl text-primary sm:text-4xl">{member.name}</p>

        <p className="mx-auto mt-4 max-w-prose">{statement}</p>

        <dl className="mt-8 grid gap-4 text-left sm:grid-cols-3">
          <div>
            <dt className="text-sm">{messages.certificateCourseLabel}</dt>
            <dd className="font-semibold text-primary">{certificate.course.title}</dd>
          </div>
          <div>
            <dt className="text-sm">{messages.certificateDateLabel}</dt>
            <dd className="font-semibold text-primary">
              <time dateTime={certificate.completedAt}>
                {formatLongDate(certificate.completedAt)}
              </time>
            </dd>
          </div>
          {certificate.course.duration ? (
            <div>
              <dt className="text-sm">{messages.certificateDurationLabel}</dt>
              <dd className="font-semibold text-primary">{certificate.course.duration}</dd>
            </div>
          ) : null}
        </dl>

        <footer className="mt-12 flex flex-col items-center gap-1">
          <span aria-hidden className="block w-56 border-t border-border" />
          <p className="text-sm">
            {settings.certificate?.signatoryName || messages.certificateSignature}
          </p>
          {settings.certificate?.signatoryRole ? (
            <p className="text-sm">{settings.certificate.signatoryRole}</p>
          ) : null}
          <p className="mt-2 text-sm">{settings.organisationName}</p>
        </footer>
      </article>
    </section>
  )
}
