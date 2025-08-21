"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function NewPropertyPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to the new wizard tunnel
    router.replace("/wizard/adresse");
  }, [router]);

  return (
    <main>
      <NavBar/>
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Redirection...</h1>
        <p className="mt-4 text-gray-600">Vous êtes redirigé vers le nouveau formulaire de création d'annonce.</p>
      </div>
    </main>
  );
}
