"use client";
import React from 'react';

interface PhotosStepProps {
  value?: FileList | null;
  onChange: (files: FileList | null) => void;
  error?: string;
}

export default function PhotosStep({ value, onChange, error }: PhotosStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ajoutez des photos</h2>
        <p className="mt-2 text-gray-600">
          Les annonces avec photos reçoivent 5 fois plus de vues. Ajoutez jusqu'à 6 photos de qualité.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (JPEG/PNG, max 6) {value && `${value.length}/6`}
        </label>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          className="input"
        />
        {value && value.length > 6 && (
          <p className="text-red-600 text-sm mt-1">Maximum 6 photos autorisées</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📸 Conseils photo</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Prenez des photos en pleine lumière</li>
          <li>• Montrez les pièces principales et points forts</li>
          <li>• Nettoyez et rangez avant de photographier</li>
          <li>• Évitez les objets personnels dans le cadre</li>
        </ul>
      </div>
    </div>
  );
}