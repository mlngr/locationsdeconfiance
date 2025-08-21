"use client";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { uploadPhotos } from "@/lib/storage";
import NavBar from "@/components/NavBar";

export default function NewPropertyPage() {
  const [title,setTitle]=useState(""); const [description,setDescription]=useState("");
  const [price,setPrice]=useState<number>(0); const [city,setCity]=useState("");
  const [postalCode,setPostalCode]=useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|undefined>(); const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(undefined);
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      setErr("La base de données n'est pas configurée. Veuillez contacter l'administrateur.");
      setLoading(false);
      return;
    }
    
    // Validate postal code (5 digits)
    if (!/^\d{5}$/.test(postalCode)) {
      setErr("Le code postal doit contenir exactement 5 chiffres.");
      setLoading(false);
      return;
    }
    
    // Validate photos limit
    if (files && files.length > 6) {
      setErr("Vous ne pouvez uploader que 6 photos maximum.");
      setLoading(false);
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter.");
      
      // First create the property without photos
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id, 
          title, 
          description, 
          price, 
          city, 
          postal_code: postalCode, 
          photos: []
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Then upload photos with the property ID
      let photos: string[] = [];
      if (files && files.length > 0 && property) {
        const { urls } = await uploadPhotos(Array.from(files), user.id, property.id);
        photos = urls;
        
        // Update the property with the photo URLs
        const { error: updateError } = await supabase
          .from("properties")
          .update({ photos })
          .eq("id", property.id);
          
        if (updateError) throw updateError;
      }
      
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
          <input type="number" step={1} className="input" placeholder="Prix (€/mois)" value={price} onChange={e=>setPrice(Number(e.target.value)||0)} required/>
          <input className="input" placeholder="Ville" value={city} onChange={e=>setCity(e.target.value)} required/>
          <input 
            className="input" 
            placeholder="Code postal (5 chiffres)" 
            value={postalCode} 
            onChange={e=>setPostalCode(e.target.value)} 
            pattern="\d{5}"
            title="Le code postal doit contenir exactement 5 chiffres"
            required
          />
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Photos (JPEG/PNG, max 6) {files && `${files.length}/6`}
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={e=>setFiles(e.target.files)} 
            />
            {files && files.length > 6 && (
              <p className="text-red-600 text-sm mt-1">Maximum 6 photos autorisées</p>
            )}
          </div>
          {err && <p className="text-red-600">{err}</p>}
          <button disabled={loading} className="btn btn-primary">{loading ? "Publication..." : "Publier"}</button>
        </form>
      </div>
    </main>
  );
}
