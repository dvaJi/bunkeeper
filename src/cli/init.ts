import {
  readJsonIfExists,
  readTextIfExists,
  readPackageJson,
  c,
  ok,
  warn,
  fail,
  info,
  parseBunVersion,
  bunSupportsLint,
  bunVersionString,
  spawnBun,
} from "./util.ts";

const PRESET_PACKAGE = "bunkeeper";
const BLOCK_START = "# bunkeeper:start";
const BLOCK_END = "# bunkeeper:end";

type InitOptions = {
  yes: boolean;
  strict: boolean;
  typeAware: boolean;
  skipInstall: boolean;
};

function presetConfigPath(strict: boolean) {
  return `./node_modules/${PRESET_PACKAGE}/configs/${strict ? "strict" : "recommended"}.json`;
}

function bunkeeperBlock(options: InitOptions) {
  const rules = [
    '"bunkeeper/no-dotenv" = "error"',
    '"bunkeeper/no-process-env" = "warn"',
    '"bunkeeper/prefer-bun-file" = "warn"',
    '"bunkeeper/prefer-bun-write" = "warn"',
    '"bunkeeper/no-node-fetch" = "warn"',
    '"bunkeeper/prefer-bun-sleep" = "warn"',
  ].join("\n");
  return [
    BLOCK_START,
    "[fmt]",
    "printWidth = 100",
    "",
    "[lint]",
    `plugins = ["./node_modules/${PRESET_PACKAGE}/plugin/index.js"]`,
    options.typeAware ? "typeAware = true" : null,
    "",
    "[lint.rules]",
    rules,
    BLOCK_END,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function hasBunkeeperExtend(config: Record<string, any> | null) {
  const extendsList = Array.isArray(config?.extends)
    ? config.extends
    : config?.extends
      ? [config.extends]
      : [];
  return extendsList.some(
    (entry: string) => typeof entry === "string" && entry.includes(`${PRESET_PACKAGE}/configs/`),
  );
}

async function writeOxlintConfig(options: InitOptions) {
  const existing = await readJsonIfExists<
    Record<string, any> & { extends?: unknown; rules?: unknown }
  >(".oxlintrc.json");
  if (existing && hasBunkeeperExtend(existing)) {
    warn(".oxlintrc.json already extends bunkeeper, leaving it as is");
    return;
  }
  if (existing) {
    const currentExtends = Array.isArray(existing.extends)
      ? existing.extends
      : existing.extends
        ? [existing.extends]
        : [];
    const next = { ...existing, extends: [presetConfigPath(options.strict), ...currentExtends] };
    await Bun.write(".oxlintrc.json", `${JSON.stringify(next, null, 2)}\n`);
    ok("merged bunkeeper preset into existing .oxlintrc.json");
    return;
  }
  await Bun.write(
    ".oxlintrc.json",
    `${JSON.stringify({ extends: [presetConfigPath(options.strict)] }, null, 2)}\n`,
  );
  ok("created .oxlintrc.json extending the bunkeeper preset");
}

function hasLintOrFmtSection(bunfig: string) {
  return /^\[(fmt|lint)([.\][^\]]*)?\]/m.test(bunfig);
}

async function writeBunfig(options: InitOptions) {
  const existing = await readTextIfExists("bunfig.toml");
  const block = bunkeeperBlock(options);

  if (existing === null) {
    await Bun.write("bunfig.toml", `${block}\n`);
    ok("created bunfig.toml with bunkeeper fmt and lint config");
    return;
  }

  const start = existing.indexOf(BLOCK_START);
  const end = existing.indexOf(BLOCK_END);
  if (start !== -1 && end !== -1) {
    const next = `${existing.slice(0, start)}${block}${existing.slice(end + BLOCK_END.length)}`;
    await Bun.write("bunfig.toml", next);
    ok("replaced the bunkeeper block in bunfig.toml");
    return;
  }

  if (hasLintOrFmtSection(existing)) {
    warn("bunfig.toml already has [fmt] or [lint] sections, skipping automatic merge");
    info(
      "add this to bunfig.toml by hand:\n\n" +
        block
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n"),
    );
    return;
  }

  await Bun.write("bunfig.toml", `${existing.trimEnd()}\n\n${block}\n`);
  ok("appended the bunkeeper block to bunfig.toml");
}

const WANTED_SCRIPTS: Record<string, string> = {
  lint: "bun lint --no-script",
  "lint:fix": "bun lint --fix --no-script",
  fmt: "bun fmt",
  "fmt:check": "bun fmt --check",
  check: "bun fmt --check && bun lint --no-script",
};

async function writePackageJsonScripts() {
  const pkg = await readJsonIfExists<Record<string, any>>("package.json");
  if (!pkg) {
    fail("package.json not found, run this from a project root");
    process.exit(1);
  }
  pkg.scripts = pkg.scripts ?? {};
  const added: string[] = [];
  for (const [name, command] of Object.entries(WANTED_SCRIPTS)) {
    if (pkg.scripts[name] === undefined) {
      pkg.scripts[name] = command;
      added.push(name);
    }
  }
  if (added.length > 0) {
    await Bun.write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
    ok(`added scripts: ${added.join(", ")}`);
  } else {
    info("package.json scripts already in place");
  }
}

async function installSelf() {
  const pkg = await readJsonIfExists<Record<string, any>>("package.json");
  const version = pkg?.devDependencies?.[PRESET_PACKAGE];
  if (typeof version === "string" && version.length > 0) {
    info(`${PRESET_PACKAGE} already in devDependencies (${version})`);
    return;
  }
  const result = spawnBun(["add", "-d", PRESET_PACKAGE]);
  if (result.exitCode === 0) {
    ok(`installed ${PRESET_PACKAGE} as a devDependency`);
  } else {
    warn(
      `bun add -d ${PRESET_PACKAGE} failed (${result.stderr.toString().split("\n")[0]}), add it manually`,
    );
  }
}

async function writeCi() {
  const template = await Bun.file(new URL("../../templates/ci.yml", import.meta.url)).text();
  const target = ".github/workflows/check.yml";
  if (await Bun.file(target).exists()) {
    warn(".github/workflows/check.yml already exists, leaving it alone");
    return;
  }
  await Bun.write(target, template);
  ok("created .github/workflows/check.yml (bun canary + fmt, lint, test)");
}

async function writeAgents() {
  const template = (
    await Bun.file(new URL("../../templates/agents.md", import.meta.url)).text()
  ).trimEnd();
  const existing = await readTextIfExists("AGENTS.md");
  if (existing !== null) {
    if (existing.includes("bunkeeper:start")) {
      info("AGENTS.md already has the bunkeeper section");
      return;
    }
    await Bun.write("AGENTS.md", `${existing.trimEnd()}\n\n${template}\n`);
    ok("appended the bunkeeper section to AGENTS.md");
    return;
  }
  await Bun.write("AGENTS.md", `${template}\n`);
  ok("created AGENTS.md with the bunkeeper section");
}

async function checkBunVersion() {
  const raw = bunVersionString();
  const version = parseBunVersion(raw);
  if (!version) {
    warn(`could not parse bun version "${raw}"`);
    return;
  }
  if (bunSupportsLint(version)) {
    ok(`bun ${version.raw} has bun lint`);
  } else {
    warn(
      `bun ${version.raw} has bun fmt but not bun lint (reverted from stable, back on main since Nov 17)`,
    );
    info("upgrade to canary until the next stable ships it: bun upgrade --canary");
  }
}

export async function init(options: InitOptions) {
  const pkg = await readPackageJson();
  if (!pkg) {
    fail("no package.json here, run bunkeeper init from a project root");
    process.exit(1);
  }
  console.log(`${c.bold}bunkeeper init${c.reset}\n`);
  await checkBunVersion();
  if (!options.skipInstall) await installSelf();
  await writeOxlintConfig(options);
  await writeBunfig(options);
  await writePackageJsonScripts();
  await writeCi();
  await writeAgents();
  console.log(
    `\n${c.green}Done.${c.reset} Run ${c.bold}bun doctor${c.reset} — or ${c.bold}bunx bunkeeper doctor${c.reset} — to verify the setup.`,
  );
}
