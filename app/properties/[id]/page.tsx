"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", params.id).single();
      setP(data || null);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    })();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", params.id)
        .eq("owner_id", currentUser?.id);

      if (error) throw error;
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const nextImage = () => {
    if (p?.photos?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % p.photos.length);
    }
  };

  const prevImage = () => {
    if (p?.photos?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + p.photos.length) % p.photos.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [p]);

  if (!p) return (
    <main>
      <NavBar/>
      <div className="container py-12">Chargement...</div>
    </main>
  );

  const isOwner = currentUser?.id === p.owner_id;
  const photos = p.photos || [];

  return (
    <main>
      <NavBar/>
      <div className="container py-8 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Annonces", href: "/properties" },
            { label: p.title }
          ]}
        />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{p.title}</h1>
            <p className="text-gray-600">{p.city} {p.postal_code && `(${p.postal_code})`} • <span className="font-semibold">{p.price} €/mois</span></p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/properties/${params.id}/edit`}
                className="btn btn-outline"
              >
                Éditer
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
        
        {/* Image Carousel */}
        {photos.length > 0 ? (
          <div className="mt-6 relative">
            <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
              <Image 
                src={photos[currentImageIndex]} 
                alt={`Photo ${currentImageIndex + 1} de ${p.title}`} 
                width={800} 
                height={450} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {photos.length > 1 && (
              <>
                {/* Navigation buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  aria-label="Image précédente"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  aria-label="Image suivante"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {photos.map((photo: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-3 h-3 rounded-full ${
                        i === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                      }`}
                      aria-label={`Aller à l'image ${i + 1}`}
                    />
                  ))}
                </div>
                
                {/* Counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <Image src="/assets/tenant.png" alt="Aucune image" width={800} height={450} className="rounded-xl border"/>
          </div>
        )}
        
        <div className="mt-6 whitespace-pre-wrap text-gray-800">{p.description}</div>
      </div>
      
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title={p.title}
      />
    </main>
  );
}
