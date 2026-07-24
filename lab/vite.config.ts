import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

const compilerOn = process.env.COMPILER === "on";

// NOTE (deviation from the original plan, controller-sanctioned): the brief's
// `react({ babel: { plugins: [["babel-plugin-react-compiler", {}]] } })` recipe
// is the classic, pre-Rolldown `@vitejs/plugin-react` v4 API. The version
// installed here (`@vitejs/plugin-react@6`, paired with Rolldown-based
// `vite@8`) has no `babel` option at all — JSX goes through oxc by default —
// so that recipe silently no-ops (confirmed: no compiler output, no error).
// The plugin's own README documents the actual v6 recipe used below:
// a separate `@rolldown/plugin-babel` plugin running `reactCompilerPreset()`.
export default defineConfig({
  plugins: [
    react(),
    ...(compilerOn ? [babel({ presets: [reactCompilerPreset()] })] : []),
  ],
  define: {
    __COMPILER_ON__: JSON.stringify(compilerOn),
  },
});
