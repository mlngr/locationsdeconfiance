"use client";
import React from 'react';

interface PropertyTypeStepProps {
  value?: 'maison' | 'appartement' | 'parking';
  onChange: (type: 'maison' | 'appartement' | 'parking') => void;
  error?: string;
}

const propertyTypes = [
  {
    value: 'maison' as const,
    label: 'Maison',
    description: 'Maison individuelle, villa, pavillon',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    value: 'appartement' as const,
    label: 'Appartement',
    description: 'Studio, T1, T2, T3, duplex...',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    value: 'parking' as const,
    label: 'Parking',
    description: 'Place de parking, garage, box',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    )
  }
];

export default function PropertyTypeStep({ value, onChange, error }: PropertyTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quel type de bien proposez-vous ?</h2>
        <p className="mt-2 text-gray-600">
          Sélectionnez le type de bien que vous souhaitez mettre en location.
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {propertyTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`relative p-6 border-2 rounded-xl text-center transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value === type.value
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
            aria-pressed={value === type.value}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`${value === type.value ? 'text-blue-600' : 'text-gray-400'}`}>
                {type.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{type.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </div>
            </div>
            
            {value === type.value && (
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
    </div>
  );
}