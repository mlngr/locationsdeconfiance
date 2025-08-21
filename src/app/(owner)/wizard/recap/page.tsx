"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, saveWizard, clearWizard, WizardState } from "@/lib/wizardStorage";
import { getVolatileFiles, clearVolatileFiles } from "@/lib/wizardVolatile";
import { uploadPhotos } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import StepsNav from "@/components/wizard/StepsNav";
import Image from "next/image";

function computeTitle(state: WizardState): string {
  const { details, address } = state;
  if (!details || !address) return "Bien immobilier";
  
  const parts = [];
  if (details.type) parts.push(details.type);
  if (details.surface) parts.push(`${details.surface}m²`);
  if (details.rooms) parts.push(`${details.rooms} pièces`);
  if (address.city) parts.push(address.city);
  
  return parts.join(" - ");
}

function composeDescription(state: WizardState): string {
  const { details, address } = state;
  const parts = [];

  // Original description
  if (details?.description) {
    parts.push(details.description);
  }

  // Address info
  if (address?.addressLabel) {
    parts.push(`\nAdresse : ${address.addressLabel}`);
  }

  // Property characteristics
  const characteristics = [];
  if (details?.furnished) characteristics.push("meublé");
  if (details?.floor !== undefined && details.floor > 0) characteristics.push(`${details.floor}e étage`);
  if (details?.elevator) characteristics.push("avec ascenseur");
  
  if (characteristics.length > 0) {
    parts.push(`\nCaractéristiques : ${characteristics.join(", ")}`);
  }

  // DPE
  if (details?.dpe) {
    parts.push(`\nDPE : ${details.dpe}`);
  }

  // Contact
  const contacts = [];
  if (details?.contactEmail) contacts.push(`Email : ${details.contactEmail}`);
  if (details?.contactPhone) contacts.push(`Téléphone : ${details.contactPhone}`);
  
  if (contacts.length > 0) {
    parts.push(`\nContact :\n${contacts.join("\n")}`);
  }

  return parts.join("\n");
}

export default function RecapStep() {
  const router = useRouter();
  const [wizardState, setWizardState] = useState<WizardState>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    const state = loadWizard();
    setWizardState(state);
    setPhotoFiles(getVolatileFiles());
  }, []);

  const title = computeTitle(wizardState);
  const description = composeDescription(wizardState);
  const totalPrice = (wizardState.pricing?.rent || 0) + (wizardState.pricing?.charges || 0);
  const cityPostal = wizardState.address?.city && wizardState.address?.postalCode 
    ? `${wizardState.address.city} (${wizardState.address.postalCode})`
    : wizardState.address?.city || "";

  const onPublish = async () => {
    if (!wizardState.address || !wizardState.details || !wizardState.pricing) {
      setErr("Données incomplètes. Veuillez vérifier tous les steps.");
      return;
    }

    setLoading(true);
    setErr(undefined);

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Vous devez être connecté pour publier une annonce.");
        setLoading(false);
        return;
      }

      // Insert property into database
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title,
          description,
          price: totalPrice,
          city: wizardState.address.city || "",
          postal_code: wizardState.address.postalCode || "",
          photos: [], // Will be updated after photo upload
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload photos if any
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        const uploadResult = await uploadPhotos(photoFiles, user.id, property.id);
        photoUrls = uploadResult.urls;

        // Update property with photo URLs
        const { error: updateError } = await supabase
          .from("properties")
          .update({ photos: photoUrls })
          .eq("id", property.id);

        if (updateError) throw updateError;
      }

      // Clear wizard state
      clearWizard();
      clearVolatileFiles();

      // Redirect to the new property
      router.push(`/properties/${property.id}`);
    } catch (e: any) {
      setErr(e.message || "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  const onPrev = () => {
    router.push("/wizard/photos");
  };

  const isComplete = wizardState.address && wizardState.details && wizardState.pricing;

  return (
    <main className="container py-10 max-w-4xl">
      <StepsNav />
      <h1 className="text-3xl font-bold">Récapitulatif</h1>
      
      {!isComplete && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Veuillez compléter tous les steps précédents avant de publier.</p>
        </div>
      )}

      {isComplete && (
        <div className="mt-6">
          {/* Preview Card */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            
            {/* Location and Price */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{cityPostal}</p>
              <p className="text-xl font-bold text-blue-600">{totalPrice} €/mois</p>
            </div>

            {/* Photos Grid */}
            {photoFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {photoFiles.slice(0, 6).map((file, index) => (
                  <div key={index} className="aspect-[4/3] relative bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{description}</p>
            </div>

            {/* Details Summary */}
            <div className="mt-6 grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Caractéristiques</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Type : {wizardState.details?.type}</li>
                  <li>Surface : {wizardState.details?.surface}m²</li>
                  <li>Pièces : {wizardState.details?.rooms}</li>
                  {wizardState.details?.furnished && <li>Meublé</li>}
                  {wizardState.details?.floor && <li>Étage : {wizardState.details.floor}</li>}
                  {wizardState.details?.elevator && <li>Ascenseur</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tarifs</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Loyer HC : {wizardState.pricing?.rent}€</li>
                  <li>Charges : {wizardState.pricing?.charges}€</li>
                  <li className="font-medium">Total CC : {totalPrice}€</li>
                </ul>
              </div>
            </div>
          </div>

          {err && <p className="text-red-600 mt-4">{err}</p>}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button type="button" className="btn btn-outline" onClick={onPrev}>
              Précédent
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={onPublish}
              disabled={loading || !isComplete}
            >
              {loading ? "Publication..." : "Publier l'annonce"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}