import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// COMPILER=on turns on the native (Rust) React Compiler from
// `oxc-transform-react`, built into @vitejs/plugin-react since 6.1.0
// (experimental). The classic `react({ babel: { plugins: [...] } })` recipe
// does nothing on plugin-react 6, silently (FINDINGS §6.1).
const compilerOn = process.env.COMPILER === "on";
// PROFILE=on swaps in React's profiling build, so <Profiler onRender> still
// fires in a production build (/perf uses it).
const profiling = process.env.PROFILE === "on";

export default defineConfig({
  plugins: [react({ compiler: compilerOn })],
  resolve: {
    alias: profiling
      ? [{ find: /^react-dom\/client$/, replacement: "react-dom/profiling" }]
      : [],
  },
  define: {
    __COMPILER_ON__: JSON.stringify(compilerOn),
    __PROFILING__: JSON.stringify(profiling),
  },
});
