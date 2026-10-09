# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sustainability Atlas** — a Next.js 16 (App Router) website that reads markdown files from an Obsidian vault layout and presents them as a browsable, searchable web interface. There are three content categories: Tools/Methods/Frameworks, Collections, and Academic Articles.

## Commands

```bash
npm install          # Install dependencies (uses --legacy-peer-deps automatically via .npmrc)
npm run dev          # Development server at http://localhost:8888
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm run type-check   # TypeScript check (tsc --noEmit)
```

There are no tests. Type-checking and lint are the only automated quality gates.

## Architecture

### Content Pipeline

Markdown files live in `/Content/` (not inside `app/`) and are read at request time by server components — there is no build-time static generation. The three published subdirectories are:

```
Content/
  1 – Tools, methods, frameworks, or guides/   → /tools/[slug]
  2 – Collections, Compendia, or Kits/          → /collections/[slug]
  3 – Practical academic articles.../           → /articles/[slug]
```

Directories prefixed with `0 –`, `4 –`, or wrapped in `> … <` are **not published** — `app/lib/markdown.ts` only reads the three numbered directories above.

`app/lib/markdown.ts` is the central content module. It:
- Reads all `.md` files from the three content directories
- Parses YAML frontmatter via `gray-matter`
- Converts Obsidian `[[wiki-links]]` to HTML anchor tags and `![[file]]` embeds to `<iframe>` / `<img>` tags
- Extracts inline `#hashtag` tags from body content (in addition to frontmatter tags)
- Strips leading `#` from hashtags in rendered HTML
- Derives slugs via `app/lib/slugify.ts` (used everywhere — keep slug derivation consistent)
- Returns `ResourceMetadata[]` for list pages and `Resource` (includes `contentHtml` + `attachments[]`) for detail pages

### Routing

| URL pattern | Page file |
|---|---|
| `/` | `app/page.tsx` |
| `/tools` | `app/tools/page.tsx` |
| `/tools/[slug]` | `app/tools/[slug]/page.tsx` |
| `/collections/[slug]` | `app/collections/[slug]/page.tsx` |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/survey` | `app/survey/page.tsx` |
| `/submit-tool` | `app/submit-tool/page.tsx` |

All dynamic pages fetch content directly from the filesystem (server components). There is no database — view counts are persisted to `/data/view-counts.json` by `app/api/view-count/route.ts`.

### API Routes (`app/api/`)

| Route | Purpose |
|---|---|
| `/api/resource` | GET a single resource by slug with related pages |
| `/api/view-count` | GET/POST view counts (file-backed JSON, no DB) |
| `/api/resource-tags` | Tag listing |
| `/api/survey/submit` | Survey form submissions |
| `/api/contact` | Contact form (mailto-based) |
| `/api/tool-submissions` | User-submitted tool storage |
| `/api/auto-create-tool` | AI content generation (OpenAI/Gemini, 5-min timeout) |

### Component Layout

`app/components/` holds all application components (~61 files). Reusable primitive UI (buttons, inputs, cards, etc.) comes from `components/ui/` — these are **shadcn/ui** components backed by Radix UI primitives and should not be edited directly. Use `components.json` when adding new shadcn components.

Key component groups:
- **Filtering/display**: `FilteredPageLayout`, `FilteredResourceList`, `ResourceCard`, `ResourceListItem`, `QuickFiltersSidebar` — compose these for new list/browse views
- **Sliding panels**: `SlidingPanels` + `PanelLink` — used for hover-preview of internal links; context is managed by `PanelProvider` in the root layout
- **Tool-specific UI**: `VisualToolSelector`, `ToolFinder`, `ToolPrerequisites`, `CompareTools`, `WorkflowBuilder` — data-driven from `app/lib/prerequisites-data.ts` and `app/lib/workflows.ts`
- **Network graph**: `NetworkGraph` — builds a relationship graph from `app/lib/graph.ts` using page link co-occurrence

### Styling

Tailwind CSS with a custom CSS-variable-based theme defined in `app/globals.css`. Dark mode is class-based (`next-themes`). Do not hardcode colors — always use the CSS variable tokens (e.g. `bg-background`, `text-foreground`) so both themes work. Custom Tailwind color aliases are configured in `tailwind.config.ts`.

### Attachments

Static files (PDFs, images) referenced as `![[filename.pdf]]` in markdown are served from `public/attachments/`. The markdown parser resolves them to `/attachments/<encoded-filename>`. Attachment files are **not committed** to the repo — they must be copied manually.

### Path Alias

`@/*` resolves to the repo root (configured in `tsconfig.json`). Use `@/app/components/...`, `@/app/lib/...`, etc. for imports.

## Key Conventions

- **Slugs** are always generated through `app/lib/slugify.ts`. Never construct slugs ad-hoc — use the exported `slugify()` function to keep URL generation consistent with content parsing.
- **Category routing** is inferred from the Content subdirectory name in `markdown.ts` (`getCategory()`). When adding a new content category, update that function and add a matching `app/<category>/` route.
- **`(NO PUBLISH)` directories** in `Content/` are intentionally excluded from the site. Do not add them to the markdown reader.
- **Images are unoptimized** (`next.config.ts`: `images.unoptimized: true`) — Next.js Image optimization is disabled site-wide.
- **No static export**: `output: 'export'` is removed from `next.config.ts` so API routes work. Deployment target is Vercel.
