import type { Metadata } from 'next'
import Link from 'next/link'

import { getMessages } from '@/i18n'
import { getCertificates } from '@/lib/certificates'
import { formatLongDate } from '@/lib/dates'
import { requireMember } from '@/lib/member-auth'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mijn certificaten',
  robots: { index: false, follow: false },
}

/**
 * The courses this member has finished. ROADMAP 3.6.
 *
 * Not a fifth tab in the portal nav: docs/design/08 draws four, and Mijn uren
 * already set the precedent of being reached from the page it belongs to. This
 * is linked from Mijn cursussen.
 */
export default async function CertificatesPage() {
  const member = await requireMember()
  const payload = await getPayloadClient()
  const messages = getMessages()
  const certificates = await getCertificates(payload, member)

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl">
          {messages.portalCertificatesTitle}
        </h1>
        <p>{messages.portalCertificatesIntro}</p>
      </div>

      {certificates.length === 0 ? (
        <p>{messages.portalCertificatesEmpty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <h2 className="font-heading text-xl text-primary">
                {certificate.course.title}
              </h2>
              <p className="text-sm">
                {messages.portalCertificateCompletedOn}{' '}
                <time dateTime={certificate.completedAt}>
                  {formatLongDate(certificate.completedAt)}
                </time>
              </p>
              <Link
                href={`/mijn/certificaten/${certificate.id}`}
                className="mt-auto text-accent underline underline-offset-4"
              >
                {messages.portalCertificateView}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link href="/mijn/cursussen" className="text-accent underline underline-offset-4">
          {messages.portalNavCourses}
        </Link>
      </p>
    </section>
  )
}
