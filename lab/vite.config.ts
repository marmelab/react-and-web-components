import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// COMPILER=on turns on the native (Rust) React Compiler from
// `oxc-transform-react`, built into @vitejs/plugin-react since 6.1.0
// (experimental). The classic `react({ babel: { plugins: [...] } })` recipe
// does nothing on plugin-react 6, silently (FINDINGS §6.1).
const compilerOn = process.env.COMPILER === "on";

export default defineConfig({
  plugins: [react({ compiler: compilerOn })],
  define: {
    __COMPILER_ON__: JSON.stringify(compilerOn),
  },
});
