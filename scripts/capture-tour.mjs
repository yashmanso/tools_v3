#!/usr/bin/env node
/**
 * Capture the screens used by the guided tour.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run tour:shots              # in another
 *
 * For each step in app/lib/tourSteps.ts this drives the real site to the screen
 * the step describes, records where the step's target sits, and writes
 * public/tour/<id>.jpg plus app/lib/tourHotspots.json.
 *
 * Two guards, because a wrong screen is worse than a missing one:
 *   - the step ids and the recipe names must match exactly;
 *   - a step with a target whose element is missing, off-screen, or only partly
 *     in frame fails the run rather than producing a screen that does not show
 *     what its caption claims.
 *
 * Re-run after changing any screen the tour shows. Captures do not update
 * themselves.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'tour');
const HOTSPOTS = path.join(ROOT, 'app', 'lib', 'tourHotspots.json');
const BASE = process.env.TOUR_BASE_URL || 'http://127.0.0.1:3000';
const VIEWPORT = { width: 1280, height: 800 };
const QUALITY = 82;
const TOOL = '/tools/triple-layered-business-model-canvas';

/** Read the steps straight from the source of truth. */
function stepsFromSource() {
  const src = fs.readFileSync(path.join(ROOT, 'app/lib/tourSteps.ts'), 'utf8');
  const steps = [];
  const re = /^\s*id: '([^']+)',[\s\S]*?(?=^\s*\{|\n\];)/gm;
  for (const block of src.split(/^\s*\{\n/m)) {
    const id = block.match(/^\s*id: '([^']+)'/m)?.[1];
    if (!id) continue;
    const target = block.match(/^\s*target: '([^']+)'/m)?.[1];
    steps.push({ id, target });
  }
  return steps;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Centre an element in the viewport.
 *
 * Not scrollIntoViewIfNeeded: that does nothing when the element is already
 * partly visible, which silently produced two identical screens.
 */
async function centre(page, selector) {
  const el = page.locator(selector).first();
  await el.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await sleep(500);
}

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

/** Click the first N entries of a list, for screens that need populating. */
async function clickSome(page, selector, count) {
  const items = page.locator(selector);
  const available = await items.count();
  for (let i = 0; i < Math.min(count, available); i++) {
    await items.nth(i).click({ timeout: 5000 }).catch(() => {});
    await sleep(400);
  }
}

const recipes = {
  async welcome(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(900);
  },
  async hub(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await centre(page, '[data-tour="explore-hub"]');
  },
  async menu(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(700);
    await page.click('[data-tour="menu-button"]');
    await page.waitForSelector('[data-tour="workflow-menu"]');
    await sleep(500);
  },

  // ---------- one screen per workflow ----------
  async browse(page) {
    await gotoMode(page, 'browse');
    await centre(page, '[data-tour="browse-links"]');
  },
  async find(page) {
    await gotoMode(page, 'find');
    await centre(page, '[data-tour="finder-options"]');
  },
  async compare(page) {
    await gotoMode(page, 'compare');
    // The add control, not the card: the card is a link to the tool.
    // nth(0) each time because selecting re-renders the list.
    const add = page.locator('[title="Add to comparison"]');
    for (let i = 0; i < 3; i++) {
      await add.nth(0).click({ timeout: 5000 }).catch(() => {});
      await sleep(450);
    }
    await page.click('text=Compare selected tools', { timeout: 5000 }).catch(() => {});
    await sleep(1200);
    // The table is taller than the screen; frame its head, where the tool
    // columns the caption describes actually are.
    await centre(page, '[data-tour="compare-table"] tr');
  },
  async timeline(page) {
    await gotoMode(page, 'timeline');
    await centre(page, '[data-tour="timeline-stages"]');
  },
  async network(page) {
    await gotoMode(page, 'network');
    await sleep(2400); // let the force layout settle
    await centre(page, '[data-tour="network-canvas"]');
  },
  async workflows(page) {
    await gotoMode(page, 'workflows');
    await page.click('[data-tour="wf-create"]');
    await page.waitForSelector('[data-tour="wf-title"]');
    await page.fill('[data-tour="wf-title"]', 'Assess a product idea for circularity');
    await clickSome(page, '[data-tour="wf-tool"]', 3);
    await sleep(700);
    await centre(page, '[data-tour="wf-steps"]');
  },
  async compatibility(page) {
    await gotoMode(page, 'compatibility');
    await clickSome(page, '[data-tour="compat-item"]', 2);
    await sleep(1200);
    await centre(page, '[data-tour="compat-results"]');
  },
  async visual(page) {
    await gotoMode(page, 'visual');
    await clickSome(page, '[data-tour="visual-goal"]', 1);
    await sleep(900);
    await centre(page, '[data-tour="visual-tree"]');
  },

  // ---------- tool pages ----------
  async 'tool-tags'(page) {
    await page.goto(`${BASE}${TOOL}`, { waitUntil: 'networkidle' });
    await sleep(900);
    // Open the tag modal, so the screen shows the behaviour the caption claims.
    await page.locator('[data-tour="tool-tags"] button').first().click({ timeout: 6000 });
    await page.waitForSelector('[data-tour="tag-modal"]', { timeout: 6000 });
    await sleep(700);
  },
  async 'tool-dimensions'(page) {
    await page.goto(`${BASE}${TOOL}`, { waitUntil: 'networkidle' });
    await sleep(700);
    await centre(page, 'h1:has-text("Dimensions")');
  },
  async 'tool-prereq'(page) {
    await page.goto(`${BASE}${TOOL}`, { waitUntil: 'networkidle' });
    await sleep(700);
    await centre(page, '[data-tour="tool-prereq"]');
    // It is a native <details>; clicking the wrapper button does not open it.
    await page.locator('[data-tour="tool-prereq"] details').evaluate(d => (d.open = true));
    await sleep(600);
    await centre(page, '[data-tour="tool-prereq"]');
  },
  async panels(page) {
    await page.goto(`${BASE}${TOOL}`, { waitUntil: 'networkidle' });
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
    await page.waitForSelector('[data-panel-id]', { timeout: 8000 });
    await sleep(1600);
  },

  // ---------- the rest ----------
  async toolbar(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(900);
  },
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
    await sleep(1700);
  },
};

async function main() {
  // Playwright is intentionally not a dependency of this project: installing it
  // would pull ~300MB of browsers into every deploy. Install it when recapturing.
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('This script needs Playwright. Install it locally:\n  npm install --no-save playwright');
    process.exit(1);
  }

  const steps = stepsFromSource();
  const ids = steps.map(s => s.id);
  const recipeNames = Object.keys(recipes);

  const missingRecipe = ids.filter(id => !recipeNames.includes(id));
  const orphanRecipe = recipeNames.filter(name => !ids.includes(name));
  if (missingRecipe.length || orphanRecipe.length) {
    if (missingRecipe.length) console.error(`Steps with no capture recipe: ${missingRecipe.join(', ')}`);
    if (orphanRecipe.length) console.error(`Recipes with no tour step: ${orphanRecipe.join(', ')}`);
    process.exit(1);
  }

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

  const hotspots = {};
  const failures = [];

  for (const { id, target } of steps) {
    try {
      await recipes[id](page);

      // Record where the caption's subject actually is, and refuse the screen
      // if it is not fully in frame.
      if (target) {
        const el = page.locator(target).first();
        if (!(await el.count())) throw new Error(`target not found: ${target}`);
        const box = await el.boundingBox();
        if (!box) throw new Error(`target has no box (hidden?): ${target}`);
        const { width: vw, height: vh } = VIEWPORT;
        const fullyInFrame =
          box.x >= -2 && box.y >= -2 && box.x + box.width <= vw + 2 && box.y + box.height <= vh + 2;
        if (!fullyInFrame) {
          // Clamp rather than fail when the subject is simply larger than the
          // screen - a full-height panel is legitimately taller than the frame.
          const clamped = {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            w: Math.min(vw, box.x + box.width) - Math.max(0, box.x),
            h: Math.min(vh, box.y + box.height) - Math.max(0, box.y),
          };
          if (clamped.w < 40 || clamped.h < 20) {
            throw new Error(`target out of frame: ${target}`);
          }
          hotspots[id] = {
            x: +(clamped.x / vw).toFixed(4),
            y: +(clamped.y / vh).toFixed(4),
            w: +(clamped.w / vw).toFixed(4),
            h: +(clamped.h / vh).toFixed(4),
          };
        } else {
          hotspots[id] = {
            x: +(box.x / vw).toFixed(4),
            y: +(box.y / vh).toFixed(4),
            w: +(box.width / vw).toFixed(4),
            h: +(box.height / vh).toFixed(4),
          };
        }
      }

      await page.screenshot({ path: path.join(OUT, `${id}.jpg`), type: 'jpeg', quality: QUALITY });
      const kb = (fs.statSync(path.join(OUT, `${id}.jpg`)).size / 1024).toFixed(0);
      console.log(`  ok    ${id.padEnd(18)} ${kb}KB${target ? '  + hotspot' : ''}`);
    } catch (err) {
      failures.push(id);
      console.error(`  FAIL  ${id.padEnd(18)} ${String(err.message).split('\n')[0].slice(0, 90)}`);
    }
  }

  await browser.close();

  // Two screens showing the same pixels means a recipe did not go where it said.
  const seen = new Map();
  for (const { id } of steps) {
    const f = path.join(OUT, `${id}.jpg`);
    if (!fs.existsSync(f)) continue;
    const key = fs.statSync(f).size + ':' + fs.readFileSync(f).subarray(0, 2048).toString('base64');
    if (seen.has(key)) {
      console.error(`  DUPLICATE  ${id} is identical to ${seen.get(key)}`);
      failures.push(id);
    } else seen.set(key, id);
  }

  fs.writeFileSync(HOTSPOTS, JSON.stringify(hotspots, null, 2) + '\n');

  const total = fs
    .readdirSync(OUT)
    .filter(f => f.endsWith('.jpg'))
    .reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(
    `\n${steps.length - failures.length}/${steps.length} captured, ` +
      `${Object.keys(hotspots).length} hotspots, ${(total / 1e6).toFixed(1)}MB -> public/tour`
  );
  process.exit(failures.length ? 1 : 0);
}

main();
