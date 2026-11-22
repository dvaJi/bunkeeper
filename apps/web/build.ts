import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const outdir = "./dist";

try {
  for (const entry of readdirSync(outdir)) {
    rmSync(join(outdir, entry), { recursive: true, force: true });
  }
} catch {
  // first build, nothing to clean
}

const result = await Bun.build({
  entrypoints: ["./index.html"],
  outdir,
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log(`built ${result.outputs.length} files to ${outdir}`);
