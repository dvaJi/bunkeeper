import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

beforeAll(() => {
  fixture = mkdtempSync(join(globalThis.tmpdir ?? "/tmp", "bunkeeper-plugin-"));
  mkdirSync(join(fixture, "node_modules"), { recursive: true });
  cpSync(REPO, join(fixture, "node_modules", "bunkeeper"), {
    recursive: true,
    filter: (src) => !src.includes("node_modules") && !src.includes(".git"),
  });
  writeFileSync(
    join(fixture, ".oxlintrc.json"),
    JSON.stringify({ extends: ["./node_modules/bunkeeper/configs/recommended.json"] }, null, 2),
  );
  writeFileSync(
    join(fixture, "bunfig.toml"),
    `[lint]\nplugins = ["./node_modules/bunkeeper/plugin/index.js"]\n\n[lint.rules]\n"bunkeeper/no-dotenv" = "error"\n"bunkeeper/no-process-env" = "warn"\n"bunkeeper/prefer-bun-file" = "warn"\n"bunkeeper/prefer-bun-write" = "warn"\n"bunkeeper/no-node-fetch" = "warn"\n"bunkeeper/prefer-bun-sleep" = "warn"\n`,
  );
  mkdirSync(join(fixture, "src"), { recursive: true });
  writeFileSync(join(fixture, "src", "violations.ts"), VIOLATIONS);
  writeFileSync(join(fixture, "src", "clean.ts"), CLEAN);
});

function lintSupported() {
  return (
    Bun.spawnSync([CANARY, "lint", "--explain", "prefer-const"], { stdout: "pipe", stderr: "pipe" })
      .exitCode === 0
  );
}

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

describe("plugin rules under bun lint", () => {
  const supported = lintSupported();

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
    writeFileSync(
      sleepFile,
      `export async function wait() {\n  await new Promise((resolve) => setTimeout(resolve, 100));\n}\n`,
    );
    bun(["lint", "--fix", "src/sleep.ts"], fixture);
    const after = await Bun.file(sleepFile).text();
    expect(after).toContain("Bun.sleep(100)");
    expect(after).not.toContain("setTimeout");
  });
});
