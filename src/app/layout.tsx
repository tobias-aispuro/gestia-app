import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// @clerk/themes todavía no soporta @clerk/nextjs 7.x (su última versión estable
// sigue atada a @clerk/shared v3), así que el tema oscuro va a mano acá con
// las variables de diseño que ya usa el resto de la app.
const clerkAppearance = {
  variables: {
    colorPrimary: "#d4a853",
    colorBackground: "#1a1a19",
    colorInputBackground: "#222221",
    colorInputText: "#ededec",
    colorText: "#ededec",
    colorTextSecondary: "#a3a39e",
    colorNeutral: "#ededec",
    colorDanger: "#f87171",
    borderRadius: "10px",
  },
  // Los `variables` de arriba no llegan a estos elementos puntuales (quedaban
  // del mismo color que el fondo, ilegibles) — se pisan a mano.
  elements: {
    headerTitle: { color: "#ededec" },
    headerSubtitle: { color: "#a3a39e" },
    footerActionText: { color: "#a3a39e" },
    footerActionLink: { color: "#d4a853" },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestia — Gestión de gastos",
  description:
    "Sistema de gestión de gastos personales. Controlá tus finanzas de forma simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
