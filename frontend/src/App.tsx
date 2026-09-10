import { useEffect, useMemo, useState } from 'react'

import {
  getDashboardData,
  type EligibilityStatus,
  type NextMatch,
  type PlayerEligibility,
  type SyncStatus,
  type TeamEligibility,
} from './api'

type DashboardState = {
  nextHigherMatch: NextMatch
  nextLowerMatch: NextMatch | null
  eligibility: TeamEligibility
  syncStatus: SyncStatus
}
type Filter = 'all' | EligibilityStatus

const statusCopy: Record<
  EligibilityStatus,
  { label: string; className: string }
> = {
  eligible: {
    label: 'Spielberechtigt',
    className: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  },
  at_risk: {
    label: 'Einsatz kritisch',
    className: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
  },
  locked: {
    label: 'Festgespielt',
    className: 'bg-rose-500/15 text-rose-200 ring-rose-400/30',
  },
}

const clubLogoUrl =
  'https://www.heesseler-sv.de/wp-content/uploads/2026/07/hesseeler-sv.png'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'full' }).format(
    new Date(`${value}T12:00:00`),
  )
}

function App() {
  const [data, setData] = useState<DashboardState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    getDashboardData()
      .then(([nextHigherMatch, nextLowerMatch, eligibility, syncStatus]) =>
        setData({ nextHigherMatch, nextLowerMatch, eligibility, syncStatus }),
      )
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'Daten konnten nicht geladen werden.',
        ),
      )
      .finally(() => setLoading(false))
  }, [])

  const players = useMemo(
    () =>
      data?.eligibility.players.filter((player) => {
        const matchesSearch = player.player_name
          .toLocaleLowerCase('de-DE')
          .includes(query.toLocaleLowerCase('de-DE'))
        return matchesSearch && (filter === 'all' || player.status === filter)
      }) ?? [],
    [data, filter, query],
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0d4b2d_0,_#062317_38rem,_#020c07_100%)] text-slate-100">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-[#167444]/80 bg-[#082317]/90 px-4 py-4 shadow-2xl shadow-black/20 backdrop-blur sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              className="h-11 w-11 shrink-0 rounded-full bg-white p-1 shadow-lg shadow-black/40 ring-2 ring-[#20c466]/30 sm:h-14 sm:w-14"
              src={clubLogoUrl}
              alt="Heesseler SV"
            />
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.18em] text-[#86d9a6] uppercase sm:text-xs sm:tracking-[0.24em]">
                Heesseler SV · Ü40
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Heesseler SV Ü40 Festspielmonitor
              </h1>
            </div>
          </div>
          <span className="w-fit rounded-full border border-[#149346]/50 bg-[#0c2c1b] px-3 py-1.5 text-xs font-medium text-[#dff4e3]">
            Saison 2026/27
          </span>
        </header>
        {loading && (
          <p className="rounded-2xl bg-slate-900 p-6 text-slate-300">
            Lade Dashboard …
          </p>
        )}
        {error && (
          <p className="rounded-2xl bg-rose-500/10 p-6 text-rose-200 ring-1 ring-rose-400/30">
            {error}
          </p>
        )}
        {data && (
          <div className="space-y-4 sm:space-y-6">
            <section>
              <article className="relative overflow-hidden rounded-2xl border border-[#178c4c]/80 bg-[#0b2d1c] p-4 shadow-xl shadow-black/20 sm:rounded-3xl sm:p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#20c466] via-[#86d9a6] to-transparent" />
                <p className="text-sm font-semibold tracking-wide text-[#dff4e3] uppercase">
                  Nächste Pflichtspiele
                </p>
                <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                  <NextMatchPanel
                    label="Erste Ü40"
                    match={data.nextHigherMatch}
                  />
                  <NextMatchPanel
                    label="Zweite Ü40"
                    match={data.nextLowerMatch}
                  />
                </div>
              </article>
            </section>
            <section className="rounded-2xl border border-[#155c36] bg-[#081d12]/95 p-4 shadow-xl shadow-black/15 sm:rounded-3xl sm:p-6">
              <div className="mb-4 flex flex-col gap-3 border-b border-[#17482e] pb-4 sm:mb-5 sm:pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#86d9a6] uppercase">
                    Kaderübersicht
                  </p>
                  <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                    Spielerstatus
                  </h2>
                </div>
                <input
                  className="w-full rounded-xl border border-[#1d7143] bg-[#04140b] px-3 py-3 text-base outline-none placeholder:text-slate-500 focus:border-[#20c466] focus:ring-2 focus:ring-[#20c466]/15 sm:w-64 sm:py-2.5 sm:text-sm"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Spieler suchen"
                  aria-label="Spieler suchen"
                />
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'eligible', 'at_risk', 'locked'] as const).map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`min-h-11 rounded-full px-3 py-2 text-sm font-medium transition-colors ${filter === value ? 'bg-[#20c466] text-[#062317]' : 'border border-[#155c36] bg-[#0b2a19] text-slate-300 hover:border-[#42bd6f] hover:bg-[#103a23]'}`}
                      >
                        {value === 'all'
                          ? 'Alle'
                          : `${statusCopy[value].label} (${data.eligibility.players.filter((player) => player.status === value).length})`}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {players.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {players.map((player) => (
                    <PlayerCard key={player.player_id} player={player} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-[#1d7143] bg-[#04140b]/50 p-8 text-center text-slate-400">
                  Noch keine Einsatzhistorie vorhanden. Nach dem ersten
                  importierten Spielbericht erscheinen die Spieler hier.
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <p className="min-h-11 flex items-center gap-2 rounded-full border border-[#149346]/45 bg-[#0c301d] px-3 py-2 text-sm text-[#dff4e3]">
                  Erfasste Spieler
                  <span className="font-semibold text-white">
                    {data.eligibility.players.length}
                  </span>
                </p>
                <UpdatePill syncStatus={data.syncStatus} />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function NextMatchPanel({
  label,
  match,
}: {
  label: string
  match: NextMatch | null
}) {
  if (match === null) {
    return (
      <section className="border-l-2 border-[#149346] bg-[#061a0f]/80 p-4 sm:p-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#dff4e3] uppercase">
          {label}
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Noch kein Pflichtspiel im Spielplan erfasst.
        </p>
      </section>
    )
  }

  return (
    <section className="border-l-2 border-[#149346] bg-[#061a0f]/80 p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#dff4e3] uppercase">
        {label}
      </p>
      <p className="mt-3 text-sm text-slate-400">
        {formatDate(match.played_on)} ·{' '}
        {match.kickoff_time?.slice(0, 5) ?? 'Uhrzeit offen'} Uhr
      </p>
      <h2 className="mt-2 text-base font-semibold leading-snug text-slate-100 sm:text-lg">
        {match.home_team} <span className="text-slate-500">–</span>{' '}
        {match.away_team}
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
          {match.competition}
        </span>
        {match.report_url && (
          <a
            className="text-[#dff4e3] underline decoration-[#20c466]/50 underline-offset-4"
            href={match.report_url}
            target="_blank"
            rel="noreferrer"
          >
            Spielbericht
          </a>
        )}
      </div>
    </section>
  )
}

function UpdatePill({ syncStatus }: { syncStatus: SyncStatus }) {
  const syncedAt = syncStatus.last_successful_sync_at
  const isCurrent =
    syncedAt !== null &&
    new Date(syncedAt).toLocaleDateString('en-CA') ===
      new Date().toLocaleDateString('en-CA')

  return (
    <p className="min-h-11 flex items-center gap-2 rounded-full border border-[#149346]/45 bg-[#0c301d] px-3 py-2 text-sm text-[#dff4e3]">
      <span
        className={`h-2.5 w-2.5 rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-rose-400'}`}
        aria-label={
          isCurrent ? 'Abgleich heute erfolgreich' : 'Abgleich heute fehlt'
        }
      />
      {syncedAt
        ? `Letztes Update: ${formatDate(syncedAt.slice(0, 10))}`
        : 'Letztes Update: noch nie'}
    </p>
  )
}

function PlayerCard({ player }: { player: PlayerEligibility }) {
  const status = statusCopy[player.status]
  const detail =
    player.status === 'locked'
      ? player.matches_to_skip > 0
        ? `Noch ${player.matches_to_skip} Pflichtspiel(e) aussetzen`
        : `Frei ab ${player.eligible_on ?? 'dem Folgetag'}`
      : player.status === 'at_risk'
        ? 'Ein weiterer Einsatz für die erste Ü40 führt zum Festspielen.'
        : 'Für die zweite Ü40 spielberechtigt.'
  return (
    <article className="relative overflow-hidden rounded-2xl border border-t-[#20c466]/70 border-[#155c36] bg-[#0b2a19] p-4 shadow-lg shadow-black/10 transition-colors hover:border-[#42bd6f] hover:bg-[#103a23] sm:p-5">
      {player.jersey_number !== null && (
        <span
          className="pointer-events-none absolute -right-1 -top-5 select-none text-8xl font-bold leading-none text-[#20c466]/[0.13] sm:-top-7 sm:text-9xl"
          aria-hidden="true"
        >
          {player.jersey_number}
        </span>
      )}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <h3 className="min-w-0 pr-1 text-base font-semibold leading-snug text-[#dff4e3] sm:text-lg">
          {player.player_name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <div className="relative z-10 mt-3 border-t border-[#20c466]/25 pt-3 sm:mt-4">
        <p className="text-sm leading-6 text-slate-400">{detail}</p>
      </div>
    </article>
  )
}

export default App
