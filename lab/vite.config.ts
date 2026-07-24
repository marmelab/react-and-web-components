import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const compilerOn = process.env.COMPILER === "on";

export default defineConfig({
  plugins: [
    react(
      compilerOn
        ? { babel: { plugins: [["babel-plugin-react-compiler", {}]] } }
        : {},
    ),
  ],
  define: {
    __COMPILER_ON__: JSON.stringify(compilerOn),
  },
});
