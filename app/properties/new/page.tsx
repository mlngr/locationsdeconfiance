"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { uploadPhotos } from "@/lib/storage";
import NavBar from "@/components/NavBar";

export default function NewPropertyPage() {
  const [title,setTitle]=useState(""); const [description,setDescription]=useState("");
  const [price,setPrice]=useState<number>(0); const [city,setCity]=useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|undefined>(); const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(undefined);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter.");
      let photos: string[] = [];
      if (files && files.length > 0) {
        photos = await uploadPhotos(Array.from(files), user.id);
      }
      const { error } = await supabase.from("properties").insert({
        owner_id: user.id, title, description, price, city, photos
      });
      if (error) throw error;
      router.push("/properties");
    } catch (e:any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <NavBar/>
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Nouvelle annonce</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input className="input" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} required/>
          <textarea className="input" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required/>
          <input type="number" className="input" placeholder="Prix (€/mois)" value={price} onChange={e=>setPrice(Number(e.target.value)||0)} required/>
          <input className="input" placeholder="Ville" value={city} onChange={e=>setCity(e.target.value)} required/>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Photos (JPEG/PNG, multiple)</label>
            <input type="file" multiple accept="image/*" onChange={e=>setFiles(e.target.files)} />
          </div>
          {err && <p className="text-red-600">{err}</p>}
          <button disabled={loading} className="btn btn-primary">{loading ? "Publication..." : "Publier"}</button>
        </form>
      </div>
    </main>
  );
}
