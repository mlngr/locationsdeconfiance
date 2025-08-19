"use client";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setRole((user.user_metadata as any)?.role ?? "owner");
    })();
  }, []);

  if (!userId) {
    return (
      <main>
        <NavBar />
        <div className="container py-12">
          <h1 className="text-2xl font-semibold">Veuillez vous connecter</h1>
          <p className="mt-2"><Link className="underline" href="/login">Aller à la page de connexion</Link></p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <NavBar />
      <div className="container py-12 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {role === "owner" ? (
          <div className="space-y-3">
            <p className="text-gray-700">Publiez et gérez vos annonces, suivez vos loyers et paiements.</p>
            <Link href="/properties/new" className="btn btn-primary">Nouvelle annonce</Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700">Parcourez les annonces et gérez vos favoris & paiements.</p>
            <Link href="/properties" className="btn btn-outline">Voir les annonces</Link>
          </div>
        )}
      </div>
    </main>
  );
}
