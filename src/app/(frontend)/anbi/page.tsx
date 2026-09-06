import type { Metadata } from 'next'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { getMessages } from '@/i18n'
import { getAnbiGegevens, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

/**
 * The statutory ANBI publication page.
 *
 * This page is one of the two reasons phase 1 exists (ROADMAP.md). Dutch tax
 * law prescribes what has to be published, so the structure is fixed here
 * rather than assembled from blocks: a volunteer cannot accidentally leave a
 * mandatory heading out, and the order stays the same for whoever checks it.
 *
 * Sections with nothing in them are left out rather than rendered as an empty
 * heading, so a half-filled page reads as incomplete instead of broken.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, messages] = [await getSiteSettings(), getMessages()]

  return {
    title: messages.anbiTitle,
    description: messages.anbiIntro,
    openGraph: {
      title: messages.anbiTitle,
      description: messages.anbiIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default async function AnbiPage() {
  const anbi = await getAnbiGegevens()
  const messages = getMessages()

  const identity: { term: string; value: string }[] = ([
    { term: messages.anbiStatutoryName, value: anbi.statutoryName },
    { term: messages.anbiRsin, value: anbi.rsin },
    { term: messages.anbiKvk, value: anbi.kvkNumber },
    { term: messages.anbiEmail, value: anbi.contact?.email },
    { term: messages.anbiPhone, value: anbi.contact?.phone },
    { term: messages.anbiAddress, value: anbi.contact?.address },
  ] as { term: string; value?: string | null }[]).filter(
    (row): row is { term: string; value: string } => Boolean(row.value),
  )

  const policyPlanDocument =
    typeof anbi.policyPlanDocument === 'object' ? (anbi.policyPlanDocument as Media | null) : null

  const boardMembers = anbi.boardMembers ?? []
  const annualReports = [...(anbi.annualReports ?? [])].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  )

  return (
    <Container className="py-10 md:py-16">
      <div className="max-w-3xl space-y-10">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl sm:text-4xl">{messages.anbiTitle}</h1>
          <p className="max-w-prose">{messages.anbiIntro}</p>
        </div>

        {identity.length > 0 ? (
          <Section title={messages.anbiContact}>
            <dl className="divide-y divide-border border-y border-border">
              {identity.map((row) => (
                <div key={row.term} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="font-semibold text-primary">{row.term}</dt>
                  <dd className="sm:col-span-2 whitespace-pre-line">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {anbi.objective ? (
          <Section title={messages.anbiObjective}>
            <RichTextContent data={anbi.objective} />
          </Section>
        ) : null}

        {anbi.policyPlan || policyPlanDocument?.url ? (
          <Section title={messages.anbiPolicyPlan}>
            <RichTextContent data={anbi.policyPlan} />
            {policyPlanDocument?.url ? (
              <a
                href={policyPlanDocument.url}
                className="inline-block text-accent underline underline-offset-4"
              >
                {messages.anbiPolicyPlanDocument}
              </a>
            ) : null}
          </Section>
        ) : null}

        {anbi.remunerationPolicy ? (
          <Section title={messages.anbiRemuneration}>
            <RichTextContent data={anbi.remunerationPolicy} />
          </Section>
        ) : null}

        {anbi.boardComposition || boardMembers.length > 0 ? (
          <Section title={messages.anbiBoard}>
            <RichTextContent data={anbi.boardComposition} />
            {boardMembers.length > 0 ? (
              <ul className="space-y-1">
                {boardMembers.map((member) => (
                  <li key={member.id ?? member.name}>
                    <span className="font-semibold text-primary">{member.role}</span>
                    {': '}
                    {member.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        ) : null}

        {annualReports.length > 0 ? (
          <Section title={messages.anbiAnnualReports}>
            <div className="space-y-8">
              {annualReports.map((report) => {
                const documents = (report.documents ?? []).filter(
                  (document): document is Media => typeof document === 'object',
                )

                return (
                  <article key={report.id ?? report.year} className="space-y-3">
                    <h3 className="font-heading text-xl text-primary">
                      {messages.anbiFinancialYear} {report.year}
                    </h3>

                    {report.activityReport ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold">{messages.anbiActivityReport}</h4>
                        <RichTextContent data={report.activityReport} />
                      </div>
                    ) : null}

                    {report.financialStatement ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold">{messages.anbiFinancialStatement}</h4>
                        <RichTextContent data={report.financialStatement} />
                      </div>
                    ) : null}

                    {documents.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold">{messages.anbiDocuments}</h4>
                        <ul className="space-y-1">
                          {documents.map((document) => (
                            <li key={document.id}>
                              <a
                                href={document.url ?? '#'}
                                className="text-accent underline underline-offset-4"
                              >
                                {document.alt}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </Section>
        ) : null}
      </div>
    </Container>
  )
}
