"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, saveWizard } from "@/lib/wizardStorage";
import StepsNav from "@/components/wizard/StepsNav";

export default function LoyerStep() {
  const router = useRouter();
  
  // Form state
  const [rent, setRent] = useState<number>(0); // Loyer hors charges
  const [charges, setCharges] = useState<number>(0); // Charges
  const [err, setErr] = useState<string | undefined>();

  // Load existing data
  useEffect(() => {
    const existing = loadWizard();
    if (existing.pricing) {
      setRent(existing.pricing.rent || 0);
      setCharges(existing.pricing.charges || 0);
    }
  }, []);

  // Computed total
  const total = rent + charges;

  const validate = () => {
    if (rent <= 0) {
      setErr("Le loyer hors charges doit être supérieur à 0.");
      return false;
    }
    if (charges < 0) {
      setErr("Les charges ne peuvent pas être négatives.");
      return false;
    }
    return true;
  };

  const onNext = () => {
    setErr(undefined);
    if (!validate()) return;

    // Save to wizard storage
    saveWizard({
      pricing: {
        rent,
        charges,
      },
    });

    router.push("/wizard/photos");
  };

  const onPrev = () => {
    router.push("/wizard/details");
  };

  return (
    <main className="container py-10 max-w-2xl">
      <StepsNav />
      <h1 className="text-3xl font-bold">Loyer</h1>
      <div className="mt-6 grid gap-4">
        {err && <p className="text-red-600">{err}</p>}
        
        {/* Rent */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Loyer hors charges (€) *</label>
          <input
            type="number"
            step={1}
            min={0}
            className="input w-full"
            placeholder="800"
            value={rent || ""}
            onChange={(e) => setRent(Number(e.target.value) || 0)}
            required
          />
        </div>

        {/* Charges */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Charges (€) *</label>
          <input
            type="number"
            step={1}
            min={0}
            className="input w-full"
            placeholder="50"
            value={charges || ""}
            onChange={(e) => setCharges(Number(e.target.value) || 0)}
            required
          />
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total charges comprises :</span>
            <span className="text-xl font-bold text-blue-600">{total} €/mois</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {rent} € + {charges} € de charges
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button type="button" className="btn btn-outline" onClick={onPrev}>
            Précédent
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={rent <= 0}
          >
            Suivant
          </button>
        </div>
      </div>
    </main>
  );
}