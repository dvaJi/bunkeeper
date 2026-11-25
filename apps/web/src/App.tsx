import { useState } from "react";
import { Search } from "lucide-react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
  useNavigate,
  type RouterHistory,
} from "@tanstack/react-router";
import { Button, ButtonLink } from "./components/forme/button/button";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSeparator,
} from "./components/forme/command-menu/command-menu";
import { Kbd } from "./components/forme/kbd/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/forme/tooltip/tooltip";
import { GitHubIcon } from "./icons";
import { Home } from "./pages/home";
import { GettingStarted } from "./pages/getting-started";
import { Presets } from "./pages/presets";
import { Rules } from "./pages/rules";
import { Agents } from "./pages/agents";
import { CliPage } from "./pages/cli";

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/docs/getting-started", label: "Getting started" },
  { to: "/docs/presets", label: "Presets" },
  { to: "/docs/rules", label: "Rules" },
  { to: "/docs/agents", label: "Agent rules" },
  { to: "/docs/cli", label: "CLI" },
];

function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          to="/"
          className="brand"
          activeOptions={{ exact: true }}
          activeProps={{ className: "brand" }}
        >
          bunkeeper
        </Link>
        <nav className="top-nav">
          {PAGES.slice(1).map((page) => (
            <Link
              key={page.to}
              to={page.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "active", "aria-current": "page" }}
            >
              {page.label}
            </Link>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <ButtonLink
                variant="ghost"
                size="small"
                iconOnly
                leadingIcon={GitHubIcon}
                href="https://github.com/dvaJi/bunkeeper"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
              />
            </TooltipTrigger>
            <TooltipContent>GitHub repository</TooltipContent>
          </Tooltip>
        </nav>
        <Button variant="secondary" size="small" onClick={onOpenMenu} aria-label="Search docs">
          <Search className="size-4" />
          Search
          <Kbd>⌘K</Kbd>
        </Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>MIT © bunkeeper contributors</span>
        <span className="dim">The toolchain is Bun. bunkeeper just makes it strict.</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="docs-layout">
      <article className="docs-content">
        <h1>404</h1>
        <p className="lede">
          This page does not exist. The <Link to="/">home page</Link> and the{" "}
          <Link to="/docs/getting-started">docs</Link> are real, though.
        </p>
      </article>
    </div>
  );
}

function Shell() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="site">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="site-main container">
          <Outlet />
        </main>
        <Footer />
        <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} label="Search docs">
          <CommandMenuInput placeholder="Search docs…" />
          <CommandMenuList>
            <CommandMenuEmpty>No results.</CommandMenuEmpty>
            <CommandMenuGroup heading="Pages">
              {PAGES.map((page) => (
                <CommandMenuItem
                  key={page.to}
                  value={page.label}
                  onSelect={() => navigate({ to: page.to })}
                >
                  {page.label}
                </CommandMenuItem>
              ))}
            </CommandMenuGroup>
            <CommandMenuSeparator />
            <CommandMenuGroup heading="Rules">
              <CommandMenuItem
                value="Rules — all bunkeeper rules"
                onSelect={() => navigate({ to: "/docs/rules" })}
              >
                All bunkeeper rules
              </CommandMenuItem>
              <CommandMenuItem
                value="Presets — recommended and strict"
                onSelect={() => navigate({ to: "/docs/presets" })}
              >
                Recommended and strict
              </CommandMenuItem>
            </CommandMenuGroup>
            <CommandMenuSeparator />
            <CommandMenuGroup heading="Links">
              <CommandMenuItem
                value="GitHub repository"
                onSelect={() => window.open("https://github.com/dvaJi/bunkeeper", "_blank")}
              >
                GitHub repository
              </CommandMenuItem>
            </CommandMenuGroup>
          </CommandMenuList>
        </CommandMenu>
      </div>
    </TooltipProvider>
  );
}

const rootRoute = createRootRoute({ component: Shell, notFoundComponent: NotFound });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Home });
const gettingStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/getting-started",
  component: GettingStarted,
});
const presetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/presets",
  component: Presets,
});
const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/rules",
  component: Rules,
});
const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/agents",
  component: Agents,
});
const cliRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/cli",
  component: CliPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gettingStartedRoute,
  presetsRoute,
  rulesRoute,
  agentsRoute,
  cliRoute,
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    history,
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}

let browserRouter: ReturnType<typeof createAppRouter> | undefined;

export function App({ router }: { router?: ReturnType<typeof createAppRouter> }) {
  browserRouter ??= createAppRouter();
  return <RouterProvider router={router ?? browserRouter} />;
}
