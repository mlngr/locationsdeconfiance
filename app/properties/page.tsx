"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Property } from "@/types";

export default function PropertiesIndex() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setItems([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setItems((data as Property[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main><div className="container py-12">Chargement...</div></main>;

  return (
    <main>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Annonces</h1>
        {items.length === 0 ? (
          <p className="text-gray-600">Aucune annonce pour le moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="card block hover:shadow-lg transition">
                <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
                  {p.photos?.[0] ? (
                    <Image src={p.photos[0]} alt={p.title} width={400} height={225} className="w-full h-full object-cover" />
                  ) : (
                    <Image src="/assets/tenant.png" alt="Aucune image" width={400} height={225} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-gray-600 text-sm">{p.city} {p.postal_code && `(${p.postal_code})`}</p>
                  <p className="font-bold">{p.price} € / mois</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
