"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { uploadPhotos } from "@/lib/storage";
import NavBar from "@/components/NavBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Property } from "@/types";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .eq("owner_id", user.id)
        .single();

      if (!data) {
        router.push("/dashboard");
        return;
      }

      setProperty(data as Property);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(data.price);
      setCity(data.city);
      setPostalCode(data.postal_code || "");
    })();
  }, [params.id, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(undefined);

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

      let photos = property?.photos || [];
      if (files && files.length > 0) {
        const newPhotos = await uploadPhotos(Array.from(files), user.id);
        photos = [...photos, ...newPhotos].slice(0, 6); // Keep max 6 photos
      }

      const { error } = await supabase
        .from("properties")
        .update({
          title,
          description,
          price,
          city,
          postal_code: postalCode,
          photos
        })
        .eq("id", params.id)
        .eq("owner_id", user.id);

      if (error) throw error;
      router.push(`/properties/${params.id}`);
    } catch (e: any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!property) {
    return (
      <main>
        <NavBar />
        <div className="container py-12">Chargement...</div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: property.title, href: `/properties/${params.id}` },
            { label: "Éditer" }
          ]}
        />
        <h1 className="text-3xl font-bold">Éditer l'annonce</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input
            className="input"
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            className="input"
            placeholder="Prix (€/mois)"
            value={price}
            onChange={e => setPrice(Number(e.target.value) || 0)}
            required
          />
          <input
            className="input"
            placeholder="Ville"
            value={city}
            onChange={e => setCity(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Code postal (5 chiffres)"
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            pattern="\d{5}"
            title="Le code postal doit contenir exactement 5 chiffres"
            required
          />
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Photos actuelles: {property.photos?.length || 0}/6
            </label>
            {property.photos && property.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {property.photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
            <label className="block text-sm text-gray-600 mb-1">
              Ajouter des photos (JPEG/PNG, max {6 - (property.photos?.length || 0)} supplémentaires)
              {files && ` +${files.length}`}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setFiles(e.target.files)}
            />
            {files && ((property.photos?.length || 0) + files.length) > 6 && (
              <p className="text-red-600 text-sm mt-1">
                Maximum 6 photos au total
              </p>
            )}
          </div>
          {err && <p className="text-red-600">{err}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/properties/${params.id}`)}
              className="btn btn-outline flex-1"
            >
              Annuler
            </button>
            <button
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}