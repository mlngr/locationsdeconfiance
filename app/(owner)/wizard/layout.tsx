"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";

export default function WizardOwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Non connecté -> login
      if (!user) {
        router.replace("/login");
        setChecking(false);
        return;
      }

      // Uniquement role=owner
      const role = (user.user_metadata as any)?.role;
      if (role !== "owner") {
        router.replace("/");
        setChecking(false);
        return;
      }

      setChecking(false);
    })();
  }, [router]);

  if (checking) return null;

  return (
    <main>
      <NavBar />
      {children}
    </main>
  );
}