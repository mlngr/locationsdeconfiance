"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, clearWizard } from "@/lib/wizardStorage";
import { getWizardFiles, clearWizardFiles } from "@/lib/wizardVolatile";
import { uploadPhotos } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";

export default function RecapPage() {
  const router = useRouter();
  const [wizardData, setWizardData] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  // Load data after hydration
  useEffect(() => {
    const data = loadWizard();
    const files = getWizardFiles();
    setWizardData(data);
    setSelectedFiles(files);
  }, []);

  if (!wizardData) {
    return (
      <main>
        <NavBar />
        <div className="container py-10 max-w-2xl">
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  // Generate suggested title and description
  const generateTitle = () => {
    if (!wizardData.details || !wizardData.loyer || !wizardData.address) return "";
    
    const { propertyType, surface, rooms } = wizardData.details;
    const { rent, charges } = wizardData.loyer;
    const { city } = wizardData.address;
    
    const total = rent + charges;
    const roomText = rooms === 1 ? "1 pièce" : `${rooms} pièces`;
    
    return `${propertyType} ${roomText} - ${surface}m² - ${city} - ${total}€ CC`;
  };

  const generateDescription = () => {
    if (!wizardData.details || !wizardData.loyer || !wizardData.address) return "";
    
    const { propertyType, surface, rooms, furnished, floor, elevator } = wizardData.details;
    const { rent, charges, deposit } = wizardData.loyer;
    const { addressLabel, city, postalCode } = wizardData.address;
    
    let desc = `${propertyType} de ${surface}m² comprenant ${rooms} pièce${rooms > 1 ? 's' : ''}.`;
    
    if (furnished) desc += " Meublé.";
    if (floor !== undefined) desc += ` Situé au ${floor}${floor === 1 ? 'er' : 'ème'} étage`;
    if (elevator && floor && floor > 0) desc += " avec ascenseur";
    if (floor !== undefined) desc += ".";
    
    desc += `\n\nAdresse : ${addressLabel}, ${postalCode} ${city}`;
    desc += `\n\nLoyer : ${rent}€ hors charges`;
    desc += `\nCharges : ${charges}€`;
    desc += `\nTotal charges comprises : ${rent + charges}€`;
    desc += `\nDépôt de garantie : ${deposit}€`;
    
    return desc;
  };

  const title = generateTitle();
  const description = generateDescription();

  async function onPublish() {
    setLoading(true);
    setErr(undefined);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter.");

      // Create property without photos first
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title,
          description,
          price: wizardData.loyer.rent + wizardData.loyer.charges,
          city: wizardData.address.city,
          postal_code: wizardData.address.postalCode,
          photos: []
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload photos if any
      let photoUrls: string[] = [];
      if (selectedFiles.length > 0 && property) {
        const { urls } = await uploadPhotos(selectedFiles, user.id, property.id);
        photoUrls = urls;

        // Update property with photo URLs
        const { error: updateError } = await supabase
          .from("properties")
          .update({ photos: photoUrls })
          .eq("id", property.id);

        if (updateError) throw updateError;
      }

      // Clear wizard data
      clearWizard();
      clearWizardFiles();

      // Redirect to success or property page
      router.push("/properties");
    } catch (e: any) {
      setErr(e.message || "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Récapitulatif</h1>
        <div className="mt-6 space-y-6">
          
          {/* Titre suggéré */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Titre suggéré</h3>
            <p className="text-gray-700">{title}</p>
          </div>

          {/* Description suggérée */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Description suggérée</h3>
            <pre className="text-gray-700 whitespace-pre-wrap text-sm">{description}</pre>
          </div>

          {/* Récap des détails */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Adresse</h3>
              <p className="text-blue-800 text-sm">{wizardData.address?.addressLabel}</p>
              <p className="text-blue-800 text-sm">{wizardData.address?.postalCode} {wizardData.address?.city}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Bien</h3>
              <div className="text-green-800 text-sm space-y-1">
                <p>{wizardData.details?.propertyType} - {wizardData.details?.surface}m²</p>
                <p>{wizardData.details?.rooms} pièce{wizardData.details?.rooms > 1 ? 's' : ''}</p>
                {wizardData.details?.furnished && <p>Meublé</p>}
                {wizardData.details?.floor !== undefined && (
                  <p>Étage {wizardData.details.floor}</p>
                )}
                {wizardData.details?.elevator && <p>Ascenseur</p>}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Loyer</h3>
              <div className="text-purple-800 text-sm space-y-1">
                <p>Hors charges : {wizardData.loyer?.rent}€</p>
                <p>Charges : {wizardData.loyer?.charges}€</p>
                <p className="font-semibold">Total CC : {(wizardData.loyer?.rent || 0) + (wizardData.loyer?.charges || 0)}€</p>
                <p>Dépôt : {wizardData.loyer?.deposit}€</p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Photos</h3>
              <p className="text-orange-800 text-sm">
                {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} sélectionnée{selectedFiles.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Photos preview */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Aperçu des photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push("/wizard/photos")}
              disabled={loading}
            >
              Retour
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPublish}
              disabled={loading}
            >
              {loading ? "Publication en cours..." : "Publier l'annonce"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}