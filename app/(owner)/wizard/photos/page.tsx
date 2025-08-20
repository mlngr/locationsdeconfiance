"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { saveWizard } from "@/lib/wizardStorage";
import { setWizardFiles, getWizardFiles } from "@/lib/wizardVolatile";
import NavBar from "@/components/NavBar";

export default function PhotosPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [err, setErr] = useState<string | undefined>();

  // Load files from volatile storage after hydration
  useEffect(() => {
    const existingFiles = getWizardFiles();
    setSelectedFiles(existingFiles);
  }, []);

  const canContinue = selectedFiles.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    if (fileArray.length > 6) {
      setErr("Vous ne pouvez sélectionner que 6 photos maximum.");
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErr("Seuls les fichiers JPEG, PNG et WebP sont acceptés.");
      return;
    }

    setErr(undefined);
    setSelectedFiles(fileArray);
    setWizardFiles(fileArray);
  }

  function removeFile(index: number) {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setWizardFiles(newFiles);
  }

  function onNext() {
    if (!canContinue) {
      setErr("Veuillez sélectionner au moins une photo.");
      return;
    }

    // Save photo count to localStorage for step status
    saveWizard({
      photosCount: selectedFiles.length,
    });
    
    router.push("/wizard/recap");
  }

  return (
    <main>
      <NavBar />
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold">Photos</h1>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez vos photos (max 6) *
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés : JPEG, PNG, WebP • Taille max par fichier : 10 MB
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Photos sélectionnées ({selectedFiles.length}/6)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => router.push("/wizard/loyer")}
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