"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "var(--sidebar-width)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-root)",
        zIndex: 50,
        paddingTop: "24px",
        gap: "4px",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 28,
          height: 28,
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.5rem",
            color: "var(--text-heading)",
            lineHeight: 1,
          }}
        >
          G
        </span>
      </div>

      {/* Nav items */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          flex: 1,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              style={{
                position: "relative",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                color: isActive
                  ? "var(--text-heading)"
                  : "var(--text-muted)",
                background: isActive
                  ? "var(--bg-surface)"
                  : "transparent",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-body)";
                  e.currentTarget.style.background = "var(--bg-surface)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.icon}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    right: -1,
                    top: "50%",
                    transform: "translateY(-50%) translateX(50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
