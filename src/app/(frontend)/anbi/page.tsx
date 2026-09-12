import type { Metadata } from 'next'

import { RichTextContent } from '@/components/RichTextContent'
import { Container } from '@/components/layout/Container'
import { Notice } from '@/components/ui/notice'
import { defaultLocale, getMessages } from '@/i18n'
import { getAnbiGegevens, getSiteSettings } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

/**
 * The statutory ANBI publication page.
 *
 * Structure and wording follow docs/ANBI_guide.docx. The order is fixed in
 * code rather than assembled from blocks: the Belastingdienst prescribes what
 * must appear, so a volunteer should not be able to omit or reorder a section,
 * and whoever checks the page finds the same thing every time.
 *
 * Requirements from the guide that are met here rather than by content:
 *
 * - Everything is real, selectable text. Nothing is an image, and nothing is
 *   available only inside a PDF.
 * - The page is public. There is no login, no paywall and no cookie banner in
 *   front of it.
 * - It is indexable. robots.txt allows it and no noindex is set.
 * - "Laatst bijgewerkt" comes from the record's own updatedAt, so it cannot
 *   drift from reality or be forgotten.
 * - The data table is a description list, so it reflows on a phone instead of
 *   overflowing sideways.
 * - While the status is "aangevraagd" the notice is shown first, before any
 *   mention of giving.
 *
 * Sections with nothing in them are left out rather than rendered as an empty
 * heading, so a half-filled page reads as incomplete instead of broken.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, messages] = [await getSiteSettings(), getMessages()]

  return {
    title: messages.anbiTitle,
    description: messages.anbiIntro,
    // Explicitly indexable: the address goes on the ANBI application form.
    robots: { index: true, follow: true },
    alternates: { canonical: '/anbi' },
    openGraph: {
      title: messages.anbiTitle,
      description: messages.anbiIntro,
      siteName: settings.organisationName,
      type: 'website',
      locale: 'nl_NL',
    },
  }
}

function Section({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="font-heading text-2xl text-primary">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-heading text-lg text-primary">{title}</h3>
      {children}
    </div>
  )
}

const dateFormatter = new Intl.DateTimeFormat(defaultLocale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatDate = (value?: string | null) => (value ? dateFormatter.format(new Date(value)) : null)

export default async function AnbiPage() {
  const anbi = await getAnbiGegevens()
  const messages = getMessages()

  const isPending = anbi.anbiStatus !== 'toegekend'

  const organisation: { term: string; value: string }[] = (
    [
      { term: messages.anbiStatutoryName, value: anbi.statutoryName },
      { term: messages.anbiKvk, value: anbi.kvkNumber },
      {
        term: messages.anbiRsin,
        value:
          anbi.rsin && anbi.anbiStatus === 'toegekend' && anbi.anbiGrantedOn
            ? `${anbi.rsin} — ${messages.anbiGranted} ${formatDate(anbi.anbiGrantedOn)}`
            : anbi.rsin,
      },
      { term: messages.anbiFoundedOn, value: formatDate(anbi.foundedOn) },
      { term: messages.anbiSeat, value: anbi.statutorySeat },
      { term: messages.anbiOperatingArea, value: anbi.operatingArea },
      { term: messages.anbiAddress, value: anbi.contact?.address },
      { term: messages.anbiEmail, value: anbi.contact?.email },
      { term: messages.anbiPhone, value: anbi.contact?.phone },
      { term: messages.anbiIban, value: anbi.iban },
      { term: messages.anbiFiscalYear, value: anbi.fiscalYear },
    ] as { term: string; value?: string | null }[]
  ).filter((row): row is { term: string; value: string } => Boolean(row.value))

  const boardMembers = anbi.boardMembers ?? []
  const annualReports = [...(anbi.annualReports ?? [])].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))

  const hasPolicy =
    anbi.policyActivities || anbi.policyIncome || anbi.policyAssets || anbi.policyPlanOnRequest

  return (
    <Container className="py-10 md:py-16">
      <div className="max-w-3xl space-y-10">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl sm:text-4xl">{messages.anbiTitle}</h1>
          <p className="max-w-prose">{messages.anbiIntro}</p>
        </div>

        {/*
          Shown before anything about giving, so nobody reads a donation
          invitation and assumes the gift is deductible.
        */}
        {isPending && anbi.statusNotice ? (
          <Notice title={messages.anbiStatusNoticeTitle}>
            <RichTextContent data={anbi.statusNotice} className="max-w-none" />
          </Notice>
        ) : null}

        {organisation.length > 0 ? (
          <Section title={messages.anbiOrganisationHeading} id="gegevens">
            <dl className="divide-y divide-border border-y border-border">
              {organisation.map((row) => (
                <div key={row.term} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="font-semibold text-primary">{row.term}</dt>
                  <dd className="whitespace-pre-line sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {anbi.objective ? (
          <Section title={messages.anbiObjective} id="doelstelling">
            <RichTextContent data={anbi.objective} />
          </Section>
        ) : null}

        {anbi.mission ? (
          <Section title={messages.anbiMission}>
            <RichTextContent data={anbi.mission} />
          </Section>
        ) : null}

        {hasPolicy ? (
          <Section title={messages.anbiPolicyHeading} id="beleidsplan">
            <div className="space-y-6">
              {anbi.policyActivities ? (
                <SubSection title={messages.anbiPolicyActivities}>
                  <RichTextContent data={anbi.policyActivities} />
                </SubSection>
              ) : null}

              {anbi.policyIncome ? (
                <SubSection title={messages.anbiPolicyIncome}>
                  <RichTextContent data={anbi.policyIncome} />
                </SubSection>
              ) : null}

              {anbi.policyAssets ? (
                <SubSection title={messages.anbiPolicyAssets}>
                  <RichTextContent data={anbi.policyAssets} />
                </SubSection>
              ) : null}

              {anbi.policyPlanOnRequest ? (
                <p className="max-w-prose whitespace-pre-line">{anbi.policyPlanOnRequest}</p>
              ) : null}
            </div>
          </Section>
        ) : null}

        {boardMembers.length > 0 || anbi.boardComposition ? (
          <Section title={messages.anbiBoard} id="bestuur">
            {boardMembers.length > 0 ? (
              /*
                Function and name only. A home address, telephone number or date
                of birth is not required and must never be published here.
              */
              <dl className="divide-y divide-border border-y border-border">
                {boardMembers.map((member) => (
                  <div
                    key={member.id ?? member.name}
                    className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4"
                  >
                    <dt className="font-semibold text-primary">{member.role}</dt>
                    <dd className="sm:col-span-2">{member.name}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <RichTextContent data={anbi.boardComposition} />
          </Section>
        ) : null}

        {anbi.remunerationPolicy ? (
          <Section title={messages.anbiRemuneration} id="beloningsbeleid">
            <RichTextContent data={anbi.remunerationPolicy} />
          </Section>
        ) : null}

        <Section title={messages.anbiAnnualReports} id="verantwoording">
          {annualReports.length === 0 ? (
            anbi.reportingNotice ? (
              <p className="max-w-prose whitespace-pre-line">{anbi.reportingNotice}</p>
            ) : null
          ) : (
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
          )}
        </Section>

        {anbi.supportText ? (
          <Section title={messages.anbiSupport} id="steun-ons">
            <RichTextContent data={anbi.supportText} />
          </Section>
        ) : null}

        {/*
          Required by the guide and must change whenever the page does. Taken
          from the record's own updatedAt rather than a field somebody has to
          remember to edit.
        */}
        {anbi.updatedAt ? (
          <p className="border-t border-border pt-6 text-sm">
            {messages.anbiLastUpdated}:{' '}
            <time dateTime={anbi.updatedAt}>{formatDate(anbi.updatedAt)}</time>
          </p>
        ) : null}
      </div>
    </Container>
  )
}
