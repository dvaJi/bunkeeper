import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { join } from "node:path";
import { makeTempDir, rmrf } from "../src/cli/util.ts";

const REPO = join(import.meta.dir, "..");
const CANARY = Bun.env.BUNKEEPER_BUN ?? "bun";

setDefaultTimeout(60_000);

function bun(args: string[], cwd: string) {
  return Bun.spawnSync([CANARY, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
}

let fixture: string;

const VIOLATIONS = `import { readFileSync } from "node:fs";
import "dotenv/config";
import fetch from "node-fetch";
import * as fs from "node:fs";

const key = process.env.API_KEY;
if (key == "1") {
  console.log("legacy");
}
const text = readFileSync("a.txt", "utf8");
const raw = await fs.promises.readFile("b.txt");
await fs.promises.writeFile("c.txt", raw);
await new Promise((resolve) => setTimeout(resolve, 250));
`;

const CLEAN = `const name = Bun.env.NAME;
const file = Bun.file("a.txt");
const text = await file.text();
await Bun.write("c.txt", text);
await Bun.sleep(250);
const res = await fetch("https://example.com");
`;

beforeAll(async () => {
  fixture = await makeTempDir("bunkeeper-plugin");
  // copy only the files bun lint reads: the extends target and the plugin
  await Bun.write(
    join(fixture, "node_modules/bunkeeper/configs/recommended.json"),
    Bun.file(join(REPO, "configs", "recommended.json")),
  );
  await Bun.write(
    join(fixture, "node_modules/bunkeeper/configs/strict.json"),
    Bun.file(join(REPO, "configs", "strict.json")),
  );
  await Bun.write(
    join(fixture, "node_modules/bunkeeper/plugin/index.js"),
    Bun.file(join(REPO, "plugin", "index.js")),
  );
  await Bun.write(
    join(fixture, ".oxlintrc.json"),
    JSON.stringify({ extends: ["./node_modules/bunkeeper/configs/recommended.json"] }, null, 2),
  );
  await Bun.write(
    join(fixture, "bunfig.toml"),
    `[lint]\nplugins = ["./node_modules/bunkeeper/plugin/index.js"]\n\n[lint.rules]\n"bunkeeper/no-dotenv" = "error"\n"bunkeeper/no-process-env" = "warn"\n"bunkeeper/prefer-bun-file" = "warn"\n"bunkeeper/prefer-bun-write" = "warn"\n"bunkeeper/no-node-fetch" = "warn"\n"bunkeeper/prefer-bun-sleep" = "warn"\n`,
  );
  await Bun.write(join(fixture, "src", "violations.ts"), VIOLATIONS);
  await Bun.write(join(fixture, "src", "clean.ts"), CLEAN);
});

async function lintSupported() {
  const probeDir = await makeTempDir("bunkeeper-probe");
  try {
    const probe = () =>
      Bun.spawnSync([CANARY, "lint", "--explain", "prefer-const"], {
        cwd: probeDir,
        stdout: "pipe",
        stderr: "pipe",
      });
    let result = probe();
    // retry once on non-zero: transient spawn failures under process storms
    // look identical to "no linter" except for the Script not found signature
    if (result.exitCode !== 0 && !result.stderr.toString().includes("Script not found")) {
      result = probe();
    }
    return result.exitCode === 0;
  } finally {
    rmrf(probeDir);
  }
}

afterAll(() => {
  rmrf(fixture);
});

const supported = await lintSupported();

describe("plugin rules under bun lint", () => {
  if (!supported) {
    return;
  }

  test("flags every bun-native API violation", () => {
    const result = bun(["lint", "src/violations.ts"], fixture);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain("bunkeeper(no-dotenv)");
    expect(output).toContain("bunkeeper(no-process-env)");
    expect(output).toContain("bunkeeper(prefer-bun-file)");
    expect(output).toContain("bunkeeper(prefer-bun-write)");
    expect(output).toContain("bunkeeper(no-node-fetch)");
    expect(output).toContain("bunkeeper(prefer-bun-sleep)");
  });

  test("flags no bunkeeper rules on bun-idiomatic code", () => {
    const result = bun(["lint", "src/clean.ts"], fixture);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).not.toContain("bunkeeper/");
  });

  test("presets ship through oxlint extends", () => {
    const result = bun(["lint", "src/violations.ts"], fixture);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain("eqeqeq");
  });

  test("--fix rewrites the sleep pattern", async () => {
    const sleepFile = join(fixture, "src", "sleep.ts");
    await Bun.write(
      sleepFile,
      `export async function wait() {\n  await new Promise((resolve) => setTimeout(resolve, 100));\n}\n`,
    );
    bun(["lint", "--fix", "src/sleep.ts"], fixture);
    const after = await Bun.file(sleepFile).text();
    expect(after).toContain("Bun.sleep(100)");
    expect(after).not.toContain("setTimeout");
  });
});
