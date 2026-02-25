# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Sustainability Atlas — a Next.js 16 (App Router) website with TypeScript, Tailwind CSS, and shadcn/ui components. Content is stored as Markdown files in `Content/` directories. No external database or Docker required.

### Development commands

See `package.json` scripts and `README.md` for standard commands:

- **Dev server:** `npm run dev` (port 3000)
- **Build:** `npm run build`
- **Type-check:** `npm run type-check`

### Known caveats

- **Lint script is broken:** `npm run lint` calls `next lint`, which was removed in Next.js 16. Use `npm run type-check` for static analysis instead.
- **No lockfile:** The repository has no `package-lock.json`. Dependency versions are resolved from `package.json` ranges on each install.
- **`.npmrc` sets `legacy-peer-deps=true`:** Required for React 19 + some Radix UI peer dependency conflicts. Do not remove.
- **No required env vars for local dev:** `RESEND_API_KEY` and `GITHUB_TOKEN` are optional; the app gracefully falls back without them (console logging for email, local filesystem for survey results).
- **Dark mode rendering:** The app has a known visual issue where toggling dark mode may appear broken in some browser environments. A toast warns about disabling dark reader plugins.
