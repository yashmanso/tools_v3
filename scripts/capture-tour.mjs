#!/usr/bin/env node
/**
 * Capture the screens used by the guided tour.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run tour:shots              # in another
 *
 * Each recipe drives the real site to the screen a tour step describes, then
 * writes public/tour/<id>.jpg. The ids must match app/lib/tourSteps.ts exactly;
 * the script refuses to run otherwise, so a step added on one side cannot
 * quietly ship without the other.
 *
 * Re-run this after changing any screen the tour shows. Captures do not update
 * themselves.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'tour');
const BASE = process.env.TOUR_BASE_URL || 'http://127.0.0.1:3000';
const VIEWPORT = { width: 1280, height: 800 };
const QUALITY = 82;

/** Read the step ids straight from the source of truth. */
function stepIdsFromSource() {
  const src = fs.readFileSync(path.join(ROOT, 'app/lib/tourSteps.ts'), 'utf8');
  return [...src.matchAll(/^\s*id:\s*'([^']+)'/gm)].map(m => m[1]);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Open the workflow menu and pick a mode by its id. */
async function gotoMode(page, mode) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await sleep(700);
  await page.click('[data-tour="menu-button"]');
  await page.waitForSelector('[data-tour="workflow-menu"]', { timeout: 5000 });
  await sleep(300);
  await page.click(`[data-tour="menu-item-${mode}"]`);
  await sleep(1200);
}

/** Scroll an element to the middle of the viewport. */
async function focusOn(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await sleep(600);
}

/** Click the first N entries of a list, for screens that need to be populated. */
async function clickSome(page, selector, count) {
  const items = page.locator(selector);
  const available = await items.count();
  for (let i = 0; i < Math.min(count, available); i++) {
    await items.nth(i).click({ timeout: 5000 }).catch(() => {});
    await sleep(400);
  }
}

const recipes = {
  // ---------- orientation ----------
  async welcome(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(900);
  },
  async hub(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await focusOn(page, '[data-tour="explore-hub"]');
  },
  async 'most-viewed'(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await focusOn(page, '[data-tour="most-viewed"]');
  },
  async toolbar(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(900);
  },
  async menu(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await page.click('[data-tour="menu-button"]');
    await page.waitForSelector('[data-tour="workflow-menu"]');
    await sleep(500);
  },

  // ---------- workflows ----------
  async browse(page) {
    await gotoMode(page, 'browse');
  },
  async 'find-question'(page) {
    await gotoMode(page, 'find');
  },
  async 'find-results'(page) {
    await gotoMode(page, 'find');
    // Answer through the questionnaire to reach the shortlist.
    for (let i = 0; i < 6; i++) {
      const opts = page.locator('[data-tour="finder-options"] button');
      if (!(await opts.count())) break;
      await opts.first().click({ timeout: 5000 }).catch(() => {});
      await sleep(700);
    }
    await sleep(600);
  },
  async 'compare-pick'(page) {
    await gotoMode(page, 'compare');
  },
  async 'compare-table'(page) {
    await gotoMode(page, 'compare');
    // Populate the table: an empty comparison shows nothing worth describing.
    // Use the add control, not the card: the card is a link to the tool.
    // Clicking nth(0) repeatedly because selecting re-renders the list.
    const add = page.locator('[title="Add to comparison"]');
    for (let i = 0; i < 3; i++) {
      await add.nth(0).click({ timeout: 5000 }).catch(() => {});
      await sleep(450);
    }
    // The comparison only renders once it is asked for.
    await page.click('text=Compare selected tools', { timeout: 5000 }).catch(() => {});
    await sleep(1200);
    await focusOn(page, 'text=Start over');
  },
  async 'timeline-stages'(page) {
    await gotoMode(page, 'timeline');
    await focusOn(page, '[data-tour="timeline-stages"]');
  },
  async 'timeline-filtered'(page) {
    await gotoMode(page, 'timeline');
    const markers = page.locator('[data-tour="timeline-stages"] button:not([disabled])');
    if (await markers.count()) {
      await markers.nth(4).click({ timeout: 5000 }).catch(() => {});
      await sleep(1100);
    }
  },
  async network(page) {
    await gotoMode(page, 'network');
    await sleep(2200); // let the force layout settle
  },
  async 'wf-start'(page) {
    await gotoMode(page, 'workflows');
  },
  async 'wf-add'(page) {
    await gotoMode(page, 'workflows');
    await page.click('[data-tour="wf-create"]');
    await page.waitForSelector('[data-tour="wf-title"]');
    await page.fill('[data-tour="wf-title"]', 'Assess a product idea for circularity');
    await sleep(500);
  },
  async 'wf-steps'(page) {
    await gotoMode(page, 'workflows');
    await page.click('[data-tour="wf-create"]');
    await page.waitForSelector('[data-tour="wf-title"]');
    await page.fill('[data-tour="wf-title"]', 'Assess a product idea for circularity');
    // Add a few tools so the step list is not empty.
    await clickSome(page, '[data-tour="wf-tool"]', 3);
    await sleep(700);
    await focusOn(page, '[data-tour="wf-steps"]');
  },
  async 'compat-select'(page) {
    await gotoMode(page, 'compatibility');
  },
  async 'compat-results'(page) {
    await gotoMode(page, 'compatibility');
    await clickSome(page, '[data-tour="compat-item"]', 2);
    await sleep(1200);
    await focusOn(page, '[data-tour="compat-results"]');
  },
  async visual(page) {
    await gotoMode(page, 'visual');
    await clickSome(page, '[data-tour="visual-goal"]', 1);
    await sleep(900);
  },

  // ---------- tool pages ----------
  async 'tool-tags'(page) {
    await page.goto(`${BASE}/tools/triple-layered-business-model-canvas`, { waitUntil: 'networkidle' });
    await sleep(900);
  },
  async 'tool-dimensions'(page) {
    await page.goto(`${BASE}/tools/triple-layered-business-model-canvas`, { waitUntil: 'networkidle' });
    await sleep(700);
    const h = page.locator('h1', { hasText: 'Dimensions' }).first();
    if (await h.count()) await h.scrollIntoViewIfNeeded();
    await sleep(600);
  },
  async 'tool-prereq'(page) {
    await page.goto(`${BASE}/tools/triple-layered-business-model-canvas`, { waitUntil: 'networkidle' });
    await sleep(700);
    const pre = page.locator('[data-tour="tool-prereq"]').first();
    if (await pre.count()) {
      await pre.scrollIntoViewIfNeeded();
      await pre.locator('button').first().click({ timeout: 4000 }).catch(() => {});
      await sleep(800);
    }
  },
  async 'tool-compat'(page) {
    await page.goto(`${BASE}/tools/triple-layered-business-model-canvas`, { waitUntil: 'networkidle' });
    await sleep(700);
    const h = page.locator('h2', { hasText: 'Tool Compatibility' }).first();
    if (await h.count()) await h.scrollIntoViewIfNeeded();
    await sleep(600);
  },
  async panels(page) {
    await page.goto(`${BASE}/tools/triple-layered-business-model-canvas`, { waitUntil: 'networkidle' });
    await sleep(900);
    const links = page.locator('a[href^="/tools/"]:visible');
    const n = await links.count();
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.includes('triple-layered')) {
        await links.nth(i).scrollIntoViewIfNeeded();
        await links.nth(i).click({ timeout: 6000 }).catch(() => {});
        break;
      }
    }
    await sleep(1800);
  },

  // ---------- assistant ----------
  async assistant(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await page.locator('[aria-label="Find a tool"]:visible').first().click();
    await page.waitForSelector('[aria-label="Tool assistant"]');
    const input = page.locator('[aria-label="Tool assistant"] input');
    await input.fill('I want to assess a circular business model');
    await input.press('Enter');
    await sleep(1400);
    await input.fill('for educators running a workshop');
    await input.press('Enter');
    await sleep(1600);
  },
};

async function main() {
  // Playwright is intentionally not a dependency of this project: installing it
  // would pull ~300MB of browsers into every deploy. Install it locally when
  // you need to recapture.
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('This script needs Playwright. Install it locally:\n  npm install --no-save playwright');
    process.exit(1);
  }

  const ids = stepIdsFromSource();
  const recipeNames = Object.keys(recipes);

  const missingRecipe = ids.filter(id => !recipeNames.includes(id));
  const orphanRecipe = recipeNames.filter(name => !ids.includes(name));
  if (missingRecipe.length || orphanRecipe.length) {
    if (missingRecipe.length) console.error(`Steps with no capture recipe: ${missingRecipe.join(', ')}`);
    if (orphanRecipe.length) console.error(`Recipes with no tour step: ${orphanRecipe.join(', ')}`);
    process.exit(1);
  }

  // Fail early rather than writing a folder of blank pages.
  const probe = await fetch(BASE).catch(() => null);
  if (!probe || !probe.ok) {
    console.error(`No site at ${BASE}. Run "npm run build && npm start" first.`);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  // Keep the first-visit dialogs out of every screenshot.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('welcome-completed', 'true');
      localStorage.setItem('atlas-tour-completed', 'true');
      localStorage.setItem('exitIntentLastShown', String(Date.now()));
    } catch {}
  });
  const page = await ctx.newPage();

  let failed = 0;
  for (const id of ids) {
    try {
      await recipes[id](page);
      await page.screenshot({
        path: path.join(OUT, `${id}.jpg`),
        type: 'jpeg',
        quality: QUALITY,
      });
      const kb = (fs.statSync(path.join(OUT, `${id}.jpg`)).size / 1024).toFixed(0);
      console.log(`  ok    ${id.padEnd(18)} ${kb}KB`);
    } catch (err) {
      failed++;
      console.error(`  FAIL  ${id.padEnd(18)} ${String(err.message).split('\n')[0].slice(0, 80)}`);
    }
  }

  await browser.close();
  const total = fs
    .readdirSync(OUT)
    .filter(f => f.endsWith('.jpg'))
    .reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`\n${ids.length - failed}/${ids.length} captured, ${(total / 1e6).toFixed(1)}MB total -> public/tour`);
  process.exit(failed ? 1 : 0);
}

main();
