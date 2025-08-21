"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadWizard, saveWizard } from "@/lib/wizardStorage";
import StepsNav from "@/components/wizard/StepsNav";

const PROPERTY_TYPES = [
  "Appartement",
  "Maison",
  "Studio",
  "Loft",
  "Duplex",
  "Autre"
];

const DPE_GRADES = ["A", "B", "C", "D", "E", "F", "G"] as const;

export default function DetailsStep() {
  const router = useRouter();
  
  // Form state
  const [type, setType] = useState("");
  const [surface, setSurface] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);
  const [furnished, setFurnished] = useState(false);
  const [floor, setFloor] = useState<number>(0);
  const [elevator, setElevator] = useState(false);
  const [description, setDescription] = useState("");
  const [dpe, setDpe] = useState<"A" | "B" | "C" | "D" | "E" | "F" | "G" | "">("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [err, setErr] = useState<string | undefined>();

  // Load existing data
  useEffect(() => {
    const existing = loadWizard();
    if (existing.details) {
      const d = existing.details;
      setType(d.type || "");
      setSurface(d.surface || 0);
      setRooms(d.rooms || 1);
      setFurnished(d.furnished || false);
      setFloor(d.floor || 0);
      setElevator(d.elevator || false);
      setDescription(d.description || "");
      setDpe(d.dpe || "");
      setContactEmail(d.contactEmail || "");
      setContactPhone(d.contactPhone || "");
    }
  }, []);

  const validate = () => {
    if (!type) {
      setErr("Veuillez sélectionner le type de bien.");
      return false;
    }
    if (surface <= 0) {
      setErr("La surface doit être supérieure à 0.");
      return false;
    }
    if (rooms < 1) {
      setErr("Le nombre de pièces doit être d'au moins 1.");
      return false;
    }
    return true;
  };

  const onNext = () => {
    setErr(undefined);
    if (!validate()) return;

    // Save to wizard storage
    saveWizard({
      details: {
        type,
        surface,
        rooms,
        furnished,
        floor: floor || undefined,
        elevator,
        description: description || undefined,
        dpe: dpe || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
      },
    });

    router.push("/wizard/loyer");
  };

  const onPrev = () => {
    router.push("/wizard/adresse");
  };

  return (
    <main className="container py-10 max-w-2xl">
      <StepsNav />
      <h1 className="text-3xl font-bold">Détails du bien</h1>
      <div className="mt-6 grid gap-4">
        {err && <p className="text-red-600">{err}</p>}
        
        {/* Type */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Type de bien *</label>
          <select 
            className="input w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Sélectionnez un type</option>
            {PROPERTY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Surface */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Surface (m²) *</label>
          <input
            type="number"
            step={1}
            min={1}
            className="input w-full"
            value={surface || ""}
            onChange={(e) => setSurface(Number(e.target.value) || 0)}
            required
          />
        </div>

        {/* Rooms */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Nombre de pièces *</label>
          <input
            type="number"
            step={1}
            min={1}
            className="input w-full"
            value={rooms || ""}
            onChange={(e) => setRooms(Number(e.target.value) || 1)}
            required
          />
        </div>

        {/* Furnished */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="furnished"
            checked={furnished}
            onChange={(e) => setFurnished(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="furnished" className="text-sm text-gray-600">Meublé</label>
        </div>

        {/* Floor */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Étage (optionnel)</label>
          <input
            type="number"
            step={1}
            min={0}
            className="input w-full"
            value={floor || ""}
            onChange={(e) => setFloor(Number(e.target.value) || 0)}
          />
        </div>

        {/* Elevator */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="elevator"
            checked={elevator}
            onChange={(e) => setElevator(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="elevator" className="text-sm text-gray-600">Ascenseur</label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Description</label>
          <textarea
            className="input w-full"
            rows={4}
            placeholder="Décrivez votre bien..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* DPE */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">DPE (Diagnostic de Performance Énergétique)</label>
          <div className="flex gap-2">
            {DPE_GRADES.map(grade => (
              <button
                key={grade}
                type="button"
                onClick={() => setDpe(dpe === grade ? "" : grade)}
                className={`px-3 py-2 rounded font-medium transition ${
                  dpe === grade
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email de contact</label>
            <input
              type="email"
              className="input w-full"
              placeholder="contact@exemple.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Téléphone de contact</label>
            <input
              type="tel"
              className="input w-full"
              placeholder="01 23 45 67 89"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button type="button" className="btn btn-outline" onClick={onPrev}>
            Précédent
          </button>
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Suivant
          </button>
        </div>
      </div>
    </main>
  );
}