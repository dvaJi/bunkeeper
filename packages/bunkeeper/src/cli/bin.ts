#!/usr/bin/env bun
import { init } from "./init.ts";
import { doctor } from "./doctor.ts";

const HELP = `bunkeeper — the zero-config lint and format preset for Bun

Usage
  bunkeeper init [options]   wire the preset into the current project
  bunkeeper doctor           verify the bun toolchain and bunkeeper setup

init options
  --yes, -y          take the defaults, no prompts
  --strict           extend configs/strict.json instead of recommended
  --type-aware       enable bun lint type-aware rules (slower, catches more)
  --skip-install     configure without running bun add
  -h, --help         show this help
  -v, --version      print the bunkeeper version
`;

async function version() {
  const pkg = await Bun.file(new URL("../../package.json", import.meta.url)).json();
  return pkg.version ?? "0.0.0";
}

async function main() {
  const args = process.argv.slice(2);
  const command = args.find((arg) => !arg.startsWith("-"));

  if (args.includes("-v") || args.includes("--version")) {
    console.log(await version());
    return;
  }
  if (!command || command === "help" || args.includes("-h") || args.includes("--help")) {
    console.log(HELP);
    return;
  }

  if (command === "init") {
    await init({
      yes: args.includes("--yes") || args.includes("-y"),
      strict: args.includes("--strict"),
      typeAware: args.includes("--type-aware"),
      skipInstall: args.includes("--skip-install"),
    });
    return;
  }

  if (command === "doctor") {
    await doctor();
    return;
  }

  console.error(`unknown command "${command}". try bunkeeper --help`);
  process.exit(1);
}

await main();
