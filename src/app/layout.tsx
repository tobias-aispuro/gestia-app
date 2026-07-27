import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import "./globals.css";

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Offset by sidebar width on desktop, bottom bar on mobile.
              No max-width: fills the rest of the viewport instead of hugging the left edge. */}
          <main className="w-full flex-1 px-4 pt-8 pb-24 sm:ml-(--sidebar-width) sm:px-8 sm:pt-12 sm:pb-12 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
