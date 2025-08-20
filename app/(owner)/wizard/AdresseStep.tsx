"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BanAutocomplete, { BanSuggestion } from "@/components/address/BanAutocomplete";
import { loadWizard, updateWizardAddress, WizardAddressData } from "@/lib/wizardStorage";

export default function AdresseStep() {
  const router = useRouter();
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<WizardAddressData | null>(null);
  const [manualPostalCode, setManualPostalCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    const wizardData = loadWizard();
    if (wizardData.address) {
      setSelectedAddress(wizardData.address);
      setAddressQuery(wizardData.address.addressLabel || "");
      setManualPostalCode(wizardData.address.postalCode || "");
    }
  }, []);

  const handleAddressSelect = (suggestion: BanSuggestion) => {
    const addressData: WizardAddressData = {
      banId: suggestion.banId,
      banType: suggestion.banType,
      addressLabel: suggestion.addressLabel,
      city: suggestion.city,
      postalCode: suggestion.postalCode
    };
    
    setSelectedAddress(addressData);
    setAddressQuery(suggestion.addressLabel);
    setManualPostalCode(suggestion.postalCode || "");
    
    // Clear error when address is selected
    setError(undefined);
  };

  const isValidSelection = (): boolean => {
    if (!selectedAddress?.banId) return false;
    
    // If selection is municipality or locality and no postal code, require manual postal code
    if ((selectedAddress.banType === "municipality" || selectedAddress.banType === "locality") 
        && !selectedAddress.postalCode && !manualPostalCode) {
      return false;
    }
    
    // Validate manual postal code format if provided
    if (manualPostalCode && !/^\d{5}$/.test(manualPostalCode)) {
      return false;
    }
    
    return true;
  };

  const handleNext = async () => {
    if (!isValidSelection()) {
      if (!selectedAddress?.banId) {
        setError("Veuillez sélectionner une adresse.");
      } else if ((selectedAddress.banType === "municipality" || selectedAddress.banType === "locality") 
                 && !selectedAddress.postalCode && !manualPostalCode) {
        setError("Veuillez saisir un code postal.");
      } else if (manualPostalCode && !/^\d{5}$/.test(manualPostalCode)) {
        setError("Le code postal doit contenir exactement 5 chiffres.");
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare final address data
      const finalAddressData: WizardAddressData = {
        ...selectedAddress,
        postalCode: selectedAddress?.postalCode || manualPostalCode
      };
      
      // Save to localStorage
      updateWizardAddress(finalAddressData);
      
      // Navigate to next step (photos)
      router.push("/wizard/photos");
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const needsManualPostalCode = selectedAddress && 
    (selectedAddress.banType === "municipality" || selectedAddress.banType === "locality") && 
    !selectedAddress.postalCode;

  return (
    <div className="container max-w-2xl py-8">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Adresse du logement</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher une adresse
            </label>
            <BanAutocomplete
              value={addressQuery}
              onChange={setAddressQuery}
              onSelect={handleAddressSelect}
              placeholder="Tapez une adresse, une rue, ou une ville..."
              className="input"
            />
          </div>

          {selectedAddress && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              <h3 className="font-medium">Adresse sélectionnée</h3>
              <p className="text-sm mt-1">{selectedAddress.addressLabel}</p>
              <p className="text-sm">{selectedAddress.city}</p>
              {selectedAddress.postalCode && (
                <p className="text-sm">Code postal: {selectedAddress.postalCode}</p>
              )}
              <p className="text-xs mt-1 text-green-600">Type: {selectedAddress.banType}</p>
            </div>
          )}

          {needsManualPostalCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal (requis)
              </label>
              <input
                type="text"
                value={manualPostalCode}
                onChange={(e) => setManualPostalCode(e.target.value)}
                placeholder="00000"
                pattern="\d{5}"
                className="input"
                maxLength={5}
              />
              <p className="text-sm text-gray-600 mt-1">
                Veuillez saisir le code postal à 5 chiffres.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValidSelection() || isLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {isLoading ? "Enregistrement..." : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}