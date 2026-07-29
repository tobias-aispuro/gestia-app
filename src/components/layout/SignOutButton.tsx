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
    <Button
      variant="danger"
      loading={loading}
      onClick={handleSignOut}
      className="w-full"
      leftIcon={
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 14v1.5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H11a1.5 1.5 0 0 1 1.5 1.5V6" />
          <path d="M8 10h9" />
          <path d="m14.5 7.5 2.5 2.5-2.5 2.5" />
        </svg>
      }
    >
      Cerrar sesión
    </Button>
  );
}
