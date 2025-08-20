"use client";
import React from 'react';

interface DescriptionStepProps {
  value: {
    title?: string;
    description?: string;
  };
  onChange: (data: { title?: string; description?: string }) => void;
  error?: string;
}

export default function DescriptionStep({ value, onChange, error }: DescriptionStepProps) {
  // This is actually the same as CharacteristicsStep - we can reuse it
  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Description détaillée</h2>
        <p className="mt-2 text-gray-600">
          Complétez ou affinez la description de votre bien pour attirer les bons locataires.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de l'annonce *
          </label>
          <input
            id="title"
            type="text"
            value={value.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ex: Bel appartement T3 proche métro"
            className="input"
            required
            maxLength={100}
          />
          <p className="text-sm text-gray-500 mt-1">
            {value.title?.length || 0}/100 caractères
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description complète *
          </label>
          <textarea
            id="description"
            value={value.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Décrivez en détail votre bien : nombre de pièces, superficie, équipements, état, proximités, transports, commerces..."
            className="input min-h-[150px]"
            required
            maxLength={3000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {value.description?.length || 0}/3000 caractères
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">✍️ Rédigez une description qui vend</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Commencez par les points forts (luminosité, calme, vue...)</li>
          <li>• Précisez la superficie et le nombre de pièces</li>
          <li>• Listez les équipements (cuisine équipée, parking, cave...)</li>
          <li>• Mentionnez les transports et commerces proches</li>
          <li>• Indiquez l'état du bien et les travaux récents</li>
          <li>• Évitez les fautes d'orthographe</li>
        </ul>
      </div>
    </div>
  );
}