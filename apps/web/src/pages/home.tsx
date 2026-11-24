import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Package,
  Repeat2,
  SlidersHorizontal,
  Stethoscope,
  Wheat,
} from "lucide-react";
import { Terminal, Table } from "../ui";
import { Demo } from "../demo";
import { ButtonLink } from "../components/forme/button/button";
import { GitHubIcon } from "../icons";

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Ultracite for the Bun toolchain</p>
          <h1 className="hero-title">The zero-config lint and format preset for Bun</h1>
          <p className="hero-sub">
            One command wires up <code>bun lint</code>, <code>bun fmt</code> and bun-native API
            rules. No ESLint, no Prettier, no oxlint, no Biome, no config to learn. Bun is the
            toolchain — bunkeeper makes it strict.
          </p>
          <div className="hero-actions">
            <ButtonLink size="large" trailingIcon={ArrowRight} href="#/docs/getting-started">
              Get started
            </ButtonLink>
            <ButtonLink
              size="large"
              variant="secondary"
              leadingIcon={GitHubIcon}
              trailingIcon={ArrowUpRight}
              href="https://github.com/dvaJi/bunkeeper"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </ButtonLink>
          </div>
        </div>
        <div className="hero-visual">
          <Terminal>{`bunx bunkeeper init

✓ bun 1.4.6-canary has bun lint
✓ installed bunkeeper as a devDependency
✓ created .oxlintrc.json extending the bunkeeper preset
✓ created bunfig.toml with bunkeeper fmt and lint config
✓ added scripts: lint, lint:fix, fmt, fmt:check, check
✓ created .github/workflows/check.yml (bun canary + fmt, lint, test)
✓ created AGENTS.md with the bunkeeper section`}</Terminal>
        </div>
      </section>

      <Demo />

      <section className="features">
        <Feature
          icon={SlidersHorizontal}
          title="Zero-config by design"
          body="Curated categories and rules tuned for modern TypeScript. Works out of the box, and every part is overridable in files you already own."
        />
        <Feature
          icon={Wheat}
          title="Bun-native API rules"
          body="Six custom rules keep code honest about its runtime: Bun.file over node:fs, Bun.env over process.env, no dotenv, global fetch, Bun.sleep."
        />
        <Feature
          icon={Bot}
          title="Agentic loop"
          body="Rule messages say what to do instead, CI fails on warnings, and init writes an AGENTS.md section so models fix what they trip."
        />
        <Feature
          icon={Package}
          title="Zero dependencies"
          body="The preset adds no lint or format package. If Bun ships a rule natively, you get it on upgrade — no package bump."
        />
        <Feature
          icon={Repeat2}
          title="Re-runnable"
          body="init is idempotent: marked blocks are replaced, never duplicated. Your configs are merged, never clobbered."
        />
        <Feature
          icon={Stethoscope}
          title="Doctor included"
          body="bunkeeper doctor reports exactly what your bun build supports — fmt, check, lint — and how to fix the gaps."
        />
      </section>

      <section className="section">
        <h2>Which bun do you need?</h2>
        <Table
          head={["Bun", "fmt", "check", "lint"]}
          rows={[
            ["≥ 1.4.4 stable", "✓", "✓", "—"],
            ["≥ 1.4.6 canary", "✓", "✓", "✓"],
          ]}
        />
        <p className="dim small">
          <code>bun lint</code> is canary-only right now: <code>bun upgrade --canary</code> to get
          everything today. bunkeeper degrades gracefully on stable — fmt, scripts, CI and agent
          files are wired either way.
        </p>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
}) {
  return (
    <div className="feature">
      <span className="feature-icon">
        <Icon className="size-[18px]" strokeWidth={1.5} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}
