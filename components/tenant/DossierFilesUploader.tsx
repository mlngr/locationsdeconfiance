"use client";

import { useState, useEffect } from "react";
import { DossierFile, getDossierFiles, uploadDossierFile, deleteDossierFile, submitDossier } from "@/lib/tenant/dossier";

type DossierFilesUploaderProps = {
  dossierId: string;
  userId: string;
  dossierStatus: string;
  onFilesUpdate?: () => void;
  onSubmissionComplete?: (result: { status: string, message: string }) => void;
};

const CATEGORY_LABELS: Record<DossierFile['category'], string> = {
  payslip: "Fiche de paie",
  contract: "Contrat de travail",
  tax_notice: "Avis d'imposition",
  domicile: "Justificatif de domicile",
  other: "Autre document"
};

export default function DossierFilesUploader({ 
  dossierId, 
  userId, 
  dossierStatus,
  onFilesUpdate,
  onSubmissionComplete 
}: DossierFilesUploaderProps) {
  const [files, setFiles] = useState<DossierFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<DossierFile['category']>('payslip');

  useEffect(() => {
    loadFiles();
  }, [dossierId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getDossierFiles(dossierId);
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    try {
      setUploading(true);
      setError(undefined);

      // Upload files one by one
      for (const file of Array.from(fileList)) {
        await uploadDossierFile(file, selectedCategory, dossierId, userId);
      }

      await loadFiles();
      onFilesUpdate?.();
      
      // Clear the input
      e.target.value = '';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteDossierFile(fileId, userId);
      await loadFiles();
      onFilesUpdate?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitDossier = async () => {
    try {
      setSubmitting(true);
      setError(undefined);

      const result = await submitDossier(dossierId);
      onSubmissionComplete?.(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getFilesByCategory = (category: DossierFile['category']) => {
    return files.filter(f => f.category === category);
  };

  const hasRequiredFiles = () => {
    const payslips = getFilesByCategory('payslip');
    const taxNotices = getFilesByCategory('tax_notice');
    return payslips.length > 0 || taxNotices.length > 0;
  };

  const canSubmit = () => {
    return dossierStatus === 'incomplete' && files.length > 0 && hasRequiredFiles();
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des fichiers...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Upload Section */}
      {dossierStatus === 'incomplete' && (
        <div className="space-y-4">
          <h3 className="font-medium">Ajouter des documents</h3>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de document
              </label>
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DossierFile['category'])}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <label className="btn btn-outline cursor-pointer">
              {uploading ? "Upload..." : "Choisir fichier(s)"}
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          </div>
          
          <p className="text-sm text-gray-600">
            Formats acceptés: PDF, JPG, PNG - Maximum 10MB par fichier
          </p>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-4">
        <h3 className="font-medium">Documents ajoutés ({files.length})</h3>
        
        {files.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">
            Aucun document ajouté pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
              const categoryFiles = getFilesByCategory(category as DossierFile['category']);
              if (categoryFiles.length === 0) return null;

              return (
                <div key={category} className="border rounded-xl p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">{label}</h4>
                  <div className="space-y-2">
                    {categoryFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">
                          {file.file_url.split('/').pop()?.split('-').slice(2).join('-') || 'Document'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(file.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          {dossierStatus === 'incomplete' && (
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Requirements Check */}
      <div className="space-y-3">
        <h3 className="font-medium">Exigences du dossier</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center space-x-2 ${hasRequiredFiles() ? 'text-green-600' : 'text-gray-600'}`}>
            <span>{hasRequiredFiles() ? '✓' : '○'}</span>
            <span>Au moins une fiche de paie OU un avis d'imposition</span>
          </div>
        </div>
      </div>

      {/* Submit Section */}
      {canSubmit() && (
        <div className="border-t pt-6">
          <button
            onClick={handleSubmitDossier}
            disabled={submitting || uploading}
            className="btn btn-primary w-full"
          >
            {submitting ? "Soumission en cours..." : "Soumettre le dossier"}
          </button>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Une fois soumis, votre dossier sera automatiquement vérifié.
          </p>
        </div>
      )}

      {!hasRequiredFiles() && files.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
          <p className="text-sm">
            Votre dossier doit contenir au moins une fiche de paie ou un avis d'imposition pour être soumis.
          </p>
        </div>
      )}
    </div>
  );
}