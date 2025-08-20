"use client";
import React from 'react';

interface CharacteristicsStepProps {
  value: {
    title?: string;
    description?: string;
  };
  onChange: (data: { title?: string; description?: string }) => void;
  error?: string;
}

export default function CharacteristicsStep({ value, onChange, error }: CharacteristicsStepProps) {
  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Décrivez votre bien</h2>
        <p className="mt-2 text-gray-600">
          Donnez un titre accrocheur et décrivez les caractéristiques de votre bien.
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
            Description *
          </label>
          <textarea
            id="description"
            value={value.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Décrivez votre bien : nombre de pièces, superficie, équipements, proximités..."
            className="input min-h-[120px]"
            required
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {value.description?.length || 0}/2000 caractères
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Conseils pour une bonne annonce</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mentionnez le nombre de pièces et la superficie</li>
          <li>• Décrivez les équipements (cuisine équipée, parking, etc.)</li>
          <li>• Indiquez les transports et commerces à proximité</li>
          <li>• Soyez précis et honnête dans votre description</li>
        </ul>
      </div>
    </div>
  );
}