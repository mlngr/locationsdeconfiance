"use client";
import React from 'react';

interface PriceStepProps {
  value: {
    rent_base?: number;
    rent_charges?: number;
  };
  onChange: (data: { rent_base?: number; rent_charges?: number }) => void;
  error?: string;
}

export default function PriceStep({ value, onChange, error }: PriceStepProps) {
  const handleChange = (field: string, newValue: string) => {
    const numValue = parseFloat(newValue) || 0;
    onChange({
      ...value,
      [field]: numValue
    });
  };

  const rentBase = value.rent_base || 0;
  const rentCharges = value.rent_charges || 0;
  const rentTotal = rentBase + rentCharges;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Prix de location</h2>
        <p className="mt-2 text-gray-600">
          Indiquez le loyer hors charges et le montant des charges. Le total sera calculé automatiquement.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rent_base" className="block text-sm font-medium text-gray-700 mb-2">
            Loyer hors charges *
          </label>
          <div className="relative">
            <input
              id="rent_base"
              type="number"
              min="0"
              step="0.01"
              value={value.rent_base || ''}
              onChange={(e) => handleChange('rent_base', e.target.value)}
              placeholder="800"
              className="input pr-8"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">€</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="rent_charges" className="block text-sm font-medium text-gray-700 mb-2">
            Charges
          </label>
          <div className="relative">
            <input
              id="rent_charges"
              type="number"
              min="0"
              step="0.01"
              value={value.rent_charges || ''}
              onChange={(e) => handleChange('rent_charges', e.target.value)}
              placeholder="100"
              className="input pr-8"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loyer charges comprises</h3>
            <p className="text-sm text-gray-600">Montant affiché aux locataires</p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {rentTotal.toFixed(2)} €<span className="text-lg text-gray-500">/mois</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loyer :</span>
              <span className="font-medium">{rentBase.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Charges :</span>
              <span className="font-medium">{rentCharges.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💰 À propos des charges</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Charges :</strong> copropriété, chauffage, eau, internet...</p>
          <p>• <strong>Charges forfaitaires :</strong> montant fixe mensuel</p>
          <p>• <strong>Charges au réel :</strong> régularisation annuelle</p>
        </div>
      </div>
    </div>
  );
}