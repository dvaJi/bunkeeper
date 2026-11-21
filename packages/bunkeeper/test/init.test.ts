import { afterAll, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..");
const CANARY = Bun.env.BUNKEEPER_BUN ?? "bun";

setDefaultTimeout(60_000);

function bun(args: string[], cwd: string) {
  return Bun.spawnSync([CANARY, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
}

let fixture: string;

beforeAll(() => {
  fixture = mkdtempSync(join(globalThis.tmpdir ?? "/tmp", "bunkeeper-init-"));
  writeFileSync(
    join(fixture, "package.json"),
    `${JSON.stringify({ name: "fixture", version: "1.0.0" }, null, 2)}\n`,
  );
  writeFileSync(join(fixture, "src.ts"), `export const x = 1;\n`);
});

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

describe("bunkeeper init", () => {
  test("wires the preset into a fresh project", async () => {
    const result = bun([join(REPO, "src", "cli", "bin.ts"), "init", "--skip-install"], fixture);
    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain("created .oxlintrc.json");
    expect(output).toContain("created bunfig.toml");
    expect(output).toContain("added scripts");

    const oxlint = JSON.parse(await Bun.file(join(fixture, ".oxlintrc.json")).text());
    expect(oxlint.extends).toContain("./node_modules/bunkeeper/configs/recommended.json");

    const bunfig = await Bun.file(join(fixture, "bunfig.toml")).text();
    expect(bunfig).toContain("# bunkeeper:start");
    expect(bunfig).toContain('plugins = ["./node_modules/bunkeeper/plugin/index.js"]');
    expect(bunfig).toContain('"bunkeeper/no-dotenv" = "error"');

    const pkg = JSON.parse(await Bun.file(join(fixture, "package.json")).text());
    expect(pkg.scripts.lint).toBe("bun lint --no-script");
    expect(pkg.scripts.check).toBe("bun fmt --check && bun lint --no-script");
    expect(pkg.scripts.dev).toBeUndefined();

    const agents = await Bun.file(join(fixture, "AGENTS.md")).text();
    expect(agents).toContain("bunkeeper:start");

    expect(await Bun.file(join(fixture, ".github", "workflows", "check.yml")).text()).toContain(
      "bun lint --no-script --max-warnings 0",
    );
  });

  test("re-running init replaces the block instead of duplicating it", async () => {
    const result = bun([join(REPO, "src", "cli", "bin.ts"), "init", "--skip-install"], fixture);
    expect(result.exitCode).toBe(0);
    const bunfig = await Bun.file(join(fixture, "bunfig.toml")).text();
    expect(bunfig.split("# bunkeeper:start").length - 1).toBe(1);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain("presets already wired in .oxlintrc.json");
  });

  test("init --type-aware writes typeAware", async () => {
    const result = bun(
      [join(REPO, "src", "cli", "bin.ts"), "init", "--skip-install", "--type-aware"],
      fixture,
    );
    expect(result.exitCode).toBe(0);
    expect(await Bun.file(join(fixture, "bunfig.toml")).text()).toContain("typeAware = true");
  });

  test("init --js-plugins landmines extends the landmines config", async () => {
    const result = bun(
      [join(REPO, "src", "cli", "bin.ts"), "init", "--skip-install", "--js-plugins", "landmines"],
      fixture,
    );
    expect(result.exitCode).toBe(0);
    const oxlint = JSON.parse(await Bun.file(join(fixture, ".oxlintrc.json")).text());
    expect(oxlint.extends).toContain(
      "./node_modules/@interfere/landmines/configs/recommended.json",
    );
    expect(
      oxlint.extends.filter((entry: string) => entry.includes("bunkeeper/configs/")).length,
    ).toBe(1);
  });

  test("init --js-plugins with an unknown plugin warns but keeps wiring the rest", async () => {
    const result = bun(
      [join(REPO, "src", "cli", "bin.ts"), "init", "--skip-install", "--js-plugins", "nope"],
      fixture,
    );
    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain('unknown js plugin "nope"');
  });

  test("doctor runs against the wired project", () => {
    const result = bun([join(REPO, "src", "cli", "bin.ts"), "doctor"], fixture);
    const output = result.stdout.toString() + result.stderr.toString();
    expect(output).toContain("bunkeeper doctor");
    expect(output).toContain("bun");
    expect([0, 1]).toContain(result.exitCode);
  });
});
