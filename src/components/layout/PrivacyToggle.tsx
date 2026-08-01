"use client";

import IconButton from "../ui/IconButton";
import { usePrivacy } from "./PrivacyProvider";

/** Ojo para tapar y destapar los montos de toda la pantalla. */
export default function PrivacyToggle() {
  const { hidden, toggle } = usePrivacy();

  return (
    <IconButton
      onClick={toggle}
      active={hidden}
      aria-label={hidden ? "Mostrar los montos" : "Ocultar los montos"}
      aria-pressed={hidden}
      title={hidden ? "Mostrar los montos" : "Ocultar los montos"}
    >
      {hidden ? (
        // Ojo tachado: los montos están ocultos.
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8.2 4.2A7.6 7.6 0 0 1 10 4c4 0 7 4 7 6a7.7 7.7 0 0 1-1.7 2.7" />
          <path d="M12.8 15.8A7.6 7.6 0 0 1 10 16c-4 0-7-4-7-6 0-1.2 1.1-2.9 2.7-4.1" />
          <path d="M8.6 8.6a2 2 0 0 0 2.8 2.8" />
          <line x1="3.5" y1="3.5" x2="16.5" y2="16.5" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 10s3-6 7-6 7 6 7 6-3 6-7 6-7-6-7-6Z" />
          <circle cx="10" cy="10" r="2.25" />
        </svg>
      )}
    </IconButton>
  );
}
