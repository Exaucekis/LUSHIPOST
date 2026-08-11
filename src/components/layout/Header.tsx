"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, Radio } from "lucide-react";
import { Logo } from "./Logo";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-lp-white transition-shadow duration-300",
        scrolled ? "shadow-[var(--shadow-lp-nav)]" : "shadow-sm"
      )}
    >
      <div className="bg-lp-anthracite text-white">
        <div className="lp-container flex h-9 items-center justify-between text-xs">
          <span className="hidden truncate text-white/70 sm:inline">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="font-medium tracking-wide text-white/90 sm:hidden">
            L&apos;info au cœur de Lubumbashi
          </span>
          <Link
            href="/live"
            className="flex shrink-0 items-center gap-1.5 font-bold uppercase tracking-wider text-lp-live transition-colors hover:text-white"
          >
            <Radio className="h-3 w-3 lp-live-pulse" />
            En direct
          </Link>
        </div>
      </div>

      <div className="lp-container">
        <div className="relative flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
          <div className="flex w-9 shrink-0 items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-sm p-1 transition-colors hover:bg-lp-light"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:flex-1">
            <Logo />
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-lp-light hover:text-lp-accent"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Recherche</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="animate-[fadeInUp_0.2s_ease-out] border-t border-gray-100 py-4"
          >
            <div className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lubumbashi, RDC, politique, sport..."
                className="flex-1 border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-lp-accent focus:outline-none focus:ring-1 focus:ring-lp-accent"
                autoFocus
              />
              <button type="submit" className="lp-btn-primary shrink-0 px-6">
                OK
              </button>
            </div>
          </form>
        )}
      </div>

      <nav
        className="hidden border-t border-gray-100 bg-lp-white lg:block"
        aria-label="Navigation principale"
      >
        <div className="lp-container">
          <ul className="flex flex-wrap items-center">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="lp-nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <nav
        className={cn(
          "border-t border-gray-100 bg-lp-white lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        aria-label="Navigation mobile"
      >
        <ul className="lp-container divide-y divide-gray-50 py-2">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-3.5 text-sm font-bold uppercase tracking-wider transition-colors hover:text-lp-accent"
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
