"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BanAutocomplete, BanSelection } from "@/components/address/BanAutocomplete";
import { loadWizard, saveWizard } from "@/lib/wizardStorage";

export default function AdresseStep() {
  const router = useRouter();
  const [addressInput, setAddressInput] = useState("");
  const [selected, setSelected] = useState<BanSelection | null>(null);
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [err, setErr] = useState<string | undefined>();

  // Load data from localStorage after hydration
  useEffect(() => {
    const existing = loadWizard();
    if (existing.address) {
      setAddressInput(existing.address.addressLabel ?? "");
      setSelected(existing.address);
      setCity(existing.address.city ?? "");
      setPostalCode(existing.address.postalCode ?? "");
    }
  }, []);

  const needCP = selected && (selected.banType === "municipality" || selected.banType === "locality");
  const canContinue = !!selected?.banId && (!needCP || postalCode.length === 5);

  async function onNext() {
    if (!selected?.banId) {
      setErr("Veuillez sélectionner une adresse dans la liste.");
      return;
    }
    if (needCP && postalCode.length !== 5) {
      setErr("Ajoutez le code postal (5 chiffres) pour continuer.");
      return;
    }
    // Sauvegarde avant navigation
    saveWizard({
      address: {
        banId: selected.banId,
        banType: selected.banType,
        addressLabel: selected.addressLabel,
        city,
        postalCode,
      },
    });
    router.push("/wizard/details");
  }

  return (
    <main className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Adresse</h1>
      <div className="mt-6 grid gap-4">
        {err && <p className="text-red-600">{err}</p>}
        <label className="text-sm text-gray-600">Adresse</label>
        <BanAutocomplete
          value={addressInput}
          onChange={setAddressInput}
          onSelect={(sel) => {
            setSelected(sel);
            setCity(sel.city ?? "");
            setPostalCode(sel.postalCode ?? "");
            setErr(undefined);
          }}
          setError={setErr}
          placeholder="ex. 1 rue de la Paix, Paris ou Paris"
          autoFocus
        />
        <input className="input" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} required />
        <input
          className="input"
          placeholder="Code postal (5 chiffres)"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          pattern="\d{5}"
        />
        <div className="flex justify-between mt-4">
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>
            Précédent
          </button>
          <button type="button" className="btn btn-primary" onClick={onNext} disabled={!canContinue}>
            Suivant
          </button>
        </div>
      </div>
    </main>
  );
}