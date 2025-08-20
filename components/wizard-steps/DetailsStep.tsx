"use client";
import { useWizard } from "../WizardContext";

const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'parking', label: 'Parking' },
  { value: 'autre', label: 'Autre' },
];

const DPE_RATINGS = [
  { value: '', label: 'Non renseigné' },
  { value: 'A', label: 'A - Très performant' },
  { value: 'B', label: 'B - Performant' },
  { value: 'C', label: 'C - Assez performant' },
  { value: 'D', label: 'D - Peu performant' },
  { value: 'E', label: 'E - Peu performant' },
  { value: 'F', label: 'F - Très peu performant' },
  { value: 'G', label: 'G - Extrêmement peu performant' },
];

export default function DetailsStep() {
  const { formData, updateFormData } = useWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Décrivez votre bien</h2>
        <p className="text-gray-600">
          Remplissez les informations de base de votre propriété.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de l'annonce *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Ex: Appartement 2 pièces lumineux"
            className="input w-full"
            style={{ fontSize: '16px' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Décrivez votre bien, ses avantages, l'environnement..."
            className="input w-full min-h-[120px] resize-y"
            style={{ fontSize: '16px' }}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de bien *
            </label>
            <select
              value={formData.property_type}
              onChange={(e) => updateFormData({ property_type: e.target.value })}
              className="input w-full"
              style={{ fontSize: '16px' }}
              required
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic DPE
            </label>
            <select
              value={formData.dpe_rating}
              onChange={(e) => updateFormData({ dpe_rating: e.target.value })}
              className="input w-full"
              style={{ fontSize: '16px' }}
            >
              {DPE_RATINGS.map((rating) => (
                <option key={rating.value} value={rating.value}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loyer hors charges (€/mois) *
            </label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => updateFormData({ price: Number(e.target.value) || 0 })}
              placeholder="800"
              min="0"
              step="10"
              className="input w-full"
              style={{ fontSize: '16px' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Charges (€/mois)
            </label>
            <input
              type="number"
              value={formData.charges || ''}
              onChange={(e) => updateFormData({ charges: Number(e.target.value) || 0 })}
              placeholder="50"
              min="0"
              step="10"
              className="input w-full"
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Charges d'immeuble, chauffage, eau, etc.
            </p>
          </div>
        </div>

        {(formData.price > 0 || formData.charges > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">Prix total charges comprises :</span>
              <span className="text-xl font-bold text-blue-900">
                {(formData.price + formData.charges).toLocaleString()} €/mois
              </span>
            </div>
            {formData.charges > 0 && (
              <p className="text-sm text-blue-700 mt-1">
                Loyer : {formData.price.toLocaleString()} € + Charges : {formData.charges.toLocaleString()} €
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}