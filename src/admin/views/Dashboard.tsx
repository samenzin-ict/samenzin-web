import React from 'react'
import type { AdminViewServerProps } from 'payload'

import { INTEREST_OPTIONS, labelFor } from '@/fields/volunteering'

import '../dashboard.css'

/**
 * The board's dashboard, per docs/design/09-admin-panel-dashboard.png.
 *
 * Replaces Payload's default dashboard. Everything on it is counted from the
 * database at request time; nothing is a placeholder, so an empty foundation
 * sees zeroes rather than invented numbers. The sidebar is Payload's own and
 * already carries the groups the mockup shows.
 *
 * A server component: it is handed `payload` and `user` and queries directly,
 * with `overrideAccess: false` and the signed-in user, so an editor never sees
 * figures their own permissions would not let them read.
 */

const euro = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'short' })
const monthYear = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' })
const dayMonth = new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: '2-digit' })

const MONTHS_ON_CHART = 8

const startOfMonth = (offset: number): Date => {
  const date = new Date()
  date.setMonth(date.getMonth() - offset, 1)
  date.setHours(0, 0, 0, 0)
  return date
}

const VOG_PILL: Record<string, string> = {
  ok: 'szd__pill--ok',
  loopt: 'szd__pill--wait',
  'niet-gestart': 'szd__pill--idle',
  'niet-nodig': 'szd__pill--idle',
}

const VOG_LABEL: Record<string, string> = {
  ok: 'OK',
  loopt: 'Loopt',
  'niet-gestart': 'Niet gestart',
  'niet-nodig': 'Niet nodig',
}

const DONATION_PILL: Record<string, string> = {
  paid: 'szd__pill--ok',
  open: 'szd__pill--wait',
  failed: 'szd__pill--idle',
  expired: 'szd__pill--idle',
  canceled: 'szd__pill--idle',
  refunded: 'szd__pill--idle',
}

const DONATION_LABEL: Record<string, string> = {
  paid: 'Voltooid',
  open: 'Open',
  failed: 'Mislukt',
  expired: 'Verlopen',
  canceled: 'Geannuleerd',
  refunded: 'Terugbetaald',
}

export async function Dashboard({ payload, user }: AdminViewServerProps) {
  const now = new Date()
  const monthStart = startOfMonth(0)
  const chartStart = startOfMonth(MONTHS_ON_CHART - 1)

  /*
   * One query for the donations on the chart, summed in JavaScript. Payload
   * has no aggregate, and a foundation of this size has hundreds of donations
   * a year, not millions. If that ever stops being true this becomes a single
   * grouped SQL query.
   */
  const [donations, volunteers, volunteerCount, registrations] = await Promise.all([
    payload.find({
      collection: 'donations',
      where: { and: [{ status: { equals: 'paid' } }, { paidAt: { greater_than_equal: chartStart.toISOString() } }] },
      limit: 2000,
      depth: 0,
      overrideAccess: false,
      user,
      sort: '-paidAt',
    }),
    payload.find({
      collection: 'volunteer-applications',
      limit: 5,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.count({
      collection: 'members',
      where: {
        and: [{ status: { equals: 'actief' } }, { memberRole: { equals: 'vrijwilliger' } }],
      },
      overrideAccess: false,
      user,
    }),
    payload.count({ collection: 'event-registrations', overrideAccess: false, user }),
  ])

  const paid = donations.docs

  const thisMonthTotal = paid
    .filter((d) => d.paidAt && new Date(d.paidAt) >= monthStart)
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const recurringDonors = new Set(
    paid
      .filter((d) => d.paidAt && new Date(d.paidAt) >= monthStart && d.donorEmail)
      .map((d) => d.donorEmail),
  ).size

  /** Newest month on the left, as the mockup draws it. */
  const chart = Array.from({ length: MONTHS_ON_CHART }, (_, index) => {
    const from = startOfMonth(index)
    const to = startOfMonth(index - 1)

    const total = paid
      .filter((d) => {
        if (!d.paidAt) return false
        const at = new Date(d.paidAt)
        return at >= from && at < to
      })
      .reduce((sum, d) => sum + (d.amount ?? 0), 0)

    return { label: monthName.format(from), total }
  })

  const peak = Math.max(...chart.map((m) => m.total), 1)

  const latest = paid.slice(0, 5)

  const role =
    user && 'role' in user && user.role === 'admin' ? 'Beheerder' : 'Redacteur'

  return (
    <div className="szd gutter--left gutter--right" style={{ paddingBlock: '2rem' }}>
      <div className="szd__head">
        <h1 className="szd__title">Dashboard — {monthYear.format(now)}</h1>
        <span className="szd__role">{role}</span>
      </div>

      <dl className="szd__cards">
        <div className="szd__card">
          <dt>Donaties deze maand</dt>
          <dd>{euro.format(thisMonthTotal)}</dd>
        </div>
        <div className="szd__card">
          <dt>Donateurs deze maand</dt>
          <dd>{recurringDonors}</dd>
        </div>
        <div className="szd__card">
          <dt>Actieve vrijwilligers</dt>
          <dd>{volunteerCount.totalDocs}</dd>
        </div>
        <div className="szd__card">
          <dt>Aanmeldingen evenement</dt>
          <dd>{registrations.totalDocs}</dd>
        </div>
      </dl>

      <div className="szd__panel">
        <h2>Donaties per maand</h2>
        {/*
          A table would be the honest markup for a chart, but the visible
          figure is already in the label; the bars are decoration over a list
          that reads correctly on its own.
        */}
        <ul className="szd__chart">
          {chart.map((month) => (
            <li key={month.label} className="szd__bar">
              <span
                style={{ ['--szd-bar-height' as string]: `${Math.round((month.total / peak) * 100)}%` }}
              />
              <small>
                {month.label} <span className="sr-only">{euro.format(month.total)}</span>
              </small>
            </li>
          ))}
        </ul>
      </div>

      <div className="szd__grid">
        <div className="szd__panel">
          <h2>Nieuwe vrijwilligers</h2>
          {volunteers.docs.length === 0 ? (
            <p className="szd__empty">Nog geen aanmeldingen.</p>
          ) : (
            <table className="szd__table">
              <thead>
                <tr>
                  <th scope="col">Naam</th>
                  <th scope="col">Interesse</th>
                  <th scope="col">VOG</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.docs.map((application) => {
                  const first = application.interests?.[0]
                  const vog = application.vogStatus ?? 'niet-gestart'

                  return (
                    <tr key={application.id}>
                      <td>{application.name}</td>
                      <td>{first ? labelFor(INTEREST_OPTIONS, first) : '—'}</td>
                      <td>
                        <span className={`szd__pill ${VOG_PILL[vog] ?? 'szd__pill--idle'}`}>
                          {VOG_LABEL[vog] ?? vog}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="szd__panel">
          <div className="szd__panelhead">
            <h2>Laatste donaties</h2>
            <a href={`/api/donations/export?maand=${now.toISOString().slice(0, 7)}`}>
              Export naar boekhouding
            </a>
          </div>
          {latest.length === 0 ? (
            <p className="szd__empty">Nog geen betaalde donaties.</p>
          ) : (
            <table className="szd__table">
              <thead>
                <tr>
                  <th scope="col">Datum</th>
                  <th scope="col">Donateur</th>
                  <th scope="col">Doel</th>
                  <th scope="col">Bedrag</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((donation) => {
                  const status = donation.status ?? 'open'

                  return (
                    <tr key={donation.id}>
                      <td>{donation.paidAt ? dayMonth.format(new Date(donation.paidAt)) : '—'}</td>
                      <td>{donation.anonymous ? 'Anoniem' : (donation.donorName ?? '—')}</td>
                      <td>{donation.fund || 'Algemeen'}</td>
                      <td>{euro.format(donation.amount ?? 0)}</td>
                      <td>
                        <span className={`szd__pill ${DONATION_PILL[status] ?? 'szd__pill--idle'}`}>
                          {DONATION_LABEL[status] ?? status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
