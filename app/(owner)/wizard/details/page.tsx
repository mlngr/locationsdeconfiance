"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, saveWizard } from "@/lib/wizardStorage";
import NavBar from "@/components/NavBar";

export default function DetailsPage() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("Appartement");
  const [surface, setSurface] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);
  const [furnished, setFurnished] = useState(false);
  const [floor, setFloor] = useState<number | undefined>();
  const [elevator, setElevator] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  // Load data from localStorage after hydration
  useEffect(() => {
    const existing = loadWizard();
    if (existing.details) {
      setPropertyType(existing.details.propertyType);
      setSurface(existing.details.surface);
      setRooms(existing.details.rooms);
      setFurnished(existing.details.furnished);
      setFloor(existing.details.floor);
      setElevator(existing.details.elevator);
    }
  }, []);

  const canContinue = surface > 0 && rooms >= 1;

  function onNext() {
    if (!canContinue) {
      setErr("Veuillez remplir tous les champs obligatoires correctement.");
      return;
    }

    // Sauvegarde avant navigation
    saveWizard({
      details: {
        propertyType,
        surface,
        rooms,
        furnished,
        floor,
        elevator,
      },
    });
    router.push("/wizard/loyer");
  }

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Détails du bien</h1>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de bien *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="input"
              required
            >
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Studio">Studio</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface (m²) *
            </label>
            <input
              type="number"
              value={surface || ""}
              onChange={(e) => setSurface(Number(e.target.value) || 0)}
              className="input"
              min="1"
              step="0.1"
              placeholder="Ex: 45"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de pièces *
            </label>
            <input
              type="number"
              value={rooms || ""}
              onChange={(e) => setRooms(Number(e.target.value) || 1)}
              className="input"
              min="1"
              placeholder="Ex: 3"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="furnished"
              checked={furnished}
              onChange={(e) => setFurnished(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="furnished" className="text-sm font-medium text-gray-700">
              Meublé
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Étage (laisser vide si RDC)
            </label>
            <input
              type="number"
              value={floor ?? ""}
              onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : undefined)}
              className="input"
              min="0"
              placeholder="Ex: 2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="elevator"
              checked={elevator}
              onChange={(e) => setElevator(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="elevator" className="text-sm font-medium text-gray-700">
              Ascenseur
            </label>
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push("/wizard/adresse")}
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