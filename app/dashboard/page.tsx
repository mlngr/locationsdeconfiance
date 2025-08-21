"use client";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import Image from "next/image";
import DeleteModal from "@/components/DeleteModal";
import { deletePhotos, getStoragePathFromUrl } from "@/lib/storage";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Guard: redirect unauthenticated users
      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      // Guard: allow only owners
      const role = (user.user_metadata as any)?.role;
      if (role !== "owner") {
        router.replace("/");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch only current owner's properties
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProperties((data as Property[]) || []);
      }
      setLoading(false);
    })();
  }, [router]);

  const handleDeleteProperty = async () => {
    if (!propertyToDelete || !userId) return;

    setDeleteLoading(true);
    try {
      if (propertyToDelete.photos && propertyToDelete.photos.length > 0) {
        const photoPaths = propertyToDelete.photos.map((url) => getStoragePathFromUrl(url));
        try {
          await deletePhotos(photoPaths);
        } catch (storageError) {
          console.error("Error deleting photos from storage:", storageError);
        }
      }

      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete.id)
        .eq("owner_id", userId);

      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      setPropertyToDelete(null);
      setDeleteModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  // During redirect/loading render nothing
  if (loading) return null;
  if (!userId) return null;

  // Pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  return (
    <main>
      <NavBar />
      <div className="container py-12 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Mes annonces" },
          ]}
        />

        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-gray-700">
              Publiez et gérez vos annonces, suivez vos loyers et paiements.
            </p>
            <Link href="/wizard/adresse" className="btn btn-primary">
              Nouvelle annonce
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Mes annonces ({properties.length})
            </h2>

            {properties.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune annonce
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous n\'avez pas encore créé d\'annonce. Commencez dès maintenant !
                  </p>
                  <Link href="/wizard/adresse" className="btn btn-primary">
                    Créer une annonce
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProperties.map((property) => (
                    <div
                      key={property.id}
                      className="card hover:shadow-xl transition"
                    >
                      <div className="aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-4">
                        {property.photos?.[0] ? (
                          <Image
                            src={property.photos[0]}
                            alt={property.title}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {property.city} {property.postal_code && `(${property.postal_code})`}
                      </p>
                      <p className="font-bold text-lg mb-4">
                        {property.price} €/mois
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="btn btn-outline flex-1 text-center"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/properties/${property.id}/edit`}
                          className="btn btn-primary flex-1 text-center"
                        >
                          Éditer
                        </Link>
                        <button
                          onClick={() => {
                            setPropertyToDelete(property);
                            setDeleteModalOpen(true);
                          }}
                          className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline disabled:opacity-50"
                    >
                      Précédent
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`btn ${
                            currentPage === page ? "btn-primary" : "btn-outline"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="btn btn-outline disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleDeleteProperty}
        loading={deleteLoading}
        title={propertyToDelete?.title || ""}
      />
    </main>
  );
}
