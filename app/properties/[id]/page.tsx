"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Image from "next/image";

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", params.id).single();
      setP(data || null);
    })();
  }, [params.id]);

  if (!p) return (
    <main>
      <NavBar/>
      <div className="container py-12">Chargement...</div>
    </main>
  );

  return (
    <main>
      <NavBar/>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold">{p.title}</h1>
        <p className="text-gray-600">{p.city} • <span className="font-semibold">{p.price} €/mois</span></p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {(p.photos ?? []).slice(0,4).map((url:string, i:number) => (
            <Image key={i} src={url} alt={`photo ${i+1}`} width={800} height={450} className="rounded-xl border"/>
          ))}
          {(!p.photos || p.photos.length===0) && <Image src="/assets/tenant.png" alt="" width={800} height={450} className="rounded-xl border"/>}
        </div>
        <div className="mt-6 whitespace-pre-wrap text-gray-800">{p.description}</div>
      </div>
    </main>
  );
}
