"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut(() => router.push("/sign-in"));
  }

  return (
    <Button variant="danger" loading={loading} onClick={handleSignOut}>
      Cerrar sesión
    </Button>
  );
}
