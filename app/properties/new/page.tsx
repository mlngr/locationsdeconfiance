"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { uploadPhotos } from "@/lib/storage";
import NavBar from "@/components/NavBar";
import { WizardProvider, useWizard, WIZARD_STEPS } from "@/components/WizardContext";
import WizardStepper from "@/components/WizardStepper";
import WizardActionBar from "@/components/WizardActionBar";
import AddressStep from "@/components/wizard-steps/AddressStep";
import DetailsStep from "@/components/wizard-steps/DetailsStep";
import PhotosStep from "@/components/wizard-steps/PhotosStep";
import ReviewStep from "@/components/wizard-steps/ReviewStep";

function PropertyWizard() {
  const { currentStep, formData, resetWizard } = useWizard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  // Server-side validation of BAN address
  const validateAddressWithBAN = async (providerId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(providerId)}&limit=1`
      );
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.features && data.features.length > 0 && 
             data.features[0].properties.id === providerId;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(undefined);

    try {
      // Server-side validation of address
      if (!formData.address_provider_id) {
        throw new Error("Veuillez sélectionner une adresse valide.");
      }

      const isValidAddress = await validateAddressWithBAN(formData.address_provider_id);
      if (!isValidAddress) {
        throw new Error("L'adresse sélectionnée n'est plus valide. Veuillez en choisir une autre.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous connecter.");

      // First create the property without photos
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          city: formData.city,
          postal_code: formData.postal_code,
          // Store additional fields as JSON for now, update schema later
          address_label: formData.address_label,
          charges: formData.charges,
          property_type: formData.property_type,
          dpe_rating: formData.dpe_rating,
          lat: formData.lat,
          lng: formData.lng,
          photos: []
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Then upload photos with the property ID (limit to 6)
      let photos: string[] = [];
      if (formData.files && formData.files.length > 0 && property) {
        const filesToUpload = Array.from(formData.files).slice(0, 6);
        const { urls } = await uploadPhotos(filesToUpload, user.id, property.id);
        photos = urls;

        // Update the property with the photo URLs
        const { error: updateError } = await supabase
          .from("properties")
          .update({ photos })
          .eq("id", property.id);

        if (updateError) throw updateError;
      }

      // Clear wizard data and redirect
      resetWizard();
      router.push("/properties");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la publication");
      
      // If address validation failed, focus on address field
      if (e.message.includes("adresse")) {
        // Scroll to top and focus address step
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Could add specific focus handling here
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'address':
        return <AddressStep />;
      case 'details':
        return <DetailsStep />;
      case 'photos':
        return <PhotosStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ minHeight: '100dvh' }}>
      <NavBar />
      
      {/* Mobile stepper header */}
      <WizardStepper />
      
      <div className="flex-1 flex">
        {/* Desktop sidebar stepper */}
        <div className="hidden md:block w-80">
          <WizardStepper />
        </div>
        
        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-800 font-medium">Erreur</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {renderCurrentStep()}
          </div>
        </main>
      </div>
      
      {/* Mobile action bar */}
      <WizardActionBar onSubmit={handleSubmit} isSubmitting={loading} />
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <WizardProvider>
      <PropertyWizard />
    </WizardProvider>
  );
}
