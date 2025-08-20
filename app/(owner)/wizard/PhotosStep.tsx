"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadWizard, updateWizardPhotos, WizardPhotoData } from "@/lib/wizardStorage";

export default function PhotosStep() {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    const wizardData = loadWizard();
    if (wizardData.photos) {
      setUploadedPhotos(wizardData.photos.urls || []);
    }
  }, []);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    
    // Simulate upload - in real implementation, this would upload to storage
    const simulatedUrls = Array.from(files).map((file, index) => 
      `simulated-url-${Date.now()}-${index}-${file.name}`
    );
    
    const newPhotos = [...uploadedPhotos, ...simulatedUrls];
    setUploadedPhotos(newPhotos);
    
    // Save to localStorage
    updateWizardPhotos({ urls: newPhotos });
    
    setFiles(null);
    setIsLoading(false);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    updateWizardPhotos({ urls: newPhotos });
  };

  const handleNext = () => {
    // In a real implementation, this would navigate to the next step
    router.push("/properties/new");
  };

  const isStepComplete = uploadedPhotos.length >= 1;

  return (
    <div className="container max-w-2xl py-8">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Photos du logement</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter des photos ({uploadedPhotos.length}/6)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="input"
            />
            {files && files.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="btn btn-outline disabled:opacity-50"
                >
                  {isLoading ? "Upload en cours..." : `Ajouter ${files.length} photo(s)`}
                </button>
              </div>
            )}
          </div>

          {uploadedPhotos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Photos ajoutées:</h3>
              <div className="grid grid-cols-3 gap-2">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      Photo {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isStepComplete && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              <p className="font-medium">✓ Étape photos terminée</p>
              <p className="text-sm mt-1">Au moins une photo a été ajoutée.</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/wizard/adresse")}
              className="btn btn-outline"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}