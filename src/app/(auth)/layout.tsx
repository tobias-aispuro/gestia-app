export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <span className="heading-display text-2xl leading-none">
        Gastia<span className="text-accent">.</span>
      </span>
      {children}
    </div>
  );
}
