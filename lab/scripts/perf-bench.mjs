// Scripted /perf benchmark. Builds the four production
// variants (plain / compiler / profiling / profiling + compiler), serves each
// with `vite preview`, starts the dev server with the compiler off and on, and
// runs the suite in headless Chrome and Firefox: N = 1000, 2 warm-up runs, then
// the median of 10 measured runs per cell. `--passes k` repeats the whole
// matrix and reports the median of the k pass medians, with their spread.
//
// From lab/: node scripts/perf-bench.mjs [--passes 3] [--no-build] [config...]
// Playwright isn't a lab dependency: set PLAYWRIGHT to a Playwright package
// path if `playwright` can't be resolved. Chrome is the system install
// (channel "chrome"), Firefox is Playwright's. Builds and results.json go to
// dist/bench/.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pw = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT || "playwright",
);
const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(LAB, "dist/bench");
const vite = path.join(LAB, "node_modules/.bin/vite");
const N = 1000;
const WARMUP = 2;
const RUNS = 10;

const configs = [
  { name: "prod", build: { COMPILER: "off", PROFILE: "off" } },
  { name: "prod-compiler", build: { COMPILER: "on", PROFILE: "off" } },
  { name: "profiling", build: { COMPILER: "off", PROFILE: "on" } },
  { name: "profiling-compiler", build: { COMPILER: "on", PROFILE: "on" } },
  { name: "dev", dev: { COMPILER: "off" } },
  { name: "dev-compiler", dev: { COMPILER: "on" } },
];
const browsers = {
  chrome: () => pw.chromium.launch({ channel: "chrome" }),
  // Unrounded timer, so Firefox's performance.now() isn't whole milliseconds.
  firefox: () =>
    pw.firefox.launch({
      firefoxUserPrefs: { "privacy.reduceTimerPrecision": false },
    }),
};
const scenarios = [
  "mount",
  "update storm",
  "update 1 of N",
  "re-render, nothing changed",
  "unmount",
];

const args = process.argv.slice(2);
const passesFlag = args.indexOf("--passes");
const passes = passesFlag === -1 ? 1 : Number(args.splice(passesFlag, 2)[1]);
const noBuild = args.includes("--no-build");
const only = args.filter((a) => !a.startsWith("--"));
const selected = configs.filter((c) => !only.length || only.includes(c.name));

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const waitPort = (port) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + 30000;
    const attempt = () => {
      const socket = net.connect(port, "127.0.0.1");
      socket.on("connect", () => (socket.end(), resolve()));
      socket.on("error", () =>
        Date.now() > deadline
          ? reject(new Error(`port ${port} never opened`))
          : setTimeout(attempt, 200),
      );
    };
    attempt();
  });

async function startServer(cfg, port) {
  const listen = [
    "--port",
    String(port),
    "--strictPort",
    "--host",
    "127.0.0.1",
  ];
  const server = cfg.build
    ? spawn(
        vite,
        ["preview", "--outDir", path.join(OUT, cfg.name), ...listen],
        {
          cwd: LAB,
          stdio: "ignore",
        },
      )
    : spawn(vite, listen, {
        cwd: LAB,
        env: { ...process.env, ...cfg.dev },
        stdio: "ignore",
      });
  await waitPort(port);
  return server;
}

// One mode in a fresh context: 2 + 10 suite runs, then the median per scenario.
async function runMode(browser, base, mode) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/perf`, { waitUntil: "networkidle" });
  const runSuite = page.getByRole("button", { name: "run suite" });
  await runSuite.waitFor();
  await page.locator("select").nth(0).selectOption(mode);
  await page.locator("select").nth(1).selectOption(String(N));
  const build = await page.locator("li strong").last().textContent();
  for (let i = 0; i < WARMUP + RUNS; i++) {
    await runSuite.click();
    await page.waitForFunction(
      (rows) =>
        document.querySelectorAll("tbody tr").length >= rows &&
        ![...document.querySelectorAll("button")].find(
          (b) => b.textContent === "run suite",
        ).disabled,
      scenarios.length * (i + 1),
      { timeout: 60000 },
    );
  }
  // The page's results table is the only output (values rounded to 0.1 ms).
  const rows = await page.$$eval("tbody tr", (trs) =>
    trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent)),
  );
  await context.close();
  const samples = {};
  for (const [scenario, , , wall, prof] of rows.slice(
    WARMUP * scenarios.length,
  )) {
    samples[scenario] ??= { wall: [], prof: [] };
    samples[scenario].wall.push(Number(wall));
    if (prof !== "n/a") samples[scenario].prof.push(Number(prof));
  }
  const result = {};
  for (const [scenario, { wall, prof }] of Object.entries(samples)) {
    result[scenario] = {
      wall: median(wall),
      prof: prof.length ? median(prof) : null,
    };
  }
  return { build, result, errors };
}

if (!noBuild) {
  for (const cfg of selected.filter((c) => c.build)) {
    console.error(`building ${cfg.name}…`);
    execFileSync(
      vite,
      [
        "build",
        "--outDir",
        path.join(OUT, cfg.name),
        "--emptyOutDir",
        "--logLevel",
        "warn",
      ],
      { cwd: LAB, env: { ...process.env, ...cfg.build }, stdio: "inherit" },
    );
  }
}

const out = {
  meta: {
    date: new Date().toISOString(),
    N,
    warmup: WARMUP,
    runs: RUNS,
    browsers: {},
  },
  passes: [],
};
for (let p = 0; p < passes; p++) {
  const pass = {};
  let port = 4301;
  for (const cfg of selected) {
    const server = await startServer(cfg, port);
    try {
      for (const [name, launch] of Object.entries(browsers)) {
        const browser = await launch();
        out.meta.browsers[name] = browser.version();
        for (const mode of ["react", "wc"]) {
          const r = await runMode(browser, `http://127.0.0.1:${port}`, mode);
          ((pass[cfg.name] ??= {})[name] ??= {})[mode] = r;
          console.error(
            `pass ${p + 1}/${passes} ${cfg.name} ${name} ${mode} [${r.build}] ` +
              scenarios
                .map((s) => `${s}=${r.result[s].wall.toFixed(1)}`)
                .join(" ") +
              (r.errors.length ? ` ERRORS: ${r.errors.join(" | ")}` : ""),
          );
        }
        await browser.close();
      }
    } finally {
      server.kill();
      port++;
    }
  }
  out.passes.push(pass);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(out, null, 2));

// Markdown tables: median of pass medians (spread).
const cell = (cfg, browser, mode, scenario, key) => {
  const vals = out.passes
    .map((p) => p[cfg]?.[browser]?.[mode]?.result[scenario]?.[key])
    .filter((v) => v != null);
  if (!vals.length) return "–";
  const spread =
    vals.length > 1
      ? ` (${Math.min(...vals).toFixed(1)}–${Math.max(...vals).toFixed(1)})`
      : "";
  return median(vals).toFixed(1) + spread;
};
const table = (title, columns, key) => {
  console.log(`\n${title}\n`);
  console.log(`| scenario | ${columns.map((c) => c.label).join(" | ")} |`);
  console.log(`|---|${columns.map(() => "---:").join("|")}|`);
  for (const s of scenarios) {
    console.log(
      `| ${s} | ${columns.map((c) => cell(c.cfg, c.browser, c.mode, s, key)).join(" | ")} |`,
    );
  }
};
console.log(
  `${passes} pass(es), ${JSON.stringify(out.meta.browsers)}, N = ${N}`,
);
for (const browser of Object.keys(browsers)) {
  table(
    `${browser}, flushSync wall ms`,
    [
      ["React prod", "prod", "react"],
      ["React prod + compiler", "prod-compiler", "react"],
      ["WC prod", "prod", "wc"],
      ["WC prod + compiler", "prod-compiler", "wc"],
      ["React dev", "dev", "react"],
      ["WC dev", "dev", "wc"],
      ["React dev + compiler", "dev-compiler", "react"],
      ["WC dev + compiler", "dev-compiler", "wc"],
    ].map(([label, cfg, mode]) => ({ label, cfg, mode, browser })),
    "wall",
  );
}
table(
  "Profiler actualDuration ms, profiling builds",
  Object.keys(browsers).flatMap((browser) =>
    [
      ["React", "profiling", "react"],
      ["React + compiler", "profiling-compiler", "react"],
      ["WC", "profiling", "wc"],
      ["WC + compiler", "profiling-compiler", "wc"],
    ].map(([label, cfg, mode]) => ({
      label: `${browser} ${label}`,
      cfg,
      mode,
      browser,
    })),
  ),
  "prof",
);
