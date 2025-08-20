"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { loadWizard } from "@/lib/wizardStorage";
import { useState, useEffect } from "react";

export default function PhotosPage() {
  const router = useRouter();
  const [wizardState, setWizardState] = useState(loadWizard());

  useEffect(() => {
    setWizardState(loadWizard());
  }, []);

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Créer une annonce - Photos</h1>
        <p className="text-gray-600 mt-2">
          Ajoutez des photos de votre propriété
        </p>

        <div className="mt-8 space-y-6">
          {/* Address Summary */}
          {wizardState.address && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-800">Adresse confirmée</h3>
              <p className="text-blue-700">{wizardState.address.addressLabel}</p>
              {wizardState.address.postalCode && (
                <p className="text-sm text-blue-600">Code postal: {wizardState.address.postalCode}</p>
              )}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Fonctionnalité en cours de développement</h3>
              <p className="mt-1 text-sm text-gray-500">
                L'ajout de photos sera bientôt disponible
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/owner/wizard/adresse")}
              className="btn btn-outline flex-1"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => router.push("/properties")}
              className="btn btn-primary flex-1"
            >
              Terminer plus tard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}