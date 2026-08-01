"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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
        // bg-rail y no bg-background: el rail es una superficie propia, si no
        // queda del mismo color que el área de contenido y no se distingue.
        "fixed z-50 flex bg-rail",
        // Mobile: bottom tab bar
        "inset-x-0 bottom-0 h-(--sidebar-width-mobile) flex-row items-stretch justify-around px-1",
        // Desktop (sm+): left rail expandido con etiquetas. Sin padding lateral
        // acá: lo llevan los items, para que puedan tocar el borde interno
        // donde se apoya el indicador de sección.
        "sm:inset-x-auto sm:inset-y-0 sm:bottom-auto sm:left-0 sm:h-screen sm:w-(--sidebar-width)",
        "sm:flex-col sm:items-stretch sm:justify-start sm:px-0 sm:py-7",
      )}
    >
      {/* Regla de margen. Hace de separador contra el contenido y de riel del
          indicador: el item activo la engrosa a acento sólido. Arriba en mobile,
          en el borde interno en desktop. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bg-rail-rule",
          "inset-x-0 top-0 h-px",
          "sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-auto sm:w-px",
        )}
      />

      {/* Wordmark — desktop only. El punto retoma el acento dorado, guiño al separador decimal de un monto. */}
      <div className="hidden sm:mb-9 sm:flex sm:items-baseline sm:px-5">
        <span className="heading-display text-[1.0625rem] leading-none tracking-[-0.02em]">
          Gastia<span className="text-accent">.</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-row items-stretch justify-around gap-1 sm:flex-col sm:items-stretch sm:justify-start sm:gap-0.5">
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
                // Sin píldora rellena en el activo: bg-surface es el material de
                // las tarjetas del dashboard, y usarlo acá es lo que hacía que
                // el rail se leyera como contenido. La posición la marcan la
                // regla encendida y el color del texto.
                "sm:flex-row sm:justify-start sm:gap-3 sm:rounded-none sm:px-5 sm:py-2.5",
                isActive
                  ? "text-accent sm:text-heading sm:font-medium"
                  : "text-body hover:text-heading sm:hover:bg-white/[0.035]",
              )}
            >
              <span className={cn("shrink-0 transition-colors", isActive && "sm:text-accent")}>
                {item.icon}
              </span>

              {/* Mobile: caption corta debajo del ícono */}
              <span className="text-[10px] leading-none font-medium sm:hidden">
                {item.mobileLabel ?? item.label}
              </span>

              {/* Desktop: nombre completo de la sección junto al ícono */}
              <span className="hidden text-sm leading-none sm:inline">
                {item.label}
              </span>

              {isActive && (
                <>
                  {/* El tramo encendido de la regla: arriba de la tab en mobile… */}
                  <span
                    aria-hidden
                    className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-accent sm:hidden"
                  />
                  {/* …y sobre el borde interno del rail en desktop. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 right-0 hidden w-[2px] rounded-l-full bg-accent sm:block"
                  />
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Cuenta — desktop only, pegado abajo del rail.
          El redirect a /sign-in tras cerrar sesión lo maneja el middleware
          (__internal_invokeMiddlewareOnAuthStateChange, default true), no un prop acá. */}
      <div className="hidden sm:mt-auto sm:block sm:px-5 sm:pt-5">
        <div className="separator mb-4" />
        <UserButton />
      </div>
    </aside>
  );
}
