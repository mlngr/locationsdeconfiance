"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getVolatileFiles, setVolatileFiles } from "@/lib/wizardVolatile";
import StepsNav from "@/components/wizard/StepsNav";
import Image from "next/image";

export default function PhotosStep() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    // Load existing files from volatile storage
    setFiles(getVolatileFiles());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (newFiles.length > 6) {
        setErr("Vous ne pouvez uploader que 6 photos maximum.");
        return;
      }
      setErr(undefined);
      setFiles(newFiles);
      setVolatileFiles(newFiles); // Store in volatile storage
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setVolatileFiles(newFiles);
  };

  const onNext = () => {
    if (files.length === 0) {
      setErr("Veuillez ajouter au moins une photo.");
      return;
    }
    router.push("/wizard/recap");
  };

  const onPrev = () => {
    router.push("/wizard/loyer");
  };

  return (
    <main className="container py-10 max-w-2xl">
      <StepsNav />
      <h1 className="text-3xl font-bold">Photos</h1>
      <div className="mt-6 grid gap-4">
        {err && <p className="text-red-600">{err}</p>}
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Photos du bien (JPEG/PNG, max 6) {files.length > 0 && `${files.length}/6`}
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange}
            className="input w-full"
          />
          {files.length > 6 && (
            <p className="text-red-600 text-sm mt-1">Maximum 6 photos autorisées</p>
          )}
        </div>

        {/* Photo Previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <div className="aspect-[4/3] relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button type="button" className="btn btn-outline" onClick={onPrev}>
            Précédent
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={files.length === 0}
          >
            Suivant
          </button>
        </div>
      </div>
    </main>
  );
}