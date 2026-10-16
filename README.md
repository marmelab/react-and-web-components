# React 19 + Web Components

An investigation lab that probes how React 19 handles web components:
lifecycle, prop/attribute/event passing, stability under re-renders, nesting,
performance, React Compiler interaction and SSR. Built for a Marmelab hackday
(2026-07-24); results are in [`FINDINGS.md`](./FINDINGS.md).

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
- `pnpm dev:ssr` → SSR server at http://localhost:5199 (experiment 7)
- `pnpm --filter corp-components build && pnpm --filter consumers dev` →
  enterprise demo at http://localhost:5273 (the build step is required
  because `dist/` is gitignored)

## Pointers

- [`SUMMARY.md`](./SUMMARY.md): the short version, with key findings and
  practical rules
- [`FINDINGS.md`](./FINDINGS.md): full results and evidence, plus how to run
  the pending Firefox pass
- [`docs/superpowers/`](./docs/superpowers/): spec and plan
