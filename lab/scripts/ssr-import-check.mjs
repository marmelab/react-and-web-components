// Demonstrates WHY the lab never imports WC modules server-side:
// `class X extends HTMLElement` at module scope crashes in Node even if
// the customElements.define() call is guarded.
console.log("importing src/wc/unguarded-demo.ts in plain Node…");
try {
  await import("../src/wc/unguarded-demo.ts");
  console.log("import succeeded (unexpected!)");
} catch (e) {
  console.log(`import FAILED: ${e.constructor.name}: ${e.message}`);
}
