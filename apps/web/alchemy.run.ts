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
  script: `export default {
    async fetch(request, env) {
      return env.ASSETS.fetch(request);
    },
  };`,
  domains: [Bun.env.DOCS_DOMAIN ?? "bunkeeper.aipurrjects.xyz"],
});

console.log(`docs -> ${docs.url}`);

await app.finalize();
