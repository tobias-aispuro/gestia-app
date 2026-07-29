import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SignOutButton from "@/components/layout/SignOutButton";
import { getCurrentUserId } from "@/lib/auth";
import * as categoryService from "@/services/category.service";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  return (
    <>
      <h1 className="heading-display mb-8 text-3xl sm:text-4xl">Perfil</h1>

      {/* Cards apiladas a lo ancho: cada bloque es una sección independiente,
          así que se cargan por separado (la identidad sale de Clerk, que es
          bastante más lento que la query de categorías a Neon). */}
      <div className="flex flex-col gap-6">
        <Suspense fallback={<IdentityCardSkeleton />}>
          <IdentityCard />
        </Suspense>

        <Suspense fallback={<CategoriesCardSkeleton />}>
          <CategoriesCard />
        </Suspense>

        <SignOutButton />
      </div>
    </>
  );
}

async function IdentityCard() {
  const user = await currentUser();

  const fullName = user?.fullName || user?.username || "Sin nombre";
  const username = user?.username;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <Card>
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
          <p className="truncate text-base font-semibold text-heading">
            {fullName}
          </p>
          {username && (
            <p className="truncate text-sm text-body">@{username}</p>
          )}
          {email && <p className="truncate text-sm text-muted">{email}</p>}
        </div>
      </div>
    </Card>
  );
}

async function CategoriesCard() {
  const userId = await getCurrentUserId();
  const categories = await categoryService.list(userId);

  const defaults = categories.filter((c) => c.isDefault);
  const own = categories.filter((c) => !c.isDefault);

  return (
    <Card>
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <h2 className="heading-display text-lg">Mis categorías</h2>
        <span className="shrink-0 text-sm text-muted">{categories.length}</span>
      </div>
      <p className="text-sm text-muted">
        Cada gasto se clasifica con una de estas etiquetas.
      </p>

      <hr className="separator my-6" />

      <CategoryGroup label="Predefinidas" categories={defaults} />

      {own.length > 0 && (
        <div className="mt-6">
          <CategoryGroup label="Propias" categories={own} />
        </div>
      )}
    </Card>
  );
}

function CategoryGroup({
  label,
  categories,
}: {
  label: string;
  categories: { id: string; name: string; icon: string | null }[];
}) {
  return (
    <div>
      <p className="text-label mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge key={cat.id} className="px-3 py-1.5 text-sm">
            {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function IdentityCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-raised" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 rounded-sm bg-raised" />
          <div className="h-3 w-52 rounded-sm bg-raised" />
        </div>
      </div>
    </Card>
  );
}

function CategoriesCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <h2 className="heading-display mb-1 text-lg text-muted">Mis categorías</h2>
      <div className="h-3 w-64 rounded-sm bg-raised" />
      <hr className="separator my-6" />
      <div className="h-24 rounded-md bg-raised" />
    </Card>
  );
}
