import {
  c,
  ok,
  warn,
  fail,
  info,
  readJsonIfExists,
  readTextIfExists,
  parseBunVersion,
  bunVersionString,
  probeLintSupport,
  spawnBun,
} from "./util.ts";

type Check = { label: string; status: "ok" | "warn" | "fail" | "skip"; detail?: string };

function lintSupported() {
  const result = probeLintSupport();
  const stderr = result.stderr.toString();
  if (result.exitCode === 0) return { supported: true };
  if (stderr.includes("Script not found"))
    return { supported: false, reason: "this bun build predates bun lint" };
  return { supported: false, reason: stderr.split("\n")[0] };
}

function fmtSupported() {
  const result = spawnBun(["fmt", "--help"]);
  return result.exitCode === 0;
}

function checkSupported() {
  const result = spawnBun(["check", "--help"]);
  return result.exitCode === 0;
}

export async function doctor() {
  console.log(`${c.bold}bunkeeper doctor${c.reset}\n`);
  const checks: Check[] = [];

  const rawVersion = bunVersionString();
  const version = parseBunVersion(rawVersion);
  checks.push({
    label: `bun ${version ? version.raw : rawVersion}`,
    status: version ? "ok" : "warn",
    detail: version ? (version.canary ? "canary channel" : "stable channel") : "unparseable",
  });

  const lint = lintSupported();
  checks.push({
    label: "bun lint",
    status: lint.supported ? "ok" : "warn",
    detail: lint.supported
      ? undefined
      : `unavailable — ${lint.reason}. bun fmt still works; upgrade with bun upgrade --canary`,
  });

  checks.push({ label: "bun fmt", status: fmtSupported() ? "ok" : "fail" });
  checks.push({
    label: "bun check",
    status: checkSupported() ? "ok" : "warn",
    detail: "needs bun >= 1.4.3",
  });

  const oxlint = await readJsonIfExists<Record<string, any>>(".oxlintrc.json");
  const extendsList = Array.isArray(oxlint?.extends)
    ? oxlint.extends
    : oxlint?.extends
      ? [oxlint.extends]
      : [];
  const wiredPreset = extendsList.some(
    (entry: unknown) => typeof entry === "string" && entry.includes("bunkeeper/configs/"),
  );
  checks.push({
    label: ".oxlintrc.json extends bunkeeper preset",
    status: wiredPreset ? "ok" : "warn",
    detail: wiredPreset ? undefined : "run bunx bunkeeper init",
  });

  const bunfig = await readTextIfExists("bunfig.toml");
  const wiredPlugin = bunfig?.includes("bunkeeper/plugin/index.js") ?? false;
  checks.push({
    label: "bunfig.toml loads the bunkeeper plugin",
    status: wiredPlugin ? "ok" : "warn",
    detail: wiredPlugin ? undefined : "run bunx bunkeeper init",
  });

  const presetInstalled = await Bun.file(
    "node_modules/bunkeeper/configs/recommended.json",
  ).exists();
  checks.push({
    label: "bunkeeper installed in this project",
    status: presetInstalled ? "ok" : "warn",
    detail: presetInstalled ? undefined : "bun add -d bunkeeper",
  });

  const pkg = await readJsonIfExists<{ scripts?: Record<string, string> }>("package.json");
  const scripts = pkg?.scripts ?? {};
  const lintScriptOk = typeof scripts.lint === "string" && scripts.lint.includes("bun lint");
  const checkScriptOk = typeof scripts.check === "string" && scripts.check.includes("bun lint");
  checks.push({
    label: "package.json scripts wired (lint, check)",
    status: lintScriptOk && checkScriptOk ? "ok" : "warn",
    detail: lintScriptOk && checkScriptOk ? undefined : "run bunx bunkeeper init",
  });

  if (wiredPreset && presetInstalled && lint.supported) {
    const probe = spawnBun(["lint", "--explain", "prefer-const"]);
    if (probe.exitCode !== 0) {
      checks.push({
        label: "preset loads",
        status: "fail",
        detail: probe.stderr.toString().split("\n")[0],
      });
    } else {
      checks.push({ label: "preset loads", status: "ok" });
    }
  }

  let failed = 0;
  let warned = 0;
  for (const check of checks) {
    if (check.status === "ok")
      ok(`${check.label}${check.detail ? ` ${c.dim}— ${check.detail}${c.reset}` : ""}`);
    else if (check.status === "warn") {
      warned += 1;
      warn(`${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
    } else if (check.status === "fail") {
      failed += 1;
      fail(`${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
    } else {
      info(check.label);
    }
  }

  console.log(
    `\n${checks.filter((x) => x.status === "ok").length} ok, ${warned} warning${warned === 1 ? "" : "s"}, ${failed} failure${failed === 1 ? "" : "s"}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}
