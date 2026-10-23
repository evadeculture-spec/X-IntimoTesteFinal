import Link from "next/link";
import { CATEGORIES } from "@/data/taxonomy";
import { Logo } from "./Logo";
import { HeaderActions, MenuButton } from "./HeaderActions";
import { NavLink } from "./NavLink";

export const NAV = [
  ...CATEGORIES.map((c) => ({ href: `/loja/${c.id}`, label: c.id === "termica" ? "Térmica" : c.name, tagline: c.tagline })),
  { href: "/loja?ordem=novidades", label: "Novidades", tagline: "Acabado de chegar" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <div className="site-header__start">
          <MenuButton nav={NAV} />
          <nav className="site-nav" aria-label="Principal">
            <ul role="list">
              {NAV.map((n) => (
                <li key={n.href}>
                  <NavLink href={n.href}>{n.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Link href="/" className="logo" aria-label="Intimo — X Íntimo, página inicial">
          <Logo />
        </Link>
        <HeaderActions />
      </div>
    </header>
  );
}
