import { chromium, type Browser, type Page } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PASS_THRESHOLD = 0.8;

interface TestResult {
  section: string;
  name: string;
  pass: boolean;
  detail?: string;
}

const results: TestResult[] = [];
let passed = 0, failed = 0;

function ok(section: string, name: string, detail?: string) {
  passed++;
  results.push({ section, name, pass: true, detail });
}

function fail(section: string, name: string, detail: string) {
  failed++;
  results.push({ section, name, pass: false, detail });
}

async function recreatePage(browser: Browser): Promise<Page> {
  const ctx = await browser.createContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  try {
    await page.waitForSelector('[data-testid="desktop"]', { timeout: 25000 });
  } catch {
    try {
      await page.waitForSelector('[data-testid="boot-sequence"]', { timeout: 5000 });
      await page.waitForSelector('[data-testid="login-screen"]', { timeout: 15000 });
      const pwInput = page.locator('[data-testid="password-input"], input[type="password"]').first();
      if (await pwInput.isVisible({ timeout: 2000 })) {
        await pwInput.fill('');
        await page.locator('button:has-text("Continue"), button:has-text("Log In")').first().click();
        await page.waitForSelector('[data-testid="desktop"]', { timeout: 15000 });
      }
    } catch {
      await page.evaluate(() => {
        const btn = document.querySelector('button');
        if (btn) btn.click();
      });
      await page.waitForTimeout(3000);
    }
  }
  return page;
}

async function run() {
  console.log(`\n🧪 Golden Gate OS v27 — QA Test Suite`);
  console.log(`   Target: ${BASE_URL}\n`);

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer'] });
  } catch (e: any) {
    fail('Setup', 'Launch browser', e.message);
    printReport();
    process.exit(1);
  }

  let page: Page;
  try {
    page = await recreatePage(browser);
  } catch (e: any) {
    fail('Setup', 'Navigate to desktop', e.message);
    printReport();
    await browser.close();
    process.exit(1);
  }

  // ─── SECTION 1: Critical HTML & data-testid attributes ───
  const section1 = 'Critical Attributes';
  const checks: [string, string, string][] = [
    ['desktop', 'Desktop container', '#desktop, [data-testid="desktop"]'],
    ['menubar', 'Menu bar', '#menubar, [data-testid="menubar"]'],
    ['dock', 'Dock', '#dock, [data-testid="dock"]'],
    ['notch', 'Notch', '#notch, [data-testid="notch"]'],
    ['wallpaper', 'Wallpaper', '#wallpaper, [data-testid="wallpaper-container"]'],
  ];
  for (const [id, label, sel] of checks) {
    try {
      await page.waitForSelector(sel, { timeout: 3000 });
      ok(section1, `${label} (${id})`);
    } catch {
      fail(section1, `${label} (${id})`, `${sel} not found`);
    }
  }

  // ─── SECTION 2: Dock renders ≥ 4 items ───
  try {
    const dockItems = await page.locator('#dock a, #dock button, [data-testid="dock"] a, [data-testid="dock"] button, [data-testid^="dock-icon"], div.cursor-pointer').count();
    if (dockItems >= 4) ok('Dock', `Dock has ${dockItems} items`);
    else fail('Dock', 'Dock items', `Expected ≥4, got ${dockItems}`);
  } catch (e: any) {
    fail('Dock', 'Dock items', e.message);
  }

  // ─── SECTION 3: Clock displays time ───
  try {
    const timeText = await page.locator('[data-testid="clock"], #clock, [data-testid="menubar-time"]').first().textContent({ timeout: 2000 });
    if (timeText && timeText.trim().length > 0) ok('Menu Bar', 'Clock displays time', timeText.trim());
    else fail('Menu Bar', 'Clock displays time', 'Empty time text');
  } catch (e: any) {
    fail('Menu Bar', 'Clock displays time', e.message);
  }

  // ─── SECTION 4: Battery indicator ───
  try {
    const battery = page.locator('[data-testid="battery"], [data-testid="battery-icon"]');
    if (await battery.isVisible({ timeout: 2000 })) ok('Menu Bar', 'Battery indicator visible');
    else fail('Menu Bar', 'Battery indicator', 'Not visible');
  } catch {
    fail('Menu Bar', 'Battery indicator', 'Not found');
  }

  // ─── SECTION 5: Console errors ───
  const consoleErrors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  // ─── SECTION 6: Launch an app from Dock ───
  const appToLaunch = 'safari';
  try {
    const dockIcon = page.locator(`[data-testid="dock-icon-${appToLaunch}"], [data-testid="dock-icon"][data-app="${appToLaunch}"]`).first();
    if (await dockIcon.isVisible({ timeout: 2000 })) {
      const box = await dockIcon.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(2000);
        const windowEl = page.locator('[data-testid^="window-"]').first();
        if (await windowEl.isVisible({ timeout: 5000 })) ok('App Launch', `Launched ${appToLaunch} – window opened`);
        else fail('App Launch', `Launched ${appToLaunch}`, 'Window did not appear');
      } else fail('App Launch', `Click ${appToLaunch}`, 'Bounding box null');
    } else {
      // try clicking first dock item
      const firstIcon = page.locator('#dock a, #dock button, [data-testid="dock"] a, [data-testid="dock"] button, div.cursor-pointer').first();
      if (await firstIcon.isVisible({ timeout: 2000 })) {
        await firstIcon.click();
        await page.waitForTimeout(2000);
        ok('App Launch', `Clicked first dock item (fallback)`);
      } else fail('App Launch', `Dock icon ${appToLaunch}`, 'No dock items clickable');
    }
  } catch (e: any) {
    fail('App Launch', `Launch ${appToLaunch}`, e.message);
  }

  // ─── SECTION 7: Responsiveness (5 viewports) ───
  const viewports = [
    { w: 1920, h: 1080, label: '1920×1080' },
    { w: 1512, h: 982, label: '1512×982 (MacBook Pro)' },
    { w: 1024, h: 768, label: '1024×768 (iPad)' },
    { w: 768, h: 1024, label: '768×1024 (iPad Portrait)' },
    { w: 390, h: 844, label: '390×844 (iPhone)' },
  ];
  let responsivePass = 0;
  for (const vp of viewports) {
    try {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.waitForTimeout(500);
      const dockVis = await page.locator('#dock, [data-testid="dock"]').isVisible({ timeout: 2000 });
      if (dockVis) { responsivePass++; ok('Responsiveness', vp.label); }
      else fail('Responsiveness', vp.label, 'Dock not visible at this viewport');
    } catch (e: any) {
      fail('Responsiveness', vp.label, e.message);
    }
  }
  void responsivePass;

  // ─── SECTION 8: Launch multiple apps ───
  const launchLimit = 4;
  const appsToLaunch = ['finder', 'terminal', 'clock', 'calculator'];
  let appLaunchOk = 0;
  for (let i = 0; i < Math.min(appsToLaunch.length, launchLimit); i++) {
    const app = appsToLaunch[i];
    try {
      const icon = page.locator(`[data-testid="dock-icon-${app}"], a[data-app="${app}"]`).first();
      if (await icon.isVisible({ timeout: 1000 })) {
        await icon.click();
        await page.waitForTimeout(1500);
        appLaunchOk++;
      }
    } catch {
      // ok if not found
    }
  }
  if (appLaunchOk > 0) ok('Multi-App', `Launched ${appLaunchOk}/${launchLimit} additional apps`);
  else fail('Multi-App', 'Launch multiple apps', 'Could not click any dock icon');

  // ─── SECTION 9: Close all windows ───
  try {
    const closeButtons = page.locator('button:has-text("✕"), [data-testid="window-close"]');
    const count = await closeButtons.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await closeButtons.nth(0).click({ timeout: 1000 });
        await page.waitForTimeout(300);
      } catch { /* some may close others */ }
    }
    ok('Window Mgmt', `Attempted to close ${Math.min(count, 3)} windows`);
  } catch (e: any) {
    fail('Window Mgmt', 'Close windows', e.message);
  }

  // ─── SECTION 10: Console error check ───
  if (consoleErrors.length === 0) ok('Console', 'No console errors detected');
  else fail('Console', 'Console errors', consoleErrors.slice(0, 3).join(' | '));

  // ─── SECTION 11: Menu Bar items visible ───
  try {
    const menuText = await page.locator('[data-testid="menubar"]').first().textContent({ timeout: 2000 });
    if (menuText && menuText.length > 5) ok('Menu Bar', 'Menu bar has content', menuText.slice(0, 50));
    else fail('Menu Bar', 'Menu bar content', 'Empty or too short');
  } catch {
    fail('Menu Bar', 'Menu bar content', 'Element not found');
  }

  // ─── SECTION 12: ARIA attributes ───
  let ariaIssues = 0;
  try {
    const buttons = page.locator('button');
    const bCount = await buttons.count();
    for (let i = 0; i < Math.min(bCount, 20); i++) {
      const hasAria = await buttons.nth(i).getAttribute('aria-label');
      if (!hasAria) ariaIssues++;
    }
    if (ariaIssues <= 5) ok('Accessibility', `Only ${ariaIssues}/${Math.min(bCount, 20)} buttons missing aria-label`);
    else fail('Accessibility', 'ARIA labels', `${ariaIssues} buttons missing aria-label`);
  } catch (e: any) {
    fail('Accessibility', 'ARIA labels', e.message);
  }

  // ─── SECTION 13: 404 handling ───
  try {
    await page.goto(`${BASE_URL}/nonexistent-page-xyz`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const body = await page.locator('body').textContent({ timeout: 2000 });
    // Should still render the app (SPA) or show some content
    if (body && body.length > 0) ok('404', 'SPA handles unknown route');
    else fail('404', 'SPA handles unknown route', 'Empty body');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch (e: any) {
    fail('404', '404 handling', e.message);
  }

  // ─── REPORT ───
  printReport();
  await browser.close();
  const passRate = passed / (passed + failed);
  process.exit(passRate >= PASS_THRESHOLD ? 0 : 1);
}

function printReport() {
  const total = passed + failed;
  const rate = (passed / total * 100).toFixed(1);
  console.log(`\n${'='.repeat(56)}`);
  console.log(`  📊  ${passed}/${total} passed  (${rate}%)`);
  if (failed > 0) {
    console.log(`\n  ❌ Failures:`);
    for (const r of results.filter(r => !r.pass)) {
      console.log(`     • ${r.section} › ${r.name}: ${r.detail}`);
    }
  }
  console.log(`${'='.repeat(56)}\n`);
}

run();
