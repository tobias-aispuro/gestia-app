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
        <path d="M3 9.5 10 3l7 6.5" />
        <path d="M4.5 8v8.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8" />
        <path d="M8 17.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
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
    href: "/config",
    label: "Configuración",
    // Etiqueta corta para la tab bar mobile: mismo destino, versión que entra en el espacio disponible.
    mobileLabel: "Ajustes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.2 4.2l2.1 2.1M13.7 13.7l2.1 2.1M4.2 15.8l2.1-2.1M13.7 6.3l2.1-2.1" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="3" />
        <path d="M3.5 17c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
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
        "inset-x-0 bottom-0 h-(--sidebar-width-mobile) flex-row items-stretch justify-around border-t px-1",
        // Desktop (sm+): left rail expandido con etiquetas
        "sm:inset-x-auto sm:inset-y-0 sm:bottom-auto sm:left-0 sm:h-screen sm:w-(--sidebar-width)",
        "sm:flex-col sm:items-stretch sm:justify-start sm:border-t-0 sm:border-r sm:px-3 sm:py-6",
      )}
    >
      {/* Wordmark — desktop only. El punto retoma el acento dorado, guiño al separador decimal de un monto. */}
      <div className="hidden sm:mb-8 sm:flex sm:items-center sm:px-2">
        <span className="heading-display text-lg leading-none">
          Gastia<span className="text-accent">.</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-row items-stretch justify-around gap-1 sm:flex-col sm:items-stretch sm:justify-start sm:gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-md px-1.5 py-1.5",
                "transition-colors duration-200 ease-out",
                "sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5",
                isActive
                  ? "text-accent sm:bg-surface sm:text-heading"
                  : "text-muted hover:text-body sm:hover:bg-surface/60 sm:hover:text-body",
              )}
            >
              <span className="shrink-0">{item.icon}</span>

              {/* Mobile: caption corta debajo del ícono */}
              <span className="text-[10px] leading-none font-medium sm:hidden">
                {item.mobileLabel ?? item.label}
              </span>

              {/* Desktop: nombre completo de la sección junto al ícono */}
              <span className="hidden text-sm leading-none sm:inline">
                {item.label}
              </span>

              {isActive && (
                <span
                  aria-hidden
                  className="hidden h-5 w-[3px] rounded-full bg-accent sm:absolute sm:left-0 sm:top-1/2 sm:block sm:-translate-y-1/2"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
