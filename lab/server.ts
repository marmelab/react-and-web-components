import fs from "node:fs";
import express from "express";
import { createServer as createViteServer } from "vite";

const app = express();
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

app.use(async (req, res) => {
  try {
    let template = fs.readFileSync("index.html", "utf-8");
    template = await vite.transformIndexHtml(req.originalUrl, template);
    const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
    const { html, ssrLog } = render(req.originalUrl) as {
      html: string;
      ssrLog: string[];
    };
    res
      .status(200)
      .set({ "Content-Type": "text/html" })
      .end(
        template
          .replace("<!--ssr-outlet-->", html)
          .replace(
            "<!--ssr-log-->",
            `<script>window.__SSR_LOG__=${JSON.stringify(ssrLog)}</script>`,
          ),
      );
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    res.status(500).end(`<pre>${(e as Error).stack}</pre>`);
  }
});

app.listen(5199, () => console.log("SSR lab: http://localhost:5199"));
