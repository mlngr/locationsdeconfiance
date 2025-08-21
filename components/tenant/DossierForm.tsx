"use client";

import { useState, useEffect } from "react";
import { RentalDossier, getRentalDossier, createRentalDossier, updateRentalDossier } from "@/lib/tenant/dossier";

type DossierFormProps = {
  userId: string;
  onDossierUpdate?: (dossier: RentalDossier) => void;
};

export default function DossierForm({ userId, onDossierUpdate }: DossierFormProps) {
  const [dossier, setDossier] = useState<RentalDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [employmentStart, setEmploymentStart] = useState("");
  const [dependentsCount, setDependentsCount] = useState("");

  useEffect(() => {
    loadDossier();
  }, [userId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      let data = await getRentalDossier(userId);
      
      // Create dossier if it doesn't exist
      if (!data) {
        data = await createRentalDossier(userId);
      }
      
      setDossier(data);
      
      // Populate form with existing data
      setMonthlyIncome(data.monthly_income?.toString() || "");
      setEmploymentType(data.employment_type || "");
      setEmploymentStart(data.employment_start || "");
      setDependentsCount(data.dependents_count?.toString() || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier) return;

    try {
      setSaving(true);
      setError(undefined);

      const updatedDossier = await updateRentalDossier(dossier.id, {
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        employment_type: employmentType || undefined,
        employment_start: employmentStart || undefined,
        dependents_count: dependentsCount ? parseInt(dependentsCount) : undefined,
      });

      setDossier(updatedDossier);
      onDossierUpdate?.(updatedDossier);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto_validated': return 'text-green-600 bg-green-50 border-green-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'auto_validated': return 'Dossier validé';
      case 'submitted': return 'Dossier soumis';
      case 'rejected': return 'Dossier rejeté';
      default: return 'Dossier incomplet';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Status Display */}
      {dossier && (
        <div className={`p-4 rounded-xl border ${getStatusColor(dossier.status)}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{getStatusText(dossier.status)}</span>
            <span className="text-sm">
              Mis à jour le {new Date(dossier.updated_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Income Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revenus mensuels (€)
            </label>
            <input
              type="number"
              className="input"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="2500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'emploi
            </label>
            <select
              className="input"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">Sélectionner</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="freelance">Freelance</option>
              <option value="student">Étudiant</option>
              <option value="retired">Retraité</option>
              <option value="unemployed">Demandeur d'emploi</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début d'emploi
            </label>
            <input
              type="date"
              className="input"
              value={employmentStart}
              onChange={(e) => setEmploymentStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de personnes à charge
            </label>
            <input
              type="number"
              className="input"
              value={dependentsCount}
              onChange={(e) => setDependentsCount(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? "Enregistrement..." : "Enregistrer les informations"}
        </button>
      </form>
    </div>
  );
}