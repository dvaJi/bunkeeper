import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
import { Link } from "./ui";
import { Home } from "./pages/home";
import { GettingStarted } from "./pages/getting-started";
import { Presets } from "./pages/presets";
import { Rules } from "./pages/rules";
import { Agents } from "./pages/agents";
import { CliPage } from "./pages/cli";

const ROUTES: Record<string, () => React.JSX.Element> = {
  "/": Home,
  "/docs/getting-started": GettingStarted,
  "/docs/presets": Presets,
  "/docs/rules": Rules,
  "/docs/agents": Agents,
  "/docs/cli": CliPage,
};

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/docs/getting-started", label: "Getting started" },
  { to: "/docs/presets", label: "Presets" },
  { to: "/docs/rules", label: "Rules" },
  { to: "/docs/agents", label: "Agent rules" },
  { to: "/docs/cli", label: "CLI" },
];

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onChange = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function navigate(to: string) {
  window.location.hash = to;
}

function Header({ route, onOpenMenu }: { route: string; onOpenMenu: () => void }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🍞</span> bunkeeper
        </Link>
        <nav className="top-nav">
          {PAGES.slice(1).map((page) => (
            <a
              key={page.to}
              href={`#${page.to}`}
              className={route === page.to ? "active" : undefined}
              aria-current={route === page.to ? "page" : undefined}
            >
              {page.label}
            </a>
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
            <TooltipContent>GitHub repository ↗</TooltipContent>
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

export function App() {
  const route = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const Page = ROUTES[route] ?? Home;

  return (
    <TooltipProvider>
      <div className="site">
        <Header route={route} onOpenMenu={() => setMenuOpen(true)} />
        <main className="site-main container">
          <Page />
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
                  onSelect={() => navigate(page.to)}
                >
                  {page.label}
                </CommandMenuItem>
              ))}
            </CommandMenuGroup>
            <CommandMenuSeparator />
            <CommandMenuGroup heading="Rules">
              <CommandMenuItem
                value="Rules — all bunkeeper rules"
                onSelect={() => navigate("/docs/rules")}
              >
                All bunkeeper rules
              </CommandMenuItem>
              <CommandMenuItem
                value="Presets — recommended and strict"
                onSelect={() => navigate("/docs/presets")}
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
                GitHub repository ↗
              </CommandMenuItem>
            </CommandMenuGroup>
          </CommandMenuList>
        </CommandMenu>
      </div>
    </TooltipProvider>
  );
}
