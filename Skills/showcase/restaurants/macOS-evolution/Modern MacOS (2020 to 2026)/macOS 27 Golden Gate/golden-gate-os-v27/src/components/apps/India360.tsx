import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import snapshot from '../../data/india360-snapshot.json';

/**
 * India 360 — the day's edition.
 *
 * The numbers come from src/data/india360-snapshot.json, written by
 * scripts/fetch-india360.mjs from the analytics MCP. A browser tab cannot
 * speak MCP (it is a local stdio server), so the app ships a snapshot and
 * states its own age rather than implying live data.
 */

type Day = {
  date: string;
  sessions: number;
  users: number;
  views: number;
  engaged: number;
  avgDuration: number;
  bounceRate: number;
};
type Channel = {
  source: string;
  sessions: number;
  users: number;
  avgDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  returnRate: number;
  verdict: 'human' | 'mixed' | 'suspect';
};
type Task = { id: string; severity: 'high' | 'medium' | 'low' | 'info'; title: string; area: string };
type Snap = typeof snapshot;
type Tab = 'front' | 'circulation' | 'workshop';

const data = snapshot as unknown as Snap;

/* ------------------------------------------------------------------ */
/* Hand-drawn glyphs. Each is authored here rather than pulled from an   */
/* icon set, so the set stays visually consistent with the masthead.     */
/* ------------------------------------------------------------------ */

const GlyphPaper = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="2.5" width="18" height="19" rx="2" />
    <path d="M6 7h12M6 10.5h12M6 14h4.5M13.5 14h4.5M6 17.5h4.5M13.5 17.5h4.5" />
  </svg>
);
const GlyphPulse = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13h4l3-8 4 15 3-7h6" />
  </svg>
);
const GlyphForge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 3.5a4.5 4.5 0 0 0-5.9 5.6L3.8 14a2 2 0 1 0 2.8 2.8l4.9-4.8a4.5 4.5 0 0 0 5.6-5.9l-2.9 2.9-2.4-.6-.6-2.4z" />
  </svg>
);
const GlyphWrench = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Liquid glass primitives                                             */
/* ------------------------------------------------------------------ */

/** The house glass treatment: heavy blur, high saturation, a lit rim. */
const GLASS =
  'backdrop-blur-2xl backdrop-saturate-200 supports-[backdrop-filter]:bg-white/10';
const RIM =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(255,255,255,0.12),0_12px_40px_-12px_rgba(0,0,0,0.55)]';

const fmtDur = (s: number) =>
  s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;

const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 4)}-${iso.slice(4, 6)}-${iso.slice(6, 8)}T00:00:00+05:30`)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

const fmtStamp = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  });

/* ------------------------------------------------------------------ */

export const India360: React.FC = () => {
  const [tab, setTab] = useState<Tab>('front');

  const days = data.daily as Day[];
  const channels = data.quality.channels as Channel[];
  const active = days.filter((d) => d.sessions > 0);
  const maxSessions = Math.max(...days.map((d) => d.sessions), 1);

  const topThree = useMemo(
    () => [...active].sort((a, b) => b.sessions - a.sessions).slice(0, 3),
    [active],
  );

  const TABS: { id: Tab; label: string; Icon: () => React.ReactElement }[] = [
    { id: 'front', label: 'Front Page', Icon: GlyphPaper },
    { id: 'circulation', label: 'Circulation', Icon: GlyphPulse },
    { id: 'workshop', label: 'The Workshop', Icon: GlyphForge },
  ];

  const lead = topThree[0];

  return (
    <div className="flex h-full w-full overflow-hidden bg-black/25 font-sans text-white">
      {/* Masthead rail */}
      <div className="w-[13.5rem] shrink-0 border-r border-white/10 bg-black/20 p-5 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-800 flex items-center justify-center shadow-lg">
              <span className="text-[11px] font-black tracking-tight">360</span>
            </span>
            <div className="leading-tight">
              <p className="font-black tracking-tight text-lg">India 360</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Daily edition
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                tab === id
                  ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/85'
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className={`rounded-xl px-3 py-2.5 ${GLASS} ${RIM}`}>
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">Data</p>
            <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
              {data.source}
            </p>
            <p className="text-[10px] text-white/45 mt-1">Refreshed</p>
            <p className="text-[11px] text-white/75">{fmtStamp(data.generatedAt)}</p>
          </div>
          <p className="text-[9px] leading-relaxed text-white/25">
            Snapshot pulled by <code className="text-white/40">fetch-india360.mjs</code>.
            A browser cannot call the MCP directly.
          </p>
        </div>
      </div>

      {/* Sheet */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'front' && (
              <>
                <header className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                    {data.window.label} · {data.property.name}
                  </p>
                  <h1 className="mt-1.5 text-4xl font-black tracking-tight leading-none">
                    India 360
                  </h1>
                  <div className="mt-3 h-px bg-white/20" />
                </header>

                {/* Lead headline */}
                <article className={`rounded-2xl p-6 ${GLASS} ${RIM}`}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">
                    Lead story
                  </p>
                  <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
                    Bing outdraws Google eight to one, and the readers are real
                  </h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                    {(channels[0]?.sessions ?? 0)} of {data.totals.sessions} sessions arrived
                    from Bing organic against {channels.find((c) => c.source === 'google')?.sessions ?? 0}{' '}
                    from Google. {' '}
                    {(data.quality.humanShare * 100).toFixed(0)}% of traffic shows human
                    engagement — returning visitors and focused reading time — so the audience
                    is genuine. The gap is discoverability, not quality.
                  </p>
                </article>

                {/* Stat strip */}
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    { k: 'Sessions', v: data.totals.sessions.toLocaleString('en-IN') },
                    { k: 'Readers', v: data.totals.users.toLocaleString('en-IN') },
                    { k: 'Views', v: data.totals.views.toLocaleString('en-IN') },
                    { k: 'Mean read', v: fmtDur(data.totals.avgDuration) },
                  ].map((s) => (
                    <div key={s.k} className={`rounded-xl px-4 py-3 ${GLASS} ${RIM}`}>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {s.k}
                      </p>
                      <p className="mt-0.5 text-2xl font-black tabular-nums">{s.v}</p>
                    </div>
                  ))}
                </div>

                {/* Sparkline */}
                <section className={`mt-5 rounded-2xl p-5 ${GLASS} ${RIM}`}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em]">
                      Twenty-eight days
                    </h3>
                    <span className="text-[10px] text-white/40">
                      {data.highlights.silentDays} silent days
                    </span>
                  </div>
                  <div className="mt-4 flex items-end gap-[3px] h-24">
                    {days.map((d) => {
                      const h = d.sessions === 0 ? 2 : Math.max(3, (d.sessions / maxSessions) * 96);
                      const isPeak = d.date === lead?.date;
                      return (
                        <div key={d.date} className="flex-1 group relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                            className={`w-full rounded-t-[2px] ${
                              isPeak ? 'bg-amber-400' : d.sessions === 0 ? 'bg-white/12' : 'bg-white/45'
                            } group-hover:bg-amber-300 transition-colors`}
                          />
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[9px] tabular-nums text-white/90 border border-white/15">
                            {d.sessions} · {fmtDate(d.date)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-white/35 tabular-nums">
                    <span>{fmtDate(days[0].date)}</span>
                    <span className="text-amber-300/70">
                      peak {lead?.sessions} on {fmtDate(lead?.date ?? '')}
                    </span>
                    <span>{fmtDate(days[days.length - 1].date)}</span>
                  </div>
                </section>

                {/* Secondaries */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <article className={`rounded-2xl p-5 ${GLASS} ${RIM}`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Deepest read
                    </p>
                    <p className="mt-1.5 text-3xl font-black tabular-nums">
                      {fmtDur(data.highlights.longestRead.seconds)}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      {fmtDate(data.highlights.longestRead.date)} — long dwell is not the same
                      as depth, and this property has both.
                    </p>
                  </article>
                  <article className={`rounded-2xl p-5 ${GLASS} ${RIM}`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Desktop share
                    </p>
                    <p className="mt-1.5 text-3xl font-black tabular-nums">
                      {(
                        ((data.devices.find((d) => d.label === 'desktop')?.sessions ?? 0) /
                          data.totals.sessions) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      Mobile is under one in ten. The design is tuned for the cohort that
                      actually arrives.
                    </p>
                  </article>
                </div>
              </>
            )}

            {tab === 'circulation' && (
              <>
                <h2 className="text-2xl font-black tracking-tight">Circulation</h2>
                <p className="mt-1 text-[12px] text-white/50">
                  Every channel, judged on engagement and return rate.
                </p>

                <div className={`mt-5 rounded-2xl p-5 ${GLASS} ${RIM}`}>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-[0.14em] text-white/35 border-b border-white/12">
                        <th className="text-left py-2 font-semibold">Source</th>
                        <th className="text-right py-2 font-semibold">Sess</th>
                        <th className="text-right py-2 font-semibold">Read</th>
                        <th className="text-right py-2 font-semibold">Return</th>
                        <th className="text-right py-2 font-semibold">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {channels.map((c) => (
                        <tr key={c.source} className="border-b border-white/8 last:border-0">
                          <td className="py-2">{c.source}</td>
                          <td className="py-2 text-right">{c.sessions}</td>
                          <td className="py-2 text-right">{fmtDur(c.avgDuration)}</td>
                          <td className="py-2 text-right">{(c.returnRate * 100).toFixed(0)}%</td>
                          <td className="py-2 text-right">
                            <span
                              className={`text-[9px] uppercase tracking-[0.12em] ${
                                c.verdict === 'human'
                                  ? 'text-emerald-300'
                                  : c.verdict === 'mixed'
                                    ? 'text-amber-300'
                                    : 'text-rose-300'
                              }`}
                            >
                              {c.verdict}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { k: 'Human', v: `${(data.quality.humanShare * 100).toFixed(0)}%` },
                    { k: 'Mixed', v: `${(data.quality.mixedShare * 100).toFixed(0)}%` },
                    { k: 'Suspect', v: `${(data.quality.suspectShare * 100).toFixed(0)}%` },
                  ].map((s) => (
                    <div key={s.k} className={`rounded-xl px-4 py-3 text-center ${GLASS} ${RIM}`}>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{s.k}</p>
                      <p className="mt-1 text-2xl font-black tabular-nums">{s.v}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                  {data.quality.note}
                </p>

                {/* Devices */}
                <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.2em]">
                  By device
                </h3>
                <div className={`mt-3 rounded-2xl p-5 ${GLASS} ${RIM}`}>
                  {data.devices.map((d) => {
                    const pct = (d.sessions / data.totals.sessions) * 100;
                    return (
                      <div key={d.label} className="mb-2.5 last:mb-0">
                        <div className="flex justify-between text-[11px]">
                          <span className="capitalize">{d.label}</span>
                          <span className="tabular-nums text-white/50">
                            {d.sessions} · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {tab === 'workshop' && (
              <>
                <h2 className="text-2xl font-black tracking-tight">The Workshop</h2>
                <p className="mt-1 text-[12px] text-white/50">
                  What is being built, and what is outstanding.
                </p>

                <div className="mt-5 space-y-3">
                  {data.github.repos.map((r) => (
                    <div key={r.name} className={`rounded-2xl p-5 ${GLASS} ${RIM}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] truncate">{r.name}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                            {r.description ?? 'No description'}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black tabular-nums text-amber-300">
                            {r.stars}
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                            stars
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] text-white/35">
                        {r.language ?? '—'} · updated{' '}
                        {new Date(r.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
                        })}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="w-4 h-4 text-white/60">
                    <GlyphWrench />
                  </span>
                  Outstanding
                </h3>
                <div className="mt-3 space-y-2">
                  {(data.tasks as Task[]).map((t) => (
                    <div key={t.id} className={`rounded-xl px-4 py-3 ${GLASS} ${RIM}`}>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            t.severity === 'high'
                              ? 'bg-rose-400'
                              : t.severity === 'medium'
                                ? 'bg-amber-400'
                                : 'bg-white/35'
                          }`}
                        />
                        <span className="text-[10px] font-mono text-white/40">{t.id}</span>
                        <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                          {t.area}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-snug">{t.title}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-[11px] text-white/35">
                  {data.github.handle} · {data.github.followers} followers
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
