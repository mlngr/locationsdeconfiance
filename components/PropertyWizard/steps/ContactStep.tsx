"use client";
import React from 'react';

interface ContactStepProps {
  value: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  };
  onChange: (data: { contact_name?: string; contact_email?: string; contact_phone?: string }) => void;
  error?: string;
  userProfile?: {
    email?: string;
    name?: string;
    phone?: string;
  };
}

export default function ContactStep({ value, onChange, error, userProfile }: ContactStepProps) {
  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  // Pre-fill from user profile if empty
  React.useEffect(() => {
    if (userProfile && (!value.contact_email || !value.contact_name)) {
      onChange({
        contact_name: value.contact_name || userProfile.name || '',
        contact_email: value.contact_email || userProfile.email || '',
        contact_phone: value.contact_phone || userProfile.phone || ''
      });
    }
  }, [userProfile, value, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Informations de contact</h2>
        <p className="mt-2 text-gray-600">
          Ces informations seront visibles par les locataires intéressés pour vous contacter.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom du contact *
          </label>
          <input
            id="contact_name"
            type="text"
            value={value.contact_name || ''}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            placeholder="Votre nom ou le nom de l'agence"
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="contact_email"
            type="email"
            value={value.contact_email || ''}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            placeholder="contact@example.com"
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            id="contact_phone"
            type="tel"
            value={value.contact_phone || ''}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            placeholder="06 12 34 56 78"
            className="input"
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">✅ Prêt à publier !</h3>
        <p className="text-sm text-green-700">
          Votre annonce est prête à être publiée. Vous pourrez la modifier à tout moment 
          depuis votre tableau de bord.
        </p>
      </div>
    </div>
  );
}