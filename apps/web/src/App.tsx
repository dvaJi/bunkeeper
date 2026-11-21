import { useEffect, useState } from "react";
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

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🍞</span> bunkeeper
        </Link>
        <nav className="top-nav">
          <Link to="/docs/getting-started">Docs</Link>
          <Link to="/docs/presets">Presets</Link>
          <Link to="/docs/rules">Rules</Link>
          <a href="https://github.com/dvaJi/bunkeeper" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
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
  const Page = ROUTES[route] ?? Home;
  return (
    <div className="site">
      <Header />
      <main className="site-main container">
        <Page />
      </main>
      <Footer />
    </div>
  );
}
