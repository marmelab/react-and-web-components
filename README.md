# React 19 + Web Components

An investigation lab that probes how React 19 handles web components:
lifecycle, prop/attribute/event passing, stability under re-renders, nesting,
performance, React Compiler interaction and SSR. Built for a Marmelab hackday
(2026-07-24). The write-ups (findings, summary, blog draft, spec and plan)
are kept out of version control, in a gitignored `notes/` folder.

## Prerequisites

- Node >= 24 (`pnpm dev:ssr` runs the TypeScript server entry directly through
  Node's built-in type stripping, with no separate build/transpile step)
- pnpm

## Run it

- `pnpm install`
- `pnpm dev` → SPA lab at http://localhost:5173 (one route per experiment)
- `COMPILER=on pnpm dev` → same, with the native React Compiler
  (`oxc-transform-react`); check the header badge
- `pnpm --filter lab build && pnpm --filter lab preview` → production build
  on http://localhost:4173, for benchmarking `/perf` (prefix the build with
  `COMPILER=on` and/or `PROFILE=on`, the latter to keep the Profiler column)
- `node lab/scripts/perf-bench.mjs --passes 3` → the whole `/perf` matrix
  (production, profiling and dev builds, compiler off and on) in headless
  Chrome and Firefox, printed as Markdown tables. Playwright isn't a lab
  dependency: point `PLAYWRIGHT` at its package if it isn't resolvable
- `pnpm dev:ssr` → SSR server at http://localhost:5199 (experiment 7)
- `pnpm --filter corp-components build && pnpm --filter consumers dev` →
  enterprise demo at http://localhost:5273 (the build step is required
  because `dist/` is gitignored)
