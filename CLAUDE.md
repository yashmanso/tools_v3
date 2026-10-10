# CLAUDE.md

Working notes for the Sustainability Atlas. Read before changing interface copy
or the guided tour.

## What is authored where

Two kinds of text live in this repo, and they are not edited the same way.

**Content** comes from the markdown in `Content/`. Tool, collection, and article
pages render those files. That writing belongs to the maintainer. Do not rewrite
it, reword it, or correct it as part of an interface change. If something reads
oddly on a tool page, the fix is in the markdown file, and it is the
maintainer's call.

**Interface copy** is written in the components: the home page, the nine
workflow descriptions, headings, empty states, button labels, the assistant's
replies, and the tour captions in `app/lib/tourSteps.ts`. That text is ours to
improve, and the rules below apply to it.

## Writing rules

Derived from the maintainer's own writing in `Content/`, and from the
avoid-ai-writing guidance the maintainer asked us to follow.

### Mechanics

- **American spelling.** The content uses *organized*, *analyze*, *visualize*.
  Do not introduce *centre*, *neighbours*, *organised*, *behaviour*. The one
  exception is the assistant's synonym list in `app/lib/chatFacets.ts`, which
  deliberately accepts British spellings because it matches what a visitor
  types, not what the site displays.
- **Oxford comma.** The content uses it in roughly five of every six serial
  lists. Write "titles, descriptions, and tags".
- **No contractions.** There are none in the content markdown. Write "do not",
  "you will", "it is".
- **Sentence case for headings.** "Check compatibility", not "Tool
  Compatibility Checker". Title Case headings read as generated.
- **Em dashes are rationed** to about one per thousand words of interface copy.
  The whole interface is around 3,700 words, so that is three or four in total.
  Prefer a colon, a period, or parentheses. Run the audit below before
  assuming there is room.

### Words to avoid

Always replace: *delve, tapestry, landscape, realm, paradigm, robust,
comprehensive, seamless, pivotal, leverage* (as a verb), *game-changer,
synergy*.

Rewrite for clarity: *utilize, commence, ascertain, endeavor, in order to,
serves as*, and *features* used as a verb.

Flag when two or more land in one paragraph: *harness, foster, empower,
streamline, facilitate, crucial, nuanced, ecosystem*.

Flag at high density: *significant, innovative, effective, dynamic, scalable,
compelling, sophisticated*.

### Constructions to avoid

- **"It is not X, it is Y."** Including the split-sentence version. Say the
  thing directly.
- **Vague endorsement.** "Perfect for choosing the right tool", "discover
  unexpected connections", "comprehensive collection". These fit any feature,
  which means they describe none.
- **Hedge stacks.** "May be useful if", "could potentially", "can help to".
- **Template phrases** with a slot anything could fill: "a [adjective] step
  forward".
- **Triads for rhythm.** Vary the grouping instead of reaching for three.
- **Uniform sentence length.** Mix short and long.

### What good copy does here

Say what the thing does and when to use it, in a sentence that could only
describe that thing. Prefer the concrete claim over the category:

- Not "Look at tools side by side across key dimensions"
- But "Up to three tools become columns and the dimensions become rows"

State real numbers where they help, and compute them from the content rather
than typing them in, so they cannot go stale. `app/page.tsx` counts resources
by category for this reason.

### One description per thing

A workflow is described in three places: the menu entry in `ExploreSection`,
the card on the hub, and the heading inside the workflow itself. They must
agree, and the heading must match the label that was clicked to reach it.
Changing one means changing all three.

## The guided tour

`app/lib/tourSteps.ts` holds the steps. `scripts/capture-tour.mjs` holds one
recipe per step and the screens live in `public/tour/`.

- **Captures do not update themselves.** After changing any screen the tour
  shows, including a heading or a card's text, run `npm run tour:shots` against
  a built site and commit the new images and `app/lib/tourHotspots.json`.
- The script refuses to run if the step ids and the recipe names disagree, and
  fails if a step's target is not in frame or if two screens come out
  identical. Those guards exist because two identical screens shipped once.
- Playwright is deliberately not a dependency. Install it when recapturing:
  `npm install --no-save playwright`.
- One screen per feature. A workflow gets one screen with its steps described
  in the caption, not a screen per step.

## Checking copy before committing

The audit script reports em dash count against budget, flags every tier of
word, and lists "rather than" constructions:

```
node scripts/audit-copy.mjs
```

Run it after any copy change. It is not a gate, it is a second pair of eyes.

## Verifying changes

Browser checks beat assumptions. Several bugs in this repo passed a build and a
type check and were only caught by driving the page: a search input hidden
behind `hidden xl:block`, a tour card positioned off-screen, two identical
captures. When a change is visible, look at it.

For UI work: `npm run build && npm start`, then drive it with Playwright at
desktop and phone widths. Check that each screen shows what its caption claims,
not merely that it loaded.

## Git

Work on `main` unless told otherwise. Do not commit `package-lock.json`; the
repo has never tracked one, and adding it switches Vercel from `npm install` to
`npm ci`. `data/view-counts.json` is written by a GitHub Action and by the local
dev server; discard local changes to it rather than committing them.
