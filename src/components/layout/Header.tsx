"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Radio } from "lucide-react";
import { Logo } from "./Logo";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-lp-white shadow-sm">
      <div className="border-b border-gray-200 bg-lp-anthracite">
        <div className="lp-container flex h-9 items-center justify-between text-xs text-white/80">
          <span className="hidden sm:inline">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <Link
            href="/live"
            className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-lp-live hover:text-white"
          >
            <Radio className="h-3 w-3 lp-live-pulse" />
            En direct
          </Link>
        </div>
      </div>

      <div className="lp-container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Logo size="md" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide hover:text-lp-accent"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Recherche</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="border-t border-gray-200 py-3">
            <div className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher : Lubumbashi, RDC, politique..."
                className="flex-1 border border-gray-300 px-4 py-2 text-sm focus:border-lp-accent focus:outline-none"
                autoFocus
              />
              <button type="submit" className="lp-btn-primary px-6">
                Rechercher
              </button>
            </div>
          </form>
        )}
      </div>

      <nav
        className="hidden border-t border-gray-200 bg-lp-white lg:block"
        aria-label="Navigation principale"
      >
        <div className="lp-container">
          <ul className="flex flex-wrap items-center gap-x-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-3 text-xs font-bold uppercase tracking-wider text-lp-black transition-colors hover:bg-lp-light hover:text-lp-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <nav
        className={cn(
          "border-t border-gray-200 bg-lp-white lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        aria-label="Navigation mobile"
      >
        <ul className="lp-container py-2">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block border-b border-gray-100 py-3 text-sm font-bold uppercase tracking-wider"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
