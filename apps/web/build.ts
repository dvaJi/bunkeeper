import { rmSync } from "node:fs"; // Bun has no recursive-delete API yet
import { join } from "node:path";

const outdir = "./dist";

rmSync(outdir, { recursive: true, force: true });

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

const tailwind = Bun.spawnSync([
  "bunx",
  "@tailwindcss/cli",
  "-i",
  "./src/styles.css",
  "-o",
  "./dist/styles.css",
  "--minify",
]);

if (tailwind.exitCode !== 0) {
  console.error(tailwind.stderr.toString());
  process.exit(1);
}

const indexPath = join(outdir, "index.html");
let indexHtml = await Bun.file(indexPath).text();
indexHtml = indexHtml.replace("</head>", '<link rel="stylesheet" href="./styles.css">\n  </head>');
await Bun.write(indexPath, indexHtml);

await Bun.write(
  join(outdir, "_headers"),
  `/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache
`,
);
console.log(`tailwind styles written to ${outdir}/styles.css`);
