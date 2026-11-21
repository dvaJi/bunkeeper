import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";

const app = await alchemy("bunkeeper");

const indexHtml = await Bun.file("./dist/index.html").text();

export const docs = await Worker("bunkeeper-docs", {
  name: "bunkeeper-docs",
  assets: {
    directory: "./dist",
    html_handling: "auto-trailing-slash",
    not_found_handling: "none",
  },
  script: `export default {
    async fetch() {
      return new Response(${JSON.stringify(indexHtml)}, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    },
  };`,
  domains: [Bun.env.DOCS_DOMAIN ?? "bunkeeper.aipurrjects.xyz"],
});

console.log(`docs -> ${docs.url}`);

await app.finalize();
