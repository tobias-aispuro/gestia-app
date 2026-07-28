import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 renombró "middleware" a "proxy" (mismo mecanismo, archivo distinto).
// El chequeo de auth en sí vive en (dashboard)/layout.tsx: Clerk deprecó
// createRouteMatcher + protección centralizada acá a favor de "resource-based
// auth checks" — el proxy solo tiene que envolver el request para que auth()
// funcione río abajo.
export const proxy = clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
