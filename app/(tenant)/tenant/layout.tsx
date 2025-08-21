"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import NavBar from "@/components/NavBar";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      // If Supabase is not configured, redirect to home page with a message
      if (!isSupabaseConfigured() || !supabase) {
        console.warn("Supabase not configured. Redirecting to home page.");
        router.replace("/");
        setChecking(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Guard: redirect unauthenticated users to login
      if (!user) {
        router.replace("/login");
        setChecking(false);
        return;
      }

      // Guard: only tenants can access the tenant space
      const role = (user.user_metadata as any)?.role;
      if (role !== "tenant") {
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
      {/* Tenant-only layout */}
      {children}
    </main>
  );
}