"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RentalDossier } from "@/lib/tenant/dossier";
import DossierForm from "@/components/tenant/DossierForm";
import DossierFilesUploader from "@/components/tenant/DossierFilesUploader";

export default function DossierPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>();
  const [dossier, setDossier] = useState<RentalDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionResult, setSubmissionResult] = useState<{ status: string, message: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        router.replace("/");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    })();
  }, [router]);

  const handleDossierUpdate = (updatedDossier: RentalDossier) => {
    setDossier(updatedDossier);
  };

  const handleSubmissionComplete = (result: { status: string, message: string }) => {
    setSubmissionResult(result);
    setDossier(prev => prev ? { ...prev, status: result.status as any } : null);
  };

  const handleFilesUpdate = () => {
    // This can be used to trigger any necessary updates when files change
  };

  if (loading) {
    return <div className="container py-12 text-center">Chargement...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mon Dossier de Location</h1>
      
      {/* Submission Result */}
      {submissionResult && (
        <div className={`p-4 rounded-xl border mb-8 ${
          submissionResult.status === 'auto_validated' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p className="font-medium">
            {submissionResult.status === 'auto_validated' ? '✓ Dossier validé !' : '⚠️ Dossier rejeté'}
          </p>
          <p className="text-sm mt-1">{submissionResult.message}</p>
        </div>
      )}
      
      <div className="grid gap-8">
        {/* Dossier Info Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Informations du dossier</h2>
          <DossierForm 
            userId={userId}
            onDossierUpdate={handleDossierUpdate}
          />
        </div>

        {/* Files Section */}
        {dossier && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pièces justificatives</h2>
            <DossierFilesUploader
              dossierId={dossier.id}
              userId={userId}
              dossierStatus={dossier.status}
              onFilesUpdate={handleFilesUpdate}
              onSubmissionComplete={handleSubmissionComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}