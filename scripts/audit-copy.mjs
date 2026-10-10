#!/usr/bin/env node
/**
 * Audit the interface copy against the writing rules in CLAUDE.md.
 *
 *   node scripts/audit-copy.mjs
 *
 * Reports em dashes against budget, flags each tier of word to avoid, and
 * lists "rather than" constructions for a human to judge. It reads only the
 * files holding copy we author; the markdown in Content/ belongs to the
 * maintainer and is never audited here.
 *
 * Not a gate. A second pair of eyes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Files holding copy we authored (not markdown-derived content).
const FILES = [
  'app/page.tsx',
  'app/components/ExploreSection.tsx',
  'app/components/MostViewedTools.tsx',
  'app/components/TimelineView.tsx',
  'app/components/WorkflowBuilder.tsx',
  'app/components/ToolCompatibilityChecker.tsx',
  'app/components/VisualToolSelector.tsx',
  'app/components/ToolFinder.tsx',
  'app/components/ChatBot.tsx',
  'app/lib/tourSteps.ts',
];

// Pull out prose: JSX text nodes and quoted strings of sentence length.
function prose(src) {
  const out = [];
  // single-quoted strings in TS (tour bodies, menu descriptions)
  for (const m of src.matchAll(/'([^'\\]{25,400})'/g)) out.push(m[1]);
  // JSX text lines
  for (const line of src.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;
    if (/^[A-Z][a-z].{20,}/.test(t) && !t.includes('<') && !t.includes('=') && !t.includes('{')) {
      out.push(t);
    }
  }
  return out;
}

let all = [];
for (const f of FILES) {
  const src = fs.readFileSync(`${ROOT}/${f}`, 'utf8');
  for (const p of prose(src)) all.push({ file: f, text: p });
}

const corpus = all.map(a => a.text).join(' ');
const words = corpus.split(/\s+/).filter(Boolean).length;

const TIER_1A = ['delve', 'tapestry', 'landscape', 'realm', 'paradigm', 'robust',
  'comprehensive', 'seamless', 'pivotal', 'leverage', 'game-changer', 'synergy'];
const TIER_1B = ['utilize', 'commence', 'ascertain', 'endeavor', 'in order to', 'serves as'];
const TIER_2 = ['harness', 'foster', 'empower', 'streamline', 'facilitate',
  'crucial', 'nuanced', 'ecosystem'];
const TIER_3 = ['significant', 'innovative', 'effective', 'dynamic', 'scalable',
  'compelling', 'sophisticated'];

const hits = (list) => list
  .map(w => [w, (corpus.toLowerCase().match(new RegExp(`\\b${w}\\b`, 'g')) || []).length])
  .filter(([, n]) => n > 0);

console.log(`interface copy: ${words} words across ${all.length} fragments\n`);

const em = (corpus.match(/—/g) || []).length;
console.log(`em dashes: ${em}  (budget at 1 per 1,000 words: ${(words / 1000).toFixed(1)})`);
console.log(`  ${em > words / 1000 ? 'OVER BUDGET' : 'within budget'}\n`);

for (const [label, list] of [['Tier 1A (always replace)', TIER_1A],
                             ['Tier 1B (clarity edit)', TIER_1B],
                             ['Tier 2 (flag if 2+ per para)', TIER_2],
                             ['Tier 3 (flag at density)', TIER_3]]) {
  const h = hits(list);
  console.log(`${label}: ${h.length ? h.map(([w, n]) => `${w} x${n}`).join(', ') : 'none'}`);
}

// "not X, but Y" / "rather than" constructions
console.log('\n"X rather than Y" / "not X, Y" constructions:');
all.forEach(({ file, text }) => {
  if (/\brather than\b|\bnot (a|an|the|just|only)\b.*\b(but|it is)\b|’s not .*,? it’s/i.test(text)) {
    console.log(`  ${file}: ${text.slice(0, 95)}...`);
  }
});

// em dash locations
console.log('\nem dash locations:');
all.forEach(({ file, text }) => {
  if (text.includes('—')) console.log(`  ${file}: ${text.slice(0, 95)}...`);
});
