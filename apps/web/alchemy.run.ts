import alchemy from "alchemy";
import { Assets, Worker } from "alchemy/cloudflare";

const app = await alchemy("bunkeeper");

const assets = await Assets({
  path: "./dist",
});

export const docs = await Worker("bunkeeper-docs", {
  name: "bunkeeper-docs",
  bindings: {
    ASSETS: assets,
  },
  assets: {
    html_handling: "auto-trailing-slash",
    not_found_handling: "single-page-application",
  },
  script: `const ASSET_PATH = /\\.[a-z0-9]+$/i;

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    const isHtml = (response.headers.get("content-type") || "").includes("text/html");

    // The shell is never the answer for a missing build artifact: a stale
    // index.html asking for a chunk that no longer exists would otherwise load
    // HTML as a module script and render a blank page.
    const wantsAsset = ASSET_PATH.test(pathname) && !pathname.endsWith(".html");
    if (isHtml && wantsAsset) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (isHtml) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-cache");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};`,
  domains: [Bun.env.DOCS_DOMAIN ?? "bunkeeper.aipurrjects.xyz"],
});

console.log(`docs -> ${docs.url}`);

await app.finalize();
