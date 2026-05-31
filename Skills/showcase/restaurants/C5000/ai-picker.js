/* =====================================================================
 *  Samsung C5000 — AI Channel Picker (RAG)
 *  ---------------------------------------------------------------------
 *  Drop-in module. Loaded AFTER Samsung_TV.html's inline script so it
 *  has access to:
 *    - window.dishChannels            (defined below + read from page)
 *    - window.AI_CHANNEL_META         (rich metadata per channel)
 *    - the DOM (#dishVideo, #dishChannelInfo, etc.)
 *    - the global helpers: showToast, loadDishVideo, saveSettings
 *
 *  Pipeline:
 *    1. Build TF-IDF index over the channel metadata
 *    2. On query: cosine top-K candidates
 *    3. If Gemini key set → ask Gemini to pick one + give a reason
 *       Else: retrieval-only mode (returns top match)
 *    4. Tune DishTV to that channel via the existing loadDishVideo flow
 *
 *  No backend. Key lives in localStorage only. Toggle in the TV Menu.
 * ===================================================================*/

(function () {
  'use strict';

  // ── 0. Boot — run as soon as the DOM is ready ───────────────────────
  //  We're loaded at the END of <body>, AFTER the host's inline script,
  //  so the host globals (dishChannels, loadDishVideo, showToast) are
  //  already defined in the shared classic-script lexical environment.
  //  Inject the UI immediately; defer the channel-tuning helpers behind
  //  safe `typeof` checks at the point of use.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    if (window.__AI_PICKER_BOOTED__) return;  // guard against double-init
    window.__AI_PICKER_BOOTED__ = true;

    // ── 1. RAG knowledge base ────────────────────────────────────────
    //  Indexed by the channel NUMBER (parsed from dishChannels[i].name).
    //  Tags + description = the document RAG retrieves over.
    //  Edit freely — richer text = smarter picks.
    const META = {
      121: {
        category: "general news",
        tags: ["news", "headlines", "samachar", "general", "aaj tak", "daily"],
        description: "AajTak general news bulletin — daily headlines from India."
      },
      122: {
        category: "entertainment",
        tags: ["saas bahu", "betiyaan", "soap", "tv serial", "bollywood", "celebrity", "entertainment", "gossip", "manoranjan"],
        description: "Saas Bahu aur Betiyaan — TV soap, serial drama and Bollywood entertainment gossip."
      },
      123: {
        category: "investigation",
        tags: ["special report", "investigation", "8:30 pm", "prime time", "in depth", "ground report", "explainer"],
        description: "AajTak Special Report 8:30PM Edition — long-form investigative journalism."
      },
      124: {
        category: "morning news",
        tags: ["morning", "subah", "10am", "breakfast news", "early", "wake up", "subah ki khabar"],
        description: "AajTak Aaj Subah 10AM Edition — morning news round-up."
      },
      125: {
        category: "politics",
        tags: ["politics", "agenda", "2020", "policy", "debate", "panel", "e-agenda", "leaders"],
        description: "AajTak 2020 e-Agenda Edition — political agenda summit, policy debates with leaders."
      },
      126: {
        category: "debate",
        tags: ["halla bol", "debate", "6:30 pm", "anchor", "shouting match", "panel discussion", "evening", "opinion"],
        description: "AajTak Halla Bol 6:30PM Edition — high-voltage prime time political debate show."
      },
      127: {
        category: "late night",
        tags: ["das tak", "10pm", "night news", "late night", "wrap up", "day end", "summary"],
        description: "AajTak Das Tak 10PM Edition — concise late night news wrap of the day's top 10 stories."
      },
      128: {
        category: "debate",
        tags: ["halla bol", "debate", "6pm", "panel", "anchor", "evening news", "discussion"],
        description: "AajTak Halla Bol 6PM Edition — evening debate format show."
      },
      129: {
        category: "elections",
        tags: ["election", "exit poll", "delhi", "2020", "voting", "results", "chunav", "predictions"],
        description: "AajTak Delhi Exit Poll 2020 — election day exit poll coverage and predictions for Delhi."
      },
      130: {
        category: "investigation",
        tags: ["special report", "2019", "investigation", "documentary", "in depth", "long form"],
        description: "AajTak 2019 Special Report Edition — investigative journalism from 2019."
      },
      131: {
        category: "panel show",
        tags: ["ek aur ek gyarah", "2017", "panel", "discussion", "talk show", "older", "archive"],
        description: "AajTak 2017 Ek aur Ek Gyarah Edition — classic panel discussion programme."
      },
      132: {
        category: "debate",
        tags: ["halla bol", "2019", "debate", "archive", "panel", "anchor"],
        description: "AajTak 2019 Halla Bol Edition — archived 2019 prime time debate."
      },
      133: {
        category: "live news",
        tags: ["live", "live tv", "24x7", "streaming", "breaking news", "now", "real time", "current", "hls"],
        description: "AajTak Live — round-the-clock live news streaming. Best for breaking news right now."
      },
      134: {
        category: "live news",
        tags: ["live", "ndtv", "ndtv india", "24x7", "streaming", "breaking", "alternative", "hls"],
        description: "NDTV India Live — alternative 24x7 live Hindi news stream."
      },
    };
    window.AI_CHANNEL_META = META;

    // ── 2. Build retrieval corpus from dishChannels + META ──────────
    function buildCorpus() {
      return dishChannels.map((ch, i) => {
        const m = (ch.name.match(/(\d+)/) || [])[1];
        const num = m ? parseInt(m, 10) : null;
        const meta = META[num] || { category: "", tags: [], description: "" };
        return {
          index: i,
          number: num,
          name: ch.name,
          src: ch.src,
          text: [ch.name, meta.category, meta.tags.join(" "), meta.description].join(" "),
          meta,
        };
      });
    }

    const STOPWORDS = new Set("a an the of in on at for to and or with is are be i want watch show me play put on something some please give like mujhe dikhao chahiye dikha do".split(" "));
    const tokenize = (s) =>
      (s || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g, " ")
        .split(/\s+/).filter(w => w && !STOPWORDS.has(w));

    function buildIndex(corpus) {
      const docs = corpus.map(d => tokenize(d.text));
      const df = new Map();
      docs.forEach(toks => new Set(toks).forEach(t => df.set(t, (df.get(t) || 0) + 1)));
      const N = docs.length;
      const idf = new Map();
      df.forEach((v, k) => idf.set(k, Math.log(1 + N / v)));
      const vectors = docs.map(toks => {
        const tf = new Map();
        toks.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
        const vec = new Map();
        tf.forEach((c, t) => vec.set(t, (c / toks.length) * (idf.get(t) || 0)));
        return vec;
      });
      return { idf, vectors, corpus };
    }

    function queryVec(q, idf) {
      const toks = tokenize(q);
      const tf = new Map();
      toks.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
      const vec = new Map();
      tf.forEach((c, t) => vec.set(t, (c / Math.max(1, toks.length)) * (idf.get(t) || 0)));
      return vec;
    }

    function cosine(a, b) {
      let dot = 0, na = 0, nb = 0;
      a.forEach((v, k) => { na += v * v; if (b.has(k)) dot += v * b.get(k); });
      b.forEach(v => { nb += v * v; });
      if (!na || !nb) return 0;
      return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    function retrieve(q, idx, k = 5) {
      const qv = queryVec(q, idx.idf);
      const scored = idx.corpus.map((d, i) => ({ doc: d, score: cosine(qv, idx.vectors[i]) }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, k);
    }

    // ── 3. Generation — Gemini picks ONE candidate ──────────────────
    //  Strategy:
    //    1. Try server proxy at /api/ai-pick  → uses the OWNER's key,
    //       set as GEMINI_API_KEY in Vercel env vars. No client key needed.
    //    2. If the proxy isn't deployed (404) or fails, fall back to the
    //       user's own pasted key (legacy / local dev mode).
    //    3. If neither works → retrieval-only mode handled by ask().
    async function serverPick(query, candidates) {
      const res = await fetch('/api/ai-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          candidates: candidates.map(c => ({
            number: c.doc.number,
            name: c.doc.name,
            category: c.doc.meta.category,
            tags: c.doc.meta.tags,
            description: c.doc.meta.description,
          })),
        }),
      });
      if (res.status === 404) throw new Error('NO_PROXY'); // sentinel: proxy not deployed
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Proxy ${res.status}: ${t.slice(0, 160)}`);
      }
      return res.json(); // { channel_number, reason, via: 'server' }
    }

    async function geminiPick(query, candidates, apiKey) {
      const ctx = candidates.map((c, i) =>
        `[${i + 1}] number=${c.doc.number} | "${c.doc.name}" (${c.doc.meta.category})\n` +
        `    tags: ${(c.doc.meta.tags || []).join(", ")}\n` +
        `    about: ${c.doc.meta.description}`
      ).join("\n");

      const prompt =
`You are the AI inside a Samsung C5000 LCD TV connected via HDMI 3 to a DishTV set-top box. The user just said:
"${query}"

Below are the top channels retrieved from the DishTV channel guide. Pick the SINGLE best match.

Channels:
${ctx}

Reply with STRICT JSON ONLY, no markdown:
{"channel_number": <number>, "reason": "<one short sentence, in the user's language>"}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 160)}`);
      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      try { return { ...JSON.parse(txt), via: 'client' }; }
      catch { return { channel_number: candidates[0].doc.number, reason: "Fallback to top retrieved channel.", via: 'client' }; }
    }

    // Safe wrapper — never crashes even if host helpers aren't loaded
    function toast(msg, icon, type) {
      if (typeof showToast === 'function') {
        try { return showToast(msg, icon || '', type || 'info'); } catch {}
      }
      console.log(`[AI] ${msg}`);
    }

    // ── 4. Tune the TV using the host's existing helpers ────────────
    function tuneTo(targetNumber, reason) {
      if (typeof dishChannels === 'undefined' || !Array.isArray(dishChannels)) {
        toast('TV channel guide not loaded yet — please wait a moment and try again.', '⚠️', 'error');
        return false;
      }
      const idx = dishChannels.findIndex(c => {
        const m = c.name.match(/(\d+)/);
        return m && parseInt(m[1], 10) === targetNumber;
      });
      if (idx < 0) {
        toast(`AI picked CH ${targetNumber} but it's not in the guide`, '⚠️', 'error');
        return false;
      }

      // Make sure we're on HDMI 3 (DishTV). If not, ask the user before switching.
      if (typeof activeInputSource !== 'undefined' && activeInputSource !== 4) {
        toast('Switch to HDMI 3 (DishTV) first, then ask again.', '📡', 'info');
        return false;
      }

      // Power on the dish receiver if it's off
      if (typeof dishPower !== 'undefined' && !dishPower) {
        toast('DishTV receiver is off. Press its power button first.', '⏻', 'info');
        return false;
      }

      if (typeof dishChannel !== 'undefined') dishChannel = idx;
      if (typeof dishVideoTime !== 'undefined') dishVideoTime = 0;
      const video = document.getElementById('dishVideo');
      if (video && typeof loadDishVideo === 'function') {
        loadDishVideo(video, dishChannels[idx].src, 0);
      }
      if (typeof updateAudioVolumes === 'function') updateAudioVolumes();
      const infoEl = document.getElementById('dishChannelInfo');
      if (infoEl) infoEl.innerText = dishChannels[idx].name;
      if (typeof saveSettings === 'function') saveSettings();

      toast(`🤖 ${dishChannels[idx].name} — ${reason}`, '🤖', 'success');
      return true;
    }

    // ── 5. State, persistence, and full pipeline ────────────────────
    const AI_KEY_STORE = 'samsung_tv_ai_gemini_key_v1';
    const AI_ENABLED_STORE = 'samsung_tv_ai_enabled_v1';

    let INDEX = buildIndex(buildCorpus());
    let aiEnabled = localStorage.getItem(AI_ENABLED_STORE) !== 'false';

    async function ask(query) {
      if (!aiEnabled) {
        toast('AI Channel Picker is OFF (toggle it on in the modal)', '🤖', 'info');
        return;
      }
      if (!query || !query.trim()) return;

      // Re-build the index in case dishChannels grew via broadcast update
      INDEX = buildIndex(buildCorpus());

      const candidates = retrieve(query, INDEX, 5);
      if (!candidates.length || candidates[0].score === 0 && !localStorage.getItem(AI_KEY_STORE)) {
        toast("No matching channels found.", "🔎", "info");
      }

      const userKey = localStorage.getItem(AI_KEY_STORE) || '';
      let pickNum, reason, via = 'retrieval';

      // ── Strategy 1: server proxy (no key needed; preferred path) ──
      let serverModel = null;
      try {
        toast('🤖 Asking AI…', '🤖', 'info');
        const pick = await serverPick(query, candidates);
        pickNum     = pick.channel_number;
        reason      = pick.reason || 'Best match for your request.';
        serverModel = pick.model || null;
        via         = 'server';
      } catch (serverErr) {
        // ── Strategy 2: user's pasted key (local dev / no proxy) ──
        if (userKey) {
          try {
            const pick = await geminiPick(query, candidates, userKey);
            pickNum = pick.channel_number;
            reason  = pick.reason || 'Best match for your request.';
            via     = 'client';
          } catch (clientErr) {
            toast('AI error: ' + clientErr.message, '⚠️', 'error');
            pickNum = candidates[0].doc.number;
            reason  = `Fallback (retrieval-only) · score ${candidates[0].score.toFixed(3)}`;
          }
        } else if (serverErr.message === 'NO_PROXY') {
          // ── Strategy 3: retrieval-only ──
          pickNum = candidates[0].doc.number;
          reason  = `Retrieval-only (no server, no key) · TF-IDF ${candidates[0].score.toFixed(3)}`;
        } else {
          toast('Server AI error: ' + serverErr.message, '⚠️', 'error');
          pickNum = candidates[0].doc.number;
          reason  = `Fallback (retrieval-only) · score ${candidates[0].score.toFixed(3)}`;
        }
      }

      tuneTo(pickNum, reason);
      logToConsole(query, candidates, pickNum, reason, via, serverModel);
    }

    function logToConsole(q, cands, pickNum, reason, via, model) {
      try {
        const tag = via === 'server' ? `🛡 server proxy${model ? ' · ' + model : ''}`
                  : via === 'client' ? '🔑 client key'
                  : '🔎 retrieval-only';
        console.groupCollapsed(`%c[AI Channel Picker] (${tag}) "${q}" → CH ${pickNum}`, 'color:#06b6d4;font-weight:bold;');
        console.log('Reason:', reason);
        console.table(cands.map(c => ({ ch: c.doc.number, name: c.doc.name, score: +c.score.toFixed(4) })));
        console.groupEnd();
      } catch {}
    }

    // ── 6. UI: floating button + prompt modal ───────────────────────
    function injectUI() {
      const style = document.createElement('style');
      style.textContent = `
        #ai-fab {
          position: fixed; right: 18px; bottom: 18px; z-index: 999999;
          min-width: 64px; height: 64px; padding: 0 14px 0 12px; border-radius: 999px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: #fff; border: 1px solid rgba(255,255,255,.18);
          box-shadow: 0 12px 28px rgba(2,132,199,.55), inset 0 1px 1px rgba(255,255,255,.25);
          cursor: pointer; transition: transform .15s, opacity .2s, box-shadow .2s;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #ai-fab:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 16px 36px rgba(2,132,199,.7); }
        #ai-fab.off { background: linear-gradient(135deg, #475569, #334155); opacity: .85; }
        #ai-fab .ai-fab-label { font-size: 13px; font-weight: 800; letter-spacing: .5px; }
        #ai-fab svg { display: block; }
        #ai-fab .dot { position:absolute; top:6px; right:6px; width:10px; height:10px; border-radius:50%;
                       background:#22c55e; box-shadow:0 0 8px #22c55e; border: 1.5px solid #0c2030; }
        #ai-fab.off .dot { background:#9ca3af; box-shadow:none; }
        @media (max-width: 600px) {
          #ai-fab { min-width: 56px; height: 56px; padding: 0 12px; }
          #ai-fab .ai-fab-label { display: none; }
        }

        #ai-modal-backdrop {
          position: fixed; inset: 0; background: rgba(2,6,23,.7); backdrop-filter: blur(6px);
          z-index: 10000; display: none; align-items: center; justify-content: center;
        }
        #ai-modal-backdrop.open { display: flex; }
        #ai-modal {
          width: min(560px, 92vw);
          background: linear-gradient(145deg, rgba(11,27,58,.96), rgba(5,12,31,.98));
          border: 1px solid rgba(56,189,248,.35);
          border-radius: 14px; padding: 18px; color: #e6ecf3;
          box-shadow: 0 30px 80px rgba(0,0,0,.6), inset 0 1px 1px rgba(255,255,255,.15);
          font-family: 'Inter', sans-serif;
        }
        #ai-modal h3 { margin: 0 0 4px; font-size: 16px; color: #7dd3fc; letter-spacing: .5px; }
        #ai-modal .sub { color: #94a3b8; font-size: 12px; margin-bottom: 14px; }
        #ai-modal label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .8px; }
        #ai-modal input[type="text"], #ai-modal input[type="password"] {
          width: 100%; box-sizing: border-box;
          background: rgba(15,23,42,.7); border: 1px solid rgba(56,189,248,.25);
          color: #e6ecf3; padding: 10px 12px; border-radius: 8px; font-size: 13px;
          margin: 4px 0 12px; font-family: inherit;
        }
        #ai-modal input:focus { outline: none; border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.18); }
        #ai-modal .row { display: flex; gap: 8px; align-items: center; }
        #ai-modal .row > input { margin-bottom: 0; }
        #ai-modal .btn {
          background: linear-gradient(135deg,#0ea5e9,#6366f1); color: #fff; border: none;
          padding: 9px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;
        }
        #ai-modal .btn.ghost { background: rgba(148,163,184,.15); color:#cbd5e1; border:1px solid rgba(148,163,184,.25); }
        #ai-modal .actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; }
        #ai-modal .chips { display:flex; flex-wrap:wrap; gap:6px; margin: 4px 0 12px; }
        #ai-modal .chip {
          background: rgba(56,189,248,.10); border: 1px solid rgba(56,189,248,.25);
          color: #bae6fd; padding: 4px 8px; border-radius: 999px; font-size: 11px; cursor: pointer;
        }
        #ai-modal .chip:hover { background: rgba(56,189,248,.22); }
        #ai-modal .toggle-row { display:flex; align-items:center; justify-content:space-between;
          background: rgba(15,23,42,.6); padding: 8px 12px; border-radius: 8px;
          border: 1px solid rgba(148,163,184,.18); margin-bottom: 12px; font-size: 12px;
        }
        .ai-switch { position:relative; width:38px; height:20px; }
        .ai-switch input { opacity:0; width:0; height:0; }
        .ai-switch .slider { position:absolute; inset:0; background:#334155; border-radius:20px; cursor:pointer; transition:.2s; }
        .ai-switch .slider::before { content:""; position:absolute; left:3px; top:3px; width:14px; height:14px;
                                     border-radius:50%; background:#fff; transition:.2s; }
        .ai-switch input:checked + .slider { background:#0ea5e9; }
        .ai-switch input:checked + .slider::before { transform: translateX(18px); }
        #ai-modal .hint { font-size:11px; color:#64748b; margin-top:-6px; margin-bottom:10px; }
        #ai-modal .hint a { color:#7dd3fc; }
      `;
      document.head.appendChild(style);

      const fab = document.createElement('button');
      fab.id = 'ai-fab';
      fab.title = 'AI Channel Picker (RAG) — press I';
      // Inline SVG + label so it works even if Font Awesome CDN is blocked
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2"/>
          <path d="M8 3l4 4 4-4"/>
          <circle cx="9" cy="13" r="1.2" fill="currentColor"/>
          <circle cx="15" cy="13" r="1.2" fill="currentColor"/>
          <path d="M9 17h6"/>
        </svg>
        <span class="ai-fab-label">AI</span>
        <span class="dot"></span>`;
      fab.classList.toggle('off', !aiEnabled);
      document.body.appendChild(fab);

      const modal = document.createElement('div');
      modal.id = 'ai-modal-backdrop';
      modal.innerHTML = `
        <div id="ai-modal" role="dialog" aria-modal="true">
          <h3>🤖 AI Channel Picker — RAG</h3>
          <div class="sub">Tells DishTV (HDMI 3) what to tune. Retrieval (TF-IDF) → Gemini → tune.</div>

          <div class="toggle-row">
            <span>⏻ &nbsp; AI assistant</span>
            <label class="ai-switch">
              <input type="checkbox" id="ai-toggle-modal" ${aiEnabled ? 'checked' : ''}/>
              <span class="slider"></span>
            </label>
          </div>

          <label>Gemini API key <span style="color:#64748b;">(optional — only needed for local dev. On Vercel the server proxy handles it.)</span></label>
          <div class="row">
            <input id="ai-key-input" type="password" placeholder="AIza… (leave empty when deployed)" autocomplete="off" />
            <button class="btn ghost" id="ai-key-clear" title="Clear key">✕</button>
          </div>
          <div class="hint">
            🛡 On the deployed site, requests go through <code style="color:#7dd3fc;">/api/ai-pick</code> — your key never touches the browser.<br>
            For local dev, paste a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.
          </div>

          <label>What do you want to watch?</label>
          <input id="ai-query-input" type="text" placeholder='e.g. "मुझे ताज़ा खबरें live दिखाओ"' />

          <div class="chips" id="ai-chips"></div>

          <div class="actions">
            <button class="btn ghost" id="ai-cancel">Cancel</button>
            <button class="btn" id="ai-ask">Tune Channel →</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Hydrate the key field
      const keyInput = modal.querySelector('#ai-key-input');
      keyInput.value = localStorage.getItem(AI_KEY_STORE) || '';
      keyInput.addEventListener('change', () => {
        const v = keyInput.value.trim();
        if (v) localStorage.setItem(AI_KEY_STORE, v);
        else localStorage.removeItem(AI_KEY_STORE);
      });
      modal.querySelector('#ai-key-clear').addEventListener('click', () => {
        keyInput.value = '';
        localStorage.removeItem(AI_KEY_STORE);
        toast('Gemini key cleared', '🧹', 'info');
      });

      // Toggle
      const toggle = modal.querySelector('#ai-toggle-modal');
      toggle.addEventListener('change', () => {
        aiEnabled = toggle.checked;
        localStorage.setItem(AI_ENABLED_STORE, aiEnabled ? 'true' : 'false');
        fab.classList.toggle('off', !aiEnabled);
        toast(`AI Channel Picker: ${aiEnabled ? 'ON' : 'OFF'}`,
              '🤖', aiEnabled ? 'success' : 'info');
      });

      // Suggestion chips
      const chips = modal.querySelector('#ai-chips');
      const queryInput = modal.querySelector('#ai-query-input');
      [
        "show me live news right now",
        "मुझे prime time debate देखना है",
        "morning news please",
        "Delhi election exit poll",
        "Bollywood / saas bahu serial",
        "investigative special report",
      ].forEach(p => {
        const c = document.createElement('button');
        c.className = 'chip'; c.type = 'button'; c.textContent = p;
        c.addEventListener('click', () => { queryInput.value = p; queryInput.focus(); });
        chips.appendChild(c);
      });

      // Open / close
      function open() { modal.classList.add('open'); setTimeout(() => queryInput.focus(), 50); }
      function close() { modal.classList.remove('open'); }
      fab.addEventListener('click', open);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
      modal.querySelector('#ai-cancel').addEventListener('click', close);

      // Submit
      function submit() {
        const q = queryInput.value.trim();
        if (!q) return;
        close();
        ask(q);
      }
      modal.querySelector('#ai-ask').addEventListener('click', submit);
      queryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

      // Global hotkey: "I" opens the picker (skip when typing in fields)
      document.addEventListener('keydown', (e) => {
        if (e.key && e.key.toLowerCase() === 'i') {
          const t = e.target;
          const tag = (t && t.tagName) || '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
          e.preventDefault();
          modal.classList.contains('open') ? close() : open();
        } else if (e.key === 'Escape' && modal.classList.contains('open')) {
          close();
        }
      });
    }

    // ── 7. Expose a tiny public API for debugging / external triggers
    window.AI_PICKER = {
      ask,
      retrieve: (q) => retrieve(q, INDEX, 5),
      setKey: (k) => { localStorage.setItem(AI_KEY_STORE, k); },
      isEnabled: () => aiEnabled,
      version: '1.0.13',
      mode: 'server-first (Vercel Edge) with client-key + retrieval fallbacks',
    };

    injectUI();
    console.log('%c[AI Channel Picker] ready · v1.0.13 · server-first via /api/ai-pick · press I',
                'color:#06b6d4;font-weight:bold;');
  }
})();
