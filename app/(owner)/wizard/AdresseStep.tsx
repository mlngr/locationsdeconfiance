"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BanAutocomplete, { BanSelectPayload } from "@/components/address/BanAutocomplete";
import { getWizard, saveWizard } from "@/lib/wizardStorage";

type Selected = BanSelectPayload | null;

export default function AdresseStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<Selected>(null);
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const st = getWizard();
    if (st.address?.banId) {
      const a = st.address;
      setSelected({
        banId: a.banId,
        banType: a.banType,
        addressLabel: a.addressLabel,
        city: a.city,
        postalCode: a.postalCode,
      });
      setCity(a.city ?? "");
      setPostalCode(a.postalCode ?? "");
    }
  }, []);

  function onSelectAddress(v: BanSelectPayload) {
    setSelected(v);
    setCity(v.city ?? "");
    setPostalCode(v.postalCode ?? "");
    setError(undefined);
  }

  const requiresPostal = useMemo(() => {
    if (!selected) return false;
    const t = selected.banType;
    const missing = !postalCode || postalCode.trim().length !== 5;
    const isPlace = t === "municipality" || t === "locality";
    return isPlace && !selected.postalCode && missing;
  }, [selected, postalCode]);

  const canNext = useMemo(() => {
    if (!selected) return false;
    if (requiresPostal) return false;
    return true;
  }, [selected, requiresPostal]);

  function onNext() {
    if (!canNext || !selected) {
      setError(
        "Veuillez sélectionner une adresse valide et compléter le code postal si nécessaire."
      );
      return;
    }
    const cp = postalCode?.trim() || selected.postalCode || "";
    const data = {
      banId: selected.banId,
      banType: selected.banType,
      addressLabel: selected.addressLabel,
      city: city || selected.city,
      postalCode: cp || undefined,
    };
    saveWizard({ address: data });
    router.push("/wizard/photos");
  }

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Adresse du logement</h1>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Adresse</label>
        <BanAutocomplete onSelect={onSelectAddress} setError={setError} />
        {selected?.addressLabel && (
          <p className="mt-2 text-sm text-gray-600">Sélection: {selected.addressLabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">Ville</label>
          <input
            className="input input-bordered w-full"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Code postal</label>
          <input
            className="input input-bordered w-full"
            value={postalCode}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 5);
              setPostalCode(v);
            }}
            placeholder="75000"
            inputMode="numeric"
            maxLength={5}
          />
          {requiresPostal && (
            <p className="mt-1 text-xs text-red-600">Code postal requis (5 chiffres).</p>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button className="btn btn-outline" type="button" onClick={() => history.back()}>
          Annuler
        </button>
        <button
          className={`btn btn-primary ${!canNext ? "btn-disabled opacity-60" : ""}`}
          type="button"
          onClick={onNext}
          disabled={!canNext}
        >
          Suivant
        </button>
      </div>
    </main>
  );
}