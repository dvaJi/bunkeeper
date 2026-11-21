export const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

export function ok(message: string) {
  console.log(`${c.green}✓${c.reset} ${message}`);
}

export function warn(message: string) {
  console.log(`${c.yellow}⚠${c.reset} ${message}`);
}

export function fail(message: string) {
  console.log(`${c.red}✗${c.reset} ${message}`);
}

export function info(message: string) {
  console.log(`${c.blue}ℹ${c.reset} ${message}`);
}

export async function readJsonIfExists<T = unknown>(path: string): Promise<T | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  try {
    return (await file.json()) as T;
  } catch {
    return null;
  }
}

export async function readTextIfExists(path: string): Promise<string | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  return file.text();
}

export async function readPackageJson(): Promise<Record<string, any> | null> {
  return readJsonIfExists<Record<string, any>>("package.json");
}

export type BunVersion = {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  canary: boolean;
};

export function parseBunVersion(raw: string): BunVersion | null {
  const match = raw.trim().match(/^(\d+)\.(\d+)\.(\d+)(-canary.*)?$/);
  if (!match) return null;
  return {
    raw: raw.trim(),
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    canary: Boolean(match[4]),
  };
}

export function compareVersions(a: BunVersion, b: BunVersion): number {
  for (const [x, y] of [
    [a.major, b.major],
    [a.minor, b.minor],
    [a.patch, b.patch],
  ]) {
    if (x !== y) return x - y;
  }
  return 0;
}

export function bunSupportsLint(version: BunVersion | null): boolean {
  if (!version) return false;
  if (version.canary) return true;
  return compareVersions(version, { ...version, major: 1, minor: 5, patch: 0 }) >= 0;
}

export function spawnBun(args: string[]) {
  const bin = Bun.env.BUNKEEPER_BUN ?? "bun";
  return Bun.spawnSync([bin, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
}

export function bunVersionString(): string {
  const result = spawnBun(["--version"]);
  return result.stdout.toString().trim();
}
