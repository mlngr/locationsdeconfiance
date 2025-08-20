"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BanAutocomplete, type BanSelection } from "@/components/address/BanAutocomplete";
import { loadWizard, saveWizard, type AddressStepData } from "@/lib/wizardStorage";
import NavBar from "@/components/NavBar";

export default function AdresseStep() {
  const router = useRouter();
  const [addressInput, setAddressInput] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<BanSelection | null>(null);
  const [error, setError] = useState<string | undefined>();

  // Load saved data on mount
  useEffect(() => {
    const wizardState = loadWizard();
    if (wizardState.address) {
      const addr = wizardState.address;
      setAddressInput(addr.addressLabel || "");
      setCity(addr.city || "");
      setPostalCode(addr.postalCode || "");
      if (addr.banId) {
        setSelectedAddress({
          banId: addr.banId,
          banType: addr.banType || "",
          addressLabel: addr.addressLabel || "",
          city: addr.city,
          postalCode: addr.postalCode,
        });
      }
    }
  }, []);

  const handleAddressSelect = (selection: BanSelection) => {
    setSelectedAddress(selection);
    setAddressInput(selection.addressLabel);
    
    // Prefill city and postal code if available
    if (selection.city) {
      setCity(selection.city);
    }
    if (selection.postalCode) {
      setPostalCode(selection.postalCode);
    }
    
    setError(undefined);
  };

  const canProceed = () => {
    if (!selectedAddress) return false;
    
    // If type is municipality or locality and no postcode from BAN, require manual input
    const needsPostalCode = 
      (selectedAddress.banType === "municipality" || selectedAddress.banType === "locality") &&
      !selectedAddress.postalCode;
    
    if (needsPostalCode) {
      return /^\d{5}$/.test(postalCode);
    }
    
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      setError("Veuillez sélectionner une adresse valide et saisir un code postal si nécessaire.");
      return;
    }

    const addressData: AddressStepData = {
      banId: selectedAddress!.banId,
      banType: selectedAddress!.banType,
      addressLabel: selectedAddress!.addressLabel,
      city: city || selectedAddress!.city,
      postalCode: postalCode || selectedAddress!.postalCode,
    };

    // Save to localStorage
    saveWizard({ address: addressData });

    // Navigate to photos step
    router.push("/owner/wizard/photos");
  };

  const showPostalCodeInput = () => {
    if (!selectedAddress) return false;
    
    const needsPostalCode = 
      (selectedAddress.banType === "municipality" || selectedAddress.banType === "locality") &&
      !selectedAddress.postalCode;
    
    return needsPostalCode;
  };

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Créer une annonce - Adresse</h1>
        <p className="text-gray-600 mt-2">
          Sélectionnez l'adresse de votre propriété
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <BanAutocomplete
              value={addressInput}
              onChange={setAddressInput}
              onSelect={handleAddressSelect}
              setError={setError}
              placeholder="Tapez l'adresse de votre propriété..."
              autoFocus
            />
          </div>

          {selectedAddress && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-medium text-green-800">Adresse sélectionnée</h3>
              <p className="text-green-700">{selectedAddress.addressLabel}</p>
              {selectedAddress.city && (
                <p className="text-sm text-green-600">Ville: {selectedAddress.city}</p>
              )}
              {selectedAddress.postalCode && (
                <p className="text-sm text-green-600">Code postal: {selectedAddress.postalCode}</p>
              )}
            </div>
          )}

          {showPostalCodeInput() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal (5 chiffres) *
              </label>
              <input
                type="text"
                className="input"
                placeholder="75001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                pattern="\d{5}"
                maxLength={5}
              />
              <p className="text-sm text-gray-600 mt-1">
                Le code postal est requis pour cette localisation.
              </p>
            </div>
          )}

          {city && selectedAddress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville"
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/properties")}
              className="btn btn-outline flex-1"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`btn flex-1 ${
                canProceed() 
                  ? "btn-primary" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}