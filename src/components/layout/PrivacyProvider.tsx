"use client";

import { createContext, useCallback, useContext, useState } from "react";

const PRIVACY_COOKIE = "gastia_privacy";

interface PrivacyContextValue {
  hidden: boolean;
  toggle: () => void;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  hidden: false,
  toggle: () => {},
});

/**
 * Estado del modo privacidad, compartido por todo el dashboard.
 *
 * El valor inicial lo lee el layout de una cookie y lo baja por props: si se
 * guardara en localStorage, el server renderizaría los montos visibles y recién
 * al hidratar se taparían — es decir, un parpadeo mostrando justo lo que la
 * persona pidió esconder.
 *
 * El toggle no pasa por una Server Action: escribe la cookie desde el cliente y
 * mueve el estado en el mismo tick. Es lo que hace que ocultar sea instantáneo,
 * que es todo el punto de la función (alguien se te acercó a la pantalla). El
 * server solo vuelve a leer la cookie en la próxima carga.
 */
export function PrivacyProvider({
  initialHidden,
  children,
}: {
  initialHidden: boolean;
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(initialHidden);

  const toggle = useCallback(() => {
    setHidden((current) => {
      const next = !current;
      // max-age de un año: la preferencia sobrevive al cierre del navegador.
      document.cookie = `${PRIVACY_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;

      return next;
    });
  }, []);

  return (
    <PrivacyContext.Provider value={{ hidden, toggle }}>{children}</PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export { PRIVACY_COOKIE };
