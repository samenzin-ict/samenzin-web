/**
 * Checks the ANBI page against the requirements in docs/ANBI_guide.docx.
 *
 * Run with `pnpm check:anbi` while the site is running. Publishing this page is
 * condition 12 of the twelve an ANBI must meet, and its address goes on the
 * application form, so it is worth being able to prove the page is right rather
 * than assuming it.
 *
 * Two kinds of check:
 *
 *  - content, read from the CMS, for the information the Belastingdienst
 *    requires to be published;
 *  - page, read from the rendered HTML, for the technical conditions: publicly
 *    reachable, real text, indexable, linked from the footer, dated.
 *
 * Exits non-zero if anything mandatory is missing, so it can gate a deploy.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const siteUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

type Level = 'mandatory' | 'advisory'
type Result = { level: Level; name: string; ok: boolean; detail?: string }

const results: Result[] = []

const check = (level: Level, name: string, ok: boolean, detail?: string) => {
  results.push({ level, name, ok, detail })
}

/** Lexical documents are nested; this flattens them to plain text. */
const richTextToString = (value: unknown): string => {
  if (!value || typeof value !== 'object') return ''
  const node = value as { text?: string; children?: unknown[]; root?: unknown }
  if (node.root) return richTextToString(node.root)
  const own = typeof node.text === 'string' ? node.text : ''
  const kids = Array.isArray(node.children) ? node.children.map(richTextToString).join(' ') : ''
  return `${own} ${kids}`.trim()
}

const filled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return richTextToString(value).length > 0
  return Boolean(value)
}

const payload = await getPayload({ config })
const anbi = await payload.findGlobal({ slug: 'anbi-gegevens', depth: 0, overrideAccess: true })

// ---- Content the Belastingdienst requires -----------------------------------
check('mandatory', 'Statutaire naam', filled(anbi.statutoryName))
check('mandatory', 'RSIN / fiscaal nummer', filled(anbi.rsin))
check('mandatory', 'KVK-nummer', filled(anbi.kvkNumber))
check('mandatory', 'Post- of bezoekadres', filled(anbi.contact?.address))
check('mandatory', 'Doelstelling', filled(anbi.objective))
check(
  'mandatory',
  'Hoofdlijnen van het beleidsplan',
  filled(anbi.policyActivities) && filled(anbi.policyIncome) && filled(anbi.policyAssets),
  'Alle drie de onderdelen moeten ingevuld zijn: activiteiten, inkomsten, vermogen.',
)
check('mandatory', 'Beloningsbeleid', filled(anbi.remunerationPolicy))

const board = anbi.boardMembers ?? []
check('mandatory', 'Namen van de bestuurders', board.length > 0 && board.every((m) => filled(m.name)))
check('mandatory', 'Functies van de bestuurders', board.length > 0 && board.every((m) => filled(m.role)))

const reports = anbi.annualReports ?? []
check(
  'mandatory',
  'Activiteitenverslag of aangekondigde publicatiedatum',
  reports.some((r) => filled(r.activityReport)) || filled(anbi.reportingNotice),
  'Zolang er nog geen boekjaar is afgesloten volstaat de melding met de uiterste datum.',
)
check(
  'mandatory',
  'Financiële verantwoording of aangekondigde publicatiedatum',
  reports.some((r) => filled(r.financialStatement)) || filled(anbi.reportingNotice),
  'Balans en staat van baten en lasten, met toelichting.',
)

// ---- Claims that may not be made while the status is pending ----------------
const isPending = anbi.anbiStatus !== 'toegekend'

check(
  'mandatory',
  'Let op-melding bij aangevraagde status',
  !isPending || filled(anbi.statusNotice),
  'Verplicht zolang de ANBI-status niet is toegekend.',
)

// ---- Contact details the guide still lists as outstanding -------------------
check('advisory', 'E-mailadres', filled(anbi.contact?.email))
check('advisory', 'Telefoonnummer', filled(anbi.contact?.phone))
check('advisory', 'IBAN', filled(anbi.iban))

// ---- The rendered page ------------------------------------------------------
let html = ''
let reachable = false

try {
  // No cookies and no credentials: this is what an inspector following the link
  // from the application form sees.
  const response = await fetch(`${siteUrl}/anbi`, { redirect: 'follow' })
  reachable = response.ok
  html = await response.text()
  check('mandatory', 'Pagina is publiek bereikbaar op /anbi', response.ok, `HTTP ${response.status}`)
} catch (error) {
  check('mandatory', 'Pagina is publiek bereikbaar op /anbi', false, String(error))
}

if (reachable) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')

  check(
    'mandatory',
    'Informatie staat als gewone tekst op de pagina',
    filled(anbi.statutoryName) ? text.includes(String(anbi.statutoryName)) : false,
    'Niet alleen in een afbeelding of PDF.',
  )

  check(
    'mandatory',
    'Pagina is niet op noindex gezet',
    !/name=["']robots["'][^>]*noindex/i.test(html) && !/noindex/i.test(html),
  )

  check('mandatory', '"Laatst bijgewerkt" staat op de pagina', /laatst bijgewerkt/i.test(text))

  check(
    'mandatory',
    'Geen brede tabel die op een telefoon kan uitlopen',
    !/<table[\s>]/i.test(html),
    'De gegevens staan in een description list, die op een smal scherm terugloopt.',
  )

  const forbidden: { pattern: RegExp; label: string }[] = [
    { pattern: /wij zijn een anbi/i, label: '"Wij zijn een ANBI"' },
    { pattern: /uw gift is (fiscaal )?aftrekbaar/i, label: '"Uw gift is aftrekbaar"' },
    { pattern: /giften zijn (fiscaal )?aftrekbaar/i, label: '"Giften zijn aftrekbaar"' },
  ]

  if (isPending) {
    for (const { pattern, label } of forbidden) {
      check('mandatory', `Geen claim ${label} zolang de status niet toegekend is`, !pattern.test(text))
    }

    /*
     * The same rule applies wherever the site asks for money, not only on this
     * page. A visitor who reads "uw gift is aftrekbaar" on the donation page is
     * misled just as badly.
     */
    try {
      const donateHtml = await (await fetch(`${siteUrl}/doneren`)).text()
      const donateText = donateHtml
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')

      for (const { pattern, label } of forbidden) {
        check(
          'mandatory',
          `Geen claim ${label} op /doneren`,
          !pattern.test(donateText),
        )
      }
    } catch (error) {
      check('advisory', '/doneren gelezen', false, String(error))
    }
  }

  // The guide requires the page to be reachable from the footer of every page.
  try {
    const home = await (await fetch(siteUrl)).text()
    check(
      'mandatory',
      'Vanuit de footer gelinkt als "ANBI"',
      /<a[^>]+href=["']\/anbi["'][^>]*>\s*ANBI\s*</i.test(home),
    )
  } catch (error) {
    check('mandatory', 'Vanuit de footer gelinkt als "ANBI"', false, String(error))
  }

  try {
    const robots = await (await fetch(`${siteUrl}/robots.txt`)).text()
    check('mandatory', 'robots.txt blokkeert /anbi niet', !/Disallow:\s*\/anbi/i.test(robots))
  } catch (error) {
    check('advisory', 'robots.txt gelezen', false, String(error))
  }
}

// ---- Report -----------------------------------------------------------------
const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length))
const failedMandatory = results.filter((r) => r.level === 'mandatory' && !r.ok)
const failedAdvisory = results.filter((r) => r.level === 'advisory' && !r.ok)

console.log(`\nANBI-controle — ${siteUrl}/anbi\n`)

for (const r of results) {
  const mark = r.ok ? 'OK  ' : r.level === 'mandatory' ? 'FOUT' : 'LET OP'
  console.log(`  ${pad(mark, 7)} ${r.name}`)
  if (!r.ok && r.detail) console.log(`          ${r.detail}`)
}

console.log(
  `\n  ${results.filter((r) => r.ok).length} van ${results.length} in orde` +
    `, ${failedMandatory.length} verplichte punten open` +
    `, ${failedAdvisory.length} aandachtspunten.\n`,
)

if (failedMandatory.length > 0) {
  console.log('  De pagina is nog niet klaar voor publicatie.\n')
  process.exit(1)
}

console.log('  Alle verplichte punten zijn in orde.\n')
process.exit(0)
