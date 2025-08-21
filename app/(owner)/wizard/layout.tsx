"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Redirect unauthenticated users to login
        if (!user) {
          router.push("/login");
          return;
        }

        // Check user role - redirect non-owners to home
        const userRole = (user.user_metadata as any)?.role;
        if (userRole && userRole !== "owner") {
          router.push("/");
          return;
        }

        // If user is authenticated and is owner (or no role set, defaulting to owner), allow access
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Vérification des autorisations...</div>
      </div>
    );
  }

  return <>{children}</>;
}