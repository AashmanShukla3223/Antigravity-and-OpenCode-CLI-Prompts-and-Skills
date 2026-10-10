#!/usr/bin/env node
/**
 * Regenerate src/data/india360-snapshot.json.
 *
 * The India 360 app cannot call the analytics MCP from a browser tab — MCP is
 * a local stdio server. So this script does the pull on the developer's
 * machine and writes a snapshot the app ships with.
 *
 * Run:  node scripts/fetch-india360.mjs
 *
 * It writes only what the app renders, and it states its own provenance in the
 * output so the app never claims fresher data than it has.
 */

import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'data', 'india360-snapshot.json');
const PROPERTY_ID = '542523883';
const DAYS = 28;
const GITHUB_USER = 'AashmanShukla3223';
const RANGE = { start_date: `${DAYS - 1}daysAgo`, end_date: 'today' };

class McpStdio {
  constructor(cmd, env) {
    this.proc = spawn(cmd[0], cmd.slice(1), {
      env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.buf = ''; this.pending = new Map(); this.nextId = 1; this.stderr = '';
    this.proc.stdout.on('data', (c) => this.#onData(c));
    this.proc.stderr.on('data', (c) => { this.stderr += c.toString(); });
    this.proc.on('exit', (code) => {
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(new Error(`MCP exited (${code})\n${this.stderr}`));
      }
      this.pending.clear();
    });
  }
  #onData(chunk) {
    this.buf += chunk.toString();
    let i;
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.slice(0, i).trim();
      this.buf = this.buf.slice(i + 1);
      if (!line) continue;
      let msg; try { msg = JSON.parse(line); } catch { continue; }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id);
        clearTimeout(timer); this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    }
  }
  send(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout ${method}`)), 90_000);
      this.pending.set(id, { resolve, reject, timer });
      this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }
  notify(m, p) { this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: m, params: p }) + '\n'); }
  close() { try { this.proc.stdin.end(); } catch {} this.proc.kill(); }
}

function resolveMcp() {
  const cands = [
    process.env.ANALYTICS_MCP_BIN,
    `${process.env.HOME}/.local/bin/analytics-mcp`,
  ].filter(Boolean);
  for (const c of cands) if (existsSync(c)) return c;
  throw new Error('analytics-mcp not found; set ANALYTICS_MCP_BIN');
}

async function client() {
  const s = new McpStdio([resolveMcp()], {
    GOOGLE_APPLICATION_CREDENTIALS:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ??
      `${process.env.HOME}/.config/gcloud/application_default_credentials.json`,
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID ?? 'zestyprints',
    HOME: process.env.HOME ?? '/tmp',
  });
  await s.send('initialize', {
    protocolVersion: '2024-11-05', capabilities: {},
    clientInfo: { name: 'india360-snapshot', version: '1.0.0' },
  });
  s.notify('notifications/initialized', {});
  return s;
}

async function report(mcp, dimensions, metrics, extra = {}) {
  const res = await mcp.send('tools/call', {
    name: 'run_report',
    arguments: { property_id: PROPERTY_ID, date_ranges: [RANGE], dimensions, metrics, ...extra },
  });
  const text = res.content?.find((c) => c.type === 'text')?.text;
  const parsed = JSON.parse(text);
  const dims = parsed.dimension_headers.map((h) => h.name);
  const mets = parsed.metric_headers.map((h) => h.name);
  return parsed.rows.map((r) => ({
    ...Object.fromEntries(dims.map((h, i) => [h, r.dimension_values[i]?.value ?? ''])),
    ...Object.fromEntries(mets.map((h, i) => [h, Number(r.metric_values[i]?.value ?? 0)])),
  }));
}

const ymd = (iso) =>
  /^\d{8}$/.test(iso)
    ? `${iso.slice(0, 4)}-${iso.slice(4, 6)}-${iso.slice(6, 8)}`
    : iso;

/** GA4 omits days with no data; the app wants all 28, silent ones included. */
function expand(rows) {
  const by = new Map(rows.map((r) => [r.date, r]));
  const out = [];
  // RANGE uses GA-relative strings ("27daysAgo"), so the concrete boundaries
  // are resolved here rather than parsed out of it.
  const d = new Date(`${ymd(firstDate())}T00:00:00Z`);
  const end = new Date(`${ymd(lastDate())}T00:00:00Z`);
  while (d <= end) {
    const iso = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    const r = by.get(iso);
    out.push({
      date: iso,
      sessions: Math.round(r?.sessions ?? 0),
      users: Math.round(r?.activeUsers ?? 0),
      views: Math.round(r?.screenPageViews ?? 0),
      engaged: Math.round(r?.engagedSessions ?? 0),
      avgDuration: Math.round(r?.averageSessionDuration ?? 0),
      bounceRate: r?.bounceRate ?? 0,
    });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
const firstDate = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (DAYS - 1));
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
};
const lastDate = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
};

async function github(user) {
  const h = { 'User-Agent': 'india360', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const [p, r] = await Promise.all([
    fetch(`https://api.github.com/users/${user}`, { headers: h }),
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, { headers: h }),
  ]);
  if (!p.ok || !r.ok) throw new Error(`GitHub ${p.status}/${r.status}`);
  const prof = await p.json();
  const repos = await r.json();
  return {
    handle: user, name: prof.name, followers: prof.followers,
    repos: repos.slice(0, 6).map((x) => ({
      name: x.name, stars: x.stargazers_count, language: x.language,
      description: x.description, updatedAt: x.updated_at,
    })),
  };
}

/**
 * The same rule engine the paper uses, so the two surfaces never disagree
 * about what is outstanding. Emits only issues that are actionable here.
 */
function buildTasks({ series, devices, totals, channels, suspect, silent }) {
  const t = [];
  let n = 0;
  const id = () => `I360-${String(++n).padStart(3, '0')}`;

  // `devices` arrives as raw GA rows keyed by deviceCategory.
  const mobile = devices.find((d) => d.deviceCategory === 'mobile')?.sessions ?? 0;
  const mobileShare = mobile / (totals.sessions || 1);
  if (mobileShare < 0.2) {
    t.push({
      id: id(), severity: 'high', area: 'responsive-design',
      title: `Mobile share is ${(mobileShare * 100).toFixed(1)}% — audit below 390px`,
    });
  }

  if (totals.bounceRate > 0.3) {
    t.push({
      id: id(), severity: 'medium', area: 'performance',
      title: `Bounce rate at ${(totals.bounceRate * 100).toFixed(1)}% — check first paint`,
    });
  }

  if (silent.length >= 3) {
    t.push({
      id: id(), severity: 'low', area: 'analytics-integrity',
      title: `${silent.length} days recorded zero sessions — verify the tag still fires`,
    });
  }

  const ultrashort = series.filter((d) => d.sessions > 0 && d.avgDuration > 0 && d.avgDuration < 30);
  if (ultrashort.length) {
    t.push({
      id: id(), severity: 'medium', area: 'data-quality',
      title: `${ultrashort.length} day(s) averaged under 30s — likely non-human`,
    });
  }

  if (suspect > 0) {
    const worst = channels.filter((c) => c.verdict === 'suspect')[0];
    t.push({
      id: id(), severity: 'medium', area: 'data-quality',
      title: `${suspect} sessions show no human engagement signal${
        worst ? ` (worst: ${worst.source})` : ''
      }`,
    });
  }

  return t;
}

async function main() {
  console.log(`[india360] pulling property ${PROPERTY_ID}, last ${DAYS} days`);
  const mcp = await client();
  let daily, devices, sources, newRet, totals;
  try {
    [daily, devices, sources, newRet, totals] = await Promise.all([
      report(mcp, ['date'], ['sessions', 'activeUsers', 'screenPageViews',
        'engagedSessions', 'averageSessionDuration', 'bounceRate'],
        { order_bys: [{ dimension: { dimension_name: 'date' } }] }),
      report(mcp, ['deviceCategory'], ['sessions', 'activeUsers']),
      report(mcp, ['sessionSource', 'sessionMedium'], ['sessions'], { limit: 15 }),
      report(mcp, ['sessionSource', 'newVsReturning'], ['sessions'], { limit: 40 }),
      report(mcp, [], ['sessions', 'totalUsers', 'screenPageViews',
        'engagedSessions', 'averageSessionDuration', 'bounceRate']),
    ]);
  } finally {
    mcp.close();
  }

  const series = expand(daily);
  const t = totals[0] ?? {};
  const active = series.filter((d) => d.sessions > 0);
  const peak = active.reduce((a, b) => (b.sessions > a.sessions ? b : a));
  const longest = active.reduce((a, b) => (b.avgDuration > a.avgDuration ? b : a));
  const silent = series.filter((d) => d.sessions === 0);

  // Human/mixed/suspect, on engagement + return rate. Single-page sessions are
  // NOT a bot signal here: this is a single-screen app, one pageview is normal.
  const ret = new Map(), nw = new Map();
  for (const r of newRet) {
    if (r.newVsReturning === 'returning') ret.set(r.sessionSource, r.sessions);
    else if (r.newVsReturning === 'new') nw.set(r.sessionSource, r.sessions);
  }
  const chD = await (async () => {
    const m2 = await client();
    try {
      return await report(m2, ['sessionSource'], ['sessions', 'engagedSessions',
        'averageSessionDuration', 'bounceRate', 'screenPageViewsPerSession'], { limit: 20 });
    } finally { m2.close(); }
  })();
  const usersBy = new Map();
  {
    const m3 = await client();
    try { for (const r of await report(m3, ['sessionSource'], ['activeUsers'], { limit: 20 })) usersBy.set(r.sessionSource, r.users); }
    finally { m3.close(); }
  }

  const channels = chD.map((s) => {
    const r = ret.get(s.sessionSource) ?? 0, n = nw.get(s.sessionSource) ?? 0;
    const rr = r / (r + n || 1);
    let score = 0;
    if (rr >= 0.1) score += 2; else if (rr >= 0.03) score += 1;
    if (s.averageSessionDuration >= 90) score += 2;
    if (s.averageSessionDuration >= 240) score += 1;
    if (s.screenPageViewsPerSession >= 1.4) score += 1;
    if (s.sessions ? s.engagedSessions / s.sessions >= 0.5 : false) score += 1;
    return {
      source: s.sessionSource || '(not set)',
      sessions: Math.round(s.sessions),
      users: usersBy.get(s.sessionSource) ?? 0,
      avgDuration: Math.round(s.averageSessionDuration ?? 0),
      bounceRate: Number((s.bounceRate ?? 0).toFixed(3)),
      pagesPerSession: Number((s.screenPageViewsPerSession ?? 0).toFixed(2)),
      returnRate: Number(rr.toFixed(3)),
      score,
      verdict: score >= 4 ? 'human' : score >= 2 ? 'mixed' : 'suspect',
    };
  }).sort((a, b) => b.sessions - a.sessions);

  const suspect = channels.filter((c) => c.verdict === 'suspect').reduce((s, c) => s + c.sessions, 0);
  const mixed = channels.filter((c) => c.verdict === 'mixed').reduce((s, c) => s + c.sessions, 0);
  const totalSessions = Math.round(t.sessions ?? series.reduce((s, d) => s + d.sessions, 0));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: 'google-analytics-mcp',
    property: { id: PROPERTY_ID, name: 'macos-golden-gate' },
    window: { days: DAYS, timezone: 'Asia/Kolkata', label: `${ymd(firstDate())} – ${ymd(lastDate())}` },
    totals: {
      sessions: totalSessions,
      users: Math.round(t.totalUsers ?? 0),
      views: Math.round(t.screenPageViews ?? 0),
      engaged: Math.round(t.engagedSessions ?? 0),
      avgDuration: Math.round(t.averageSessionDuration ?? 0),
      bounceRate: Number((t.bounceRate ?? 0).toFixed(4)),
    },
    highlights: {
      peak: { date: peak.date, sessions: peak.sessions },
      longestRead: { date: longest.date, seconds: longest.avgDuration },
      silentDays: silent.length,
    },
    daily: series,
    devices: devices.map((d) => ({
      label: d.deviceCategory, sessions: Math.round(d.sessions), users: Math.round(d.users ?? 0),
    })),
    sources: sources.map((s) => ({
      source: s.sessionSource, medium: s.sessionMedium, sessions: Math.round(s.sessions),
    })),
    quality: {
      humanShare: Number(((totalSessions - suspect - mixed) / (totalSessions || 1)).toFixed(3)),
      mixedShare: Number((mixed / (totalSessions || 1)).toFixed(3)),
      suspectShare: Number((suspect / (totalSessions || 1)).toFixed(3)),
      channels: channels.slice(0, 8),
      note: 'Judged on engagement time and return rate. Single-page sessions are NOT a bot signal for a single-screen app.',
    },
    github: await github(GITHUB_USER),
    tasks: buildTasks({ series, devices, totals: { ...t, sessions: totalSessions }, channels, suspect, silent }),
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(snapshot, null, 1) + '\n');
  console.log(`[india360] wrote ${path.relative(ROOT, OUT)} — ${snapshot.totals.sessions} sessions, ${series.length} days, ${channels.length} channels`);
  console.log(`[india360] quality: ${(snapshot.quality.humanShare * 100).toFixed(0)}% human`);
}

main().catch((e) => { console.error('[india360]', e.message); process.exit(1); });
