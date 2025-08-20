"use client";
import React from 'react';

interface EnergyStepProps {
  value?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  onChange: (rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') => void;
  error?: string;
}

const dpeRatings = [
  { value: 'A' as const, label: 'A', color: 'bg-green-600', description: 'Très économe' },
  { value: 'B' as const, label: 'B', color: 'bg-green-500', description: 'Économe' },
  { value: 'C' as const, label: 'C', color: 'bg-lime-500', description: 'Assez économe' },
  { value: 'D' as const, label: 'D', color: 'bg-yellow-500', description: 'Assez énergivore' },
  { value: 'E' as const, label: 'E', color: 'bg-orange-500', description: 'Énergivore' },
  { value: 'F' as const, label: 'F', color: 'bg-red-500', description: 'Très énergivore' },
  { value: 'G' as const, label: 'G', color: 'bg-red-600', description: 'Extrêmement énergivore' },
];

export default function EnergyStep({ value, onChange, error }: EnergyStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Diagnostic de Performance Énergétique (DPE)</h2>
        <p className="mt-2 text-gray-600">
          Indiquez la classe énergétique de votre bien selon le DPE. Cette information est obligatoire pour les annonces.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
        {dpeRatings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            onClick={() => onChange(rating.value)}
            className={`relative p-4 border-2 rounded-xl text-center transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value === rating.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            aria-pressed={value === rating.value}
          >
            <div className="flex flex-col items-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full ${rating.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              >
                {rating.label}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{rating.description}</p>
              </div>
            </div>
            
            {value === rating.value && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ À propos du DPE</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            Le Diagnostic de Performance Énergétique (DPE) évalue la consommation d'énergie 
            et l'impact en termes d'émissions de gaz à effet de serre.
          </p>
          <p>
            <strong>Classes :</strong> A (très économe) à G (très énergivore)
          </p>
          <p>
            Si vous n'avez pas le DPE, vous pouvez sélectionner une estimation 
            et l'actualiser plus tard avec le diagnostic officiel.
          </p>
        </div>
      </div>
    </div>
  );
}