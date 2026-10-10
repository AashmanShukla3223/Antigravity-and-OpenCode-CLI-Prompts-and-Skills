import { test, expect } from '@playwright/test';

/**
 * Smoke test against the deployed app.
 *
 * These deliberately assert only what must be true for the site to be
 * considered up: it serves the app shell, exposes a social preview image, and
 * the OG tags point at that image. Anything deeper needs the local build
 * (see scripts/make_demo_gif.mjs), so it doesn't belong in this suite.
 */
const SITE = process.env.SMOKE_URL || 'https://macos-27-golden-gate.vercel.app';

test('serves the app shell', async ({ page }) => {
  const res = await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Golden Gate/i);
});

test('exposes a social preview image', async ({ page, request }) => {
  const res = await request.get(`${SITE}/og-image.png`);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('OG tags point at the preview image, not the wallpaper', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toBe(`${SITE}/og-image.png`);
});