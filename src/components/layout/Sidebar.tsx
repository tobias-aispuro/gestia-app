"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="9" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="13" width="7" height="5" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/gastos",
    label: "Gastos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="17" y2="6" />
        <line x1="3" y1="10" x2="17" y2="10" />
        <line x1="3" y1="14" x2="12" y2="14" />
      </svg>
    ),
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <circle cx="10" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/config",
    label: "Configuración",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed z-50 flex border-border-subtle bg-background",
        // Mobile: bottom tab bar
        "inset-x-0 bottom-0 h-14 flex-row items-center justify-around border-t px-2 gap-1",
        // Desktop (sm+): left icon rail
        "sm:inset-x-auto sm:inset-y-0 sm:bottom-auto sm:left-0 sm:h-screen sm:w-(--sidebar-width)",
        "sm:flex-col sm:items-center sm:justify-start sm:border-t-0 sm:border-r sm:gap-1 sm:pt-6 sm:px-0",
      )}
    >
      {/* Logo mark — desktop only */}
      <div className="hidden sm:mb-8 sm:flex sm:h-7 sm:w-7 sm:items-center sm:justify-center">
        <span className="heading-display text-2xl leading-none">G</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-row items-center justify-around gap-1 sm:flex-col sm:justify-start sm:gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-md",
                "transition-colors duration-200 ease-out",
                isActive
                  ? "bg-surface text-heading"
                  : "text-muted hover:bg-surface hover:text-body",
              )}
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
              {isActive && (
                <span
                  className={cn(
                    "absolute h-1 w-1 rounded-full bg-accent",
                    "left-1/2 top-0.5 -translate-x-1/2",
                    "sm:left-auto sm:top-1/2 sm:right-[-1px] sm:translate-x-1/2 sm:-translate-y-1/2",
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
