"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WizardOwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Guard: redirect unauthenticated users to login
      if (!user) {
        router.replace("/login");
        setChecking(false);
        return;
      }

      // Guard: only owners can access the wizard
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
    <div>
      {/* Owner-only wizard layout */}
      {children}
    </div>
  );
}