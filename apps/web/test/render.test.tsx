import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { CodeBlock } from "../src/ui";
import { createAppRouter } from "../src/App";
import { Demo } from "../src/demo";

const ROUTES = [
  "/",
  "/docs/getting-started",
  "/docs/presets",
  "/docs/rules",
  "/docs/agents",
  "/docs/cli",
  "/nope",
];

describe("web pages render", () => {
  for (const route of ROUTES) {
    test(`renders ${route} without runtime errors`, async () => {
      const router = createAppRouter(createMemoryHistory({ initialEntries: [route] }));
      await router.load();
      const html = renderToStaticMarkup(<RouterProvider router={router} />);
      expect(html.length).toBeGreaterThan(200);
    });
  }

  test("the home route is matched for /", async () => {
    const router = createAppRouter(createMemoryHistory({ initialEntries: ["/"] }));
    await router.load();
    const html = renderToStaticMarkup(<RouterProvider router={router} />);
    expect(html).toContain("hero-title");
  });

  test("an unknown path renders the not-found page", async () => {
    const router = createAppRouter(createMemoryHistory({ initialEntries: ["/nope"] }));
    await router.load();
    const html = renderToStaticMarkup(<RouterProvider router={router} />);
    expect(html).toContain("404");
  });

  test("renders the demo", () => {
    expect(renderToStaticMarkup(<Demo />)).toContain("Without vs with");
  });

  test("code blocks emit TanStack Highlight classes", () => {
    const html = renderToStaticMarkup(<CodeBlock title="x.ts">{"const port = 1;"}</CodeBlock>);
    expect(html).toContain("th-code");
    expect(html).toContain("th-keyword");
  });

  test("an untitled code block highlights with the lang prop", () => {
    const html = renderToStaticMarkup(<CodeBlock lang="toml">{"# start\n[fmt]"}</CodeBlock>);
    expect(html).toContain("th-code--toml");
    expect(html).toContain("th-comment");
  });
});
