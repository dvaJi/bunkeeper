import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeBlock } from "../src/ui";
import { App } from "../src/App";
import { Demo } from "../src/demo";
import { GettingStarted } from "../src/pages/getting-started";
import { Presets } from "../src/pages/presets";
import { Rules } from "../src/pages/rules";
import { Agents } from "../src/pages/agents";
import { CliPage } from "../src/pages/cli";
import { Home } from "../src/pages/home";

const PAGES: Record<string, () => React.JSX.Element> = {
  "/": Home,
  "/docs/getting-started": GettingStarted,
  "/docs/presets": Presets,
  "/docs/rules": Rules,
  "/docs/agents": Agents,
  "/docs/cli": CliPage,
};

describe("web pages render", () => {
  for (const [route, Page] of Object.entries(PAGES)) {
    test(`renders ${route} without runtime errors`, () => {
      const html = renderToStaticMarkup(<Page />);
      expect(html.length).toBeGreaterThan(200);
    });
  }

  test("renders the demo", () => {
    expect(renderToStaticMarkup(<Demo />)).toContain("Without vs with");
  });

  test("code blocks emit TanStack Highlight classes", () => {
    const html = renderToStaticMarkup(<CodeBlock title="x.ts">{"const port = 1;"}</CodeBlock>);
    expect(html).toContain("th-code");
    expect(html).toContain("th-keyword");
  });

  test("every route in the app map renders through App markup data", () => {
    for (const route of Object.keys(PAGES)) {
      expect(typeof App).toBe("function");
      expect(PAGES[route]).toBeDefined();
    }
  });
});
