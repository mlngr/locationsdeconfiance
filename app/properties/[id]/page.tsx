"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import DpeBadge from "@/components/DpeBadge";
import Image from "next/image";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";
import { deletePhotos, getStoragePathFromUrl } from "@/lib/storage";
import { Property } from "@/types";

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<Property | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
      // First, delete all photos from storage
      if (p?.photos && p.photos.length > 0) {
        const photoPaths = p.photos.map((url: string) => getStoragePathFromUrl(url));
        try {
          await deletePhotos(photoPaths);
        } catch (storageError) {
          console.error("Error deleting photos from storage:", storageError);
          // Continue with property deletion even if photo deletion fails
        }
      }

      // Then delete the property from database
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

  // Handle touch events for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
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
  const priceCC = p.price + (p.charges || 0);

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
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{p.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span>{p.city} {p.postal_code && `(${p.postal_code})`}</span>
                  {p.property_type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{p.property_type}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* DPE Badge */}
              {p.dpe_rating && (
                <div className="flex flex-col items-center">
                  <DpeBadge rating={p.dpe_rating} size="lg" />
                  <span className="text-xs text-gray-500 mt-1">DPE</span>
                </div>
              )}
            </div>
            
            {/* Pricing */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {priceCC.toLocaleString()} €
                </span>
                <span className="text-gray-600">CC/mois</span>
              </div>
              
              {p.charges && p.charges > 0 && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Loyer hors charges :</span>
                    <span>{p.price.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charges :</span>
                    <span>{p.charges.toLocaleString()} €</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-2 ml-4">
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
            {/* Hidden aria-live region for screen readers */}
            <div 
              aria-live="polite" 
              aria-atomic="true" 
              className="sr-only"
            >
              Image {currentImageIndex + 1} sur {photos.length}
            </div>
            <div 
              className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Image 
                src={photos[currentImageIndex]} 
                alt={`Photo ${currentImageIndex + 1} de ${p.title}`} 
                width={800} 
                height={450} 
                className="w-full h-full object-cover select-none"
                priority={currentImageIndex === 0}
                draggable={false}
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
                
                {/* Mobile swipe hint */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full opacity-75 md:hidden">
                  Balayez pour naviguer
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <Image src="/assets/tenant.png" alt="Aucune image" width={800} height={450} className="rounded-xl border"/>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{p.description}</div>
        </div>

        {/* Additional Information */}
        {(p.address_label || p.lat) && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Informations de localisation</h3>
            {p.address_label && (
              <p className="text-blue-800 mb-2">
                <strong>Adresse :</strong> {p.address_label}
              </p>
            )}
            {p.lat && p.lng && (
              <p className="text-sm text-blue-700">
                Coordonnées : {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}
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
