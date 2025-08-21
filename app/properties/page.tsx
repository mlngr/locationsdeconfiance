"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Property } from "@/types";
import NavBar from "@/components/NavBar";

export default function PropertiesPage() {
  const [list, setList] = useState<Property[]>([]);
  const [q, setQ] = useState(""); const [city, setCity] = useState(""); const [min, setMin] = useState(""); const [max, setMax] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      setList((data as any) || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const minN = Number(min || 0); const maxN = Number(max || 1e9);
    return list.filter(p =>
      (!q || p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())) &&
      (!city || p.city.toLowerCase().includes(city.toLowerCase())) &&
      p.price >= minN && p.price <= maxN
    );
  }, [list, q, city, min, max]);

  return (
    <main>
      <NavBar />
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Annonces</h1>
          <Link href="/wizard/adresse" className="btn btn-primary">Ajouter une annonce</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
          <input className="input md:col-span-2" placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)}/>
          <input className="input" placeholder="Ville" value={city} onChange={e=>setCity(e.target.value)}/>
          <input type="number" step={1} className="input" placeholder="Prix min" value={min} onChange={e=>setMin(e.target.value)}/>
          <input type="number" step={1} className="input" placeholder="Prix max" value={max} onChange={e=>setMax(e.target.value)}/>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8 mb-20 md:mb-8">
          {filtered.map(p => (
            <Link key={p.id} href={"/properties/"+p.id} className="card block hover:shadow-xl transition">
              <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                {p.photos?.[0] ? <Image src={p.photos[0]} alt="" width={800} height={450}/> : <Image src="/assets/owner.png" alt="" width={800} height={450}/>}
              </div>
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="text-gray-600 line-clamp-2">{p.description}</p>
              <p className="mt-2 font-bold">{p.price} €/mois</p>
              <p className="text-sm text-gray-500">{p.city}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
