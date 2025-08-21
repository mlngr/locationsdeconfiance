"use client";

import { useState } from "react";
import { uploadAndVerifyIdentity } from "@/lib/tenant/identity";
import { TenantProfile } from "@/lib/tenant/profile";

type IdentitySectionProps = {
  userId: string;
  profile: TenantProfile | null;
  onVerificationComplete?: () => void;
};

export default function IdentitySection({ userId, profile, onVerificationComplete }: IdentitySectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const handleIdentityUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(undefined);

      await uploadAndVerifyIdentity(file, userId);
      onVerificationComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending_review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Identité vérifiée';
      case 'pending_review': return 'En cours de vérification';
      default: return 'Non vérifiée';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✓';
      case 'pending_review': return '⏳';
      default: return '⚠️';
    }
  };

  const isVerified = profile?.identity_status === 'verified';

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Status Display */}
      <div className={`p-4 rounded-xl border ${getStatusColor(profile?.identity_status || 'unverified')}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getStatusIcon(profile?.identity_status || 'unverified')}</span>
          <span className="font-medium">{getStatusText(profile?.identity_status || 'unverified')}</span>
        </div>
        {profile?.identity_status === 'verified' && (
          <p className="text-sm mt-2">
            Votre identité a été vérifiée. Les propriétaires peuvent maintenant vous faire confiance.
          </p>
        )}
        {profile?.identity_status === 'unverified' && (
          <p className="text-sm mt-2">
            Ajoutez une pièce d'identité pour rassurer les propriétaires et augmenter vos chances d'obtenir un logement.
          </p>
        )}
      </div>

      {/* Upload Section */}
      {!isVerified && (
        <div className="space-y-3">
          <h4 className="font-medium">Ajouter une pièce d'identité</h4>
          <p className="text-sm text-gray-600">
            Carte d'identité, passeport, ou permis de conduire (PDF, JPG, PNG)
          </p>
          
          <label className="btn btn-primary cursor-pointer inline-flex">
            {uploading ? "Upload en cours..." : "Choisir un fichier"}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleIdentityUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          
          <p className="text-xs text-gray-500">
            Format acceptés: PDF, JPG, PNG - Maximum 5MB
          </p>
        </div>
      )}

      {/* Already Verified */}
      {isVerified && (
        <div className="space-y-3">
          <h4 className="font-medium text-green-700">Identité vérifiée</h4>
          <p className="text-sm text-gray-600">
            Votre pièce d'identité a été vérifiée avec succès. Vous n'avez pas besoin d'en ajouter une nouvelle.
          </p>
        </div>
      )}
    </div>
  );
}