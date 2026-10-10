#!/usr/bin/env node
/**
 * Capture a demo GIF of the real Golden Gate OS UI.
 *
 * Drives the shipped build in headless Chromium via Playwright, clicks real
 * dock icons, and records frames. ffmpeg then assembles them into a GIF.
 *
 * Unlike scripts/make_social_preview.py (which composites artwork because it
 * has no browser), this records the actual application.
 *
 * Usage:
 *   node scripts/make_demo_gif.mjs            # full capture
 *   node scripts/make_demo_gif.mjs --dry-run  # just verify it boots
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(
  ROOT,
  'Skills/showcase/restaurants/macOS-evolution/'
    + 'Modern MacOS (2020 to 2026)/macOS 27 Golden Gate/golden-gate-os-v27',
);
const DIST = path.join(APP, 'dist');
const FRAMES = path.join(ROOT, '.github/demo-frames');
const OUT = path.join(ROOT, '.github/demo.gif');

const DRY = process.argv.includes('--dry-run');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Minimal static server over the production build. */
function serve(dir) {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(dir, url === '/' ? 'index.html' : url);
      if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
      if (!existsSync(file) || file.endsWith('/')) file = path.join(dir, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Get a page from whatever gate it's behind to the desktop.
 *
 * Three gates, in order: Setup Assistant (12 steps, one scroll-gated on the
 * terms, Siri's needs "Skip Setup" not "Continue"), then the lock screen on
 * any reload once setup_complete is set.
 */
async function clearFirstRun(page) {
  const continueBtn = page.getByRole('button', { name: /continue/i });
  for (let i = 0; i < 24; i += 1) {
    if (await page.getByTestId('dock').count()) return;

    const skip = page.getByRole('button', { name: /skip setup/i });
    if (await skip.count()) {
      await skip.click({ timeout: 5000 }).catch(() => {});
      await sleep(700);
      continue;
    }
    if (await page.getByText(/press return to unlock/i).count()) {
      await page.keyboard.press('Enter');
      await sleep(1200);
      continue;
    }
    if (await continueBtn.count()) {
      if (await continueBtn.isDisabled().catch(() => false)) {
        await page.mouse.wheel(0, 3000).catch(() => {});
        await sleep(400);
      }
      await continueBtn.click({ timeout: 5000 }).catch(() => {});
      await sleep(700);
      continue;
    }
    await sleep(500);
  }
  await page.getByTestId('dock').waitFor({ timeout: 30000 });
}

/**
 * Force the dark wallpaper.
 *
 * useDynamicWallpaper picks light vs dark from sunCalc, which ignores any
 * Date override here. Swap the rendered <img> instead — presentation only,
 * leaves the app's state machine alone.
 */
const useDarkWallpaper = (page) => page.evaluate(() => {
  const img = document.querySelector('[data-testid="wallpaper"] img');
  if (img) img.src = '/wallpapers/golden-gate-dark.webp';
});

async function main() {
  if (!existsSync(DIST)) {
    throw new Error(`No build at ${DIST} — run "npm run build" in the app first.`);
  }

  const { server, port } = await serve(DIST);
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  // Skips the welcome screen that would otherwise land between setup and desktop.
  await page.addInitScript(() => {
    localStorage.setItem('golden_gate_v27_welcome_seen', 'true');
  });

  // networkidle never settles: the app ships analytics that hold connections
  // open. The dock waitFor below is the real readiness signal anyway.
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  await clearFirstRun(page);
  console.log('booted to desktop');

  // useDynamicWallpaper picks light vs dark from sunCalc, which ignores any
  // Date override here. Swap the rendered <img> instead — presentation only,
  // leaves the app's state machine alone.
  await useDarkWallpaper(page);
  await sleep(1500);
  console.log('dark wallpaper applied');

  if (DRY) {
    console.log('dock visible, dry run done');
    await browser.close();
    server.close();
    return;
  }

  await rm(FRAMES, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });

  // ffmpeg's image2 demuxer won't glob, and it can't hold frames at wildly
  // different durations. So: plain sequential names + an explicit concat list
  // giving each frame its own display time.
  let n = 0;
  const shots = [];
  const shoot = async (label, seconds = 1.2) => {
    const i = n++;
    const file = path.join(FRAMES, `f${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: file });
    shots.push({ file, seconds, label });
    console.log('  frame', label, `(${seconds}s)`);
  };

  await shoot('desktop', 1.6);

  // Hover a few dock icons to show the magnification, then open a couple of
  // real apps. Clicks go through the same path a visitor's mouse would.
  const dock = page.getByTestId('dock');
  const icons = dock.locator('[aria-label]');
  const count = await icons.count();
  console.log(`${count} dock icons`);

  for (const label of ['Finder', 'Safari']) {
    const icon = icons.filter({ hasText: '' }).nth(0);
    void icon;
    const target = page.locator(`[aria-label^="${label}"]`).first();
    if (await target.count()) {
      await target.hover();
      await sleep(500);
      await shoot(`hover-${label}`, 1.0);
      await target.click();
      await sleep(1800);
      await shoot(`open-${label}`, 2.0);
    } else {
      console.log(`  no dock icon "${label}", skipping`);
    }
  }
  void count;

  await sleep(1500);
  await shoot('final', 1.8);

  // --- banner source ------------------------------------------------------
  // Separate wide capture: the GIF's 1280x800 crop zooms into the window, and
  // the banner needs the whole desktop with the app pushed right so the left
  // stays clear for the headline.
  const wide = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // addInitScript is per-page, so the banner page needs the same priming.
  await wide.addInitScript(() => {
    localStorage.setItem('golden_gate_v27_welcome_seen', 'true');
  });
  await wide.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await clearFirstRun(wide);
  await useDarkWallpaper(wide);
  await sleep(1800);

  const safari = wide.locator('[aria-label^="Safari"]').first();
  if (await safari.count()) {
    await safari.click();
    await sleep(2400);
  }

  // Park the window on the right. The titlebar (h-12) is the drag handle — it
  // calls framer's controls.start(e) on pointerdown, so a real mouse sequence
  // with intermediate steps is needed for the drag to register.
  const bar = wide.locator('div.h-12.w-full').first();
  if (await bar.count()) {
    const box = await bar.boundingBox();
    if (box) {
      const sx = box.x + box.width / 2;
      const sy = box.y + box.height / 2;
      const dx = 520; // shift right, clear of the headline
      await wide.mouse.move(sx, sy);
      await wide.mouse.down();
      await sleep(120);
      for (let s = 1; s <= 20; s += 1) {
        await wide.mouse.move(sx + (dx * s) / 20, sy);
        await sleep(16);
      }
      await sleep(120);
      await wide.mouse.up();
      await sleep(1000);
    }
  }
  await wide.screenshot({ path: path.join(FRAMES, 'banner-source.png') });
  await wide.close();
  console.log('  banner source saved (1440x900, app on right)');

  await browser.close();
  server.close();

  const listPath = path.join(FRAMES, 'frames.txt');
  await writeFile(listPath, shots
    .map((s) => `file '${s.file.replace(/'/g, "'\\''")}'\nduration ${s.seconds}`)
    .join('\n') + '\n');

  // palettegen/paletteuse is what keeps a dozen full-desktop 1280px frames from
  // ballooning into a 30MB file.
  execFileSync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
    '-vf', 'scale=900:-1:flags=lanczos,split[a][b];'
      + '[a]palettegen=max_colors=192:stats_mode=diff[p];'
      + '[b][p]paletteuse=dither=bayer:bayer_scale=3',
    '-loop', '0', OUT,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });

  const { size } = await readFile(OUT).then((b) => ({ size: b.length }));
  console.log(`\nwrote ${path.relative(ROOT, OUT)} (${(size / 1024 / 1024).toFixed(2)} MB)`);
  if (process.argv.includes('--keep-frames')) {
    console.log('frames kept in', path.relative(ROOT, FRAMES));
  } else {
    await rm(FRAMES, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});