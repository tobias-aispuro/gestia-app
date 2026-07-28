import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Offset by sidebar width on desktop, bottom bar on mobile.
          No max-width: fills the rest of the viewport instead of hugging the left edge. */}
      <main className="w-full flex-1 px-4 pt-8 pb-24 sm:ml-(--sidebar-width) sm:px-8 sm:pt-12 sm:pb-12 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        {children}
      </main>
    </div>
  );
}
