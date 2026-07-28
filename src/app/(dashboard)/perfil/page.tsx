import { currentUser } from "@clerk/nextjs/server";
import Card from "@/components/ui/Card";
import SignOutButton from "@/components/layout/SignOutButton";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await currentUser();

  const fullName = user?.fullName || user?.username || "Sin nombre";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <>
      <h1 className="heading-display mb-8 text-3xl sm:text-4xl">Perfil</h1>

      <Card className="max-w-md">
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full border border-border-default"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-raised text-lg font-semibold text-heading">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-heading">{fullName}</p>
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
        </div>

        <hr className="separator my-6" />

        <SignOutButton />
      </Card>
    </>
  );
}
