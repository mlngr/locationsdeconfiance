"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, saveWizard } from "@/lib/wizardStorage";
import NavBar from "@/components/NavBar";

export default function LoyerPage() {
  const router = useRouter();
  const [rent, setRent] = useState<number>(0);
  const [charges, setCharges] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [err, setErr] = useState<string | undefined>();

  // Load data from localStorage after hydration
  useEffect(() => {
    const existing = loadWizard();
    if (existing.loyer) {
      setRent(existing.loyer.rent);
      setCharges(existing.loyer.charges);
      setDeposit(existing.loyer.deposit);
    }
  }, []);

  const canContinue = rent >= 0 && charges >= 0 && deposit >= 0;
  const total = rent + charges;

  function onNext() {
    if (!canContinue) {
      setErr("Tous les montants doivent être supérieurs ou égaux à 0.");
      return;
    }

    // Sauvegarde avant navigation
    saveWizard({
      loyer: {
        rent,
        charges,
        deposit,
      },
    });
    router.push("/wizard/photos");
  }

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Loyer et charges</h1>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loyer hors charges (€/mois) *
            </label>
            <input
              type="number"
              value={rent || ""}
              onChange={(e) => setRent(Number(e.target.value) || 0)}
              className="input"
              min="0"
              step="0.01"
              placeholder="Ex: 800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charges (€/mois) *
            </label>
            <input
              type="number"
              value={charges || ""}
              onChange={(e) => setCharges(Number(e.target.value) || 0)}
              className="input"
              min="0"
              step="0.01"
              placeholder="Ex: 50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dépôt de garantie (€) *
            </label>
            <input
              type="number"
              value={deposit || ""}
              onChange={(e) => setDeposit(Number(e.target.value) || 0)}
              className="input"
              min="0"
              step="0.01"
              placeholder="Ex: 800"
              required
            />
          </div>

          {rent > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Récapitulatif</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Loyer hors charges:</span>
                  <span>{rent.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Charges:</span>
                  <span>{charges.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                  <span>Total charges comprises (CC):</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push("/wizard/details")}
            >
              Retour
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={!canContinue}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}