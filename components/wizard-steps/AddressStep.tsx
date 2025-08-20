"use client";
import { useState } from "react";
import { useWizard, updateAddressFromSuggestion } from "../WizardContext";
import AddressAutocomplete, { AddressSuggestion } from "../AddressAutocomplete";

export default function AddressStep() {
  const { formData, updateFormData } = useWizard();
  const [addressError, setAddressError] = useState<string>("");

  const handleAddressChange = (value: string) => {
    // Clear provider ID when manually typing
    if (formData.address_provider_id && value !== formData.address_label) {
      updateFormData({
        address_label: value,
        address_provider_id: '',
        postal_code: '',
        city: '',
        lat: null,
        lng: null,
      });
    } else {
      updateFormData({ address_label: value });
    }
    setAddressError("");
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    updateAddressFromSuggestion(suggestion, updateFormData);
    setAddressError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Où se situe votre bien ?</h2>
        <p className="text-gray-600">
          Commencez à taper votre adresse et sélectionnez-la dans la liste.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse complète *
          </label>
          <AddressAutocomplete
            value={formData.address_label}
            onChange={handleAddressChange}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="Ex: 123 rue de la Paix, 75001 Paris"
            required
            error={addressError}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Utilisez les flèches ↑↓ pour naviguer, Entrée pour sélectionner
          </p>
        </div>

        {formData.address_provider_id && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Adresse validée</span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p><strong>Adresse :</strong> {formData.address_label}</p>
              <p><strong>Code postal :</strong> {formData.postal_code}</p>
              <p><strong>Ville :</strong> {formData.city}</p>
            </div>
          </div>
        )}

        {!formData.address_provider_id && formData.address_label && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Adresse non validée</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Veuillez sélectionner une adresse dans la liste des suggestions pour continuer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Pourquoi valider l'adresse ?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Améliore la visibilité de votre annonce</li>
          <li>• Permet la géolocalisation précise</li>
          <li>• Facilite la recherche pour les locataires</li>
          <li>• Assure la conformité des données</li>
        </ul>
      </div>
    </div>
  );
}