"use client";
import { useWizard } from "../WizardContext";

export default function PhotosStep() {
  const { formData, updateFormData } = useWizard();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ files: e.target.files });
  };

  const fileCount = formData.files?.length || 0;
  const isOverLimit = fileCount > 6;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ajoutez des photos</h2>
        <p className="text-gray-600">
          Les photos donnent envie aux locataires de visiter votre bien.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos du logement (max 6)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Cliquez pour choisir des fichiers
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG jusqu'à 10MB chacune
                </p>
              </div>
            </label>
          </div>
        </div>

        {fileCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {fileCount} photo{fileCount > 1 ? 's' : ''} sélectionnée{fileCount > 1 ? 's' : ''}
              </span>
              {isOverLimit && (
                <span className="text-sm text-red-600 font-medium">
                  Limite dépassée (max 6)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from(formData.files || []).map((file, index) => (
                <div 
                  key={index} 
                  className={`
                    relative border rounded-xl p-3 bg-gray-50
                    ${index >= 6 ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  {index >= 6 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isOverLimit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-800 font-medium">Trop de photos sélectionnées</p>
                    <p className="text-sm text-red-700 mt-1">
                      Vous ne pouvez ajouter que 6 photos maximum. Les photos supplémentaires ne seront pas uploadées.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">📸 Conseils pour de bonnes photos</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Prenez des photos bien éclairées, de préférence en journée</li>
            <li>• Montrez les pièces principales : salon, cuisine, chambre, salle de bain</li>
            <li>• Évitez les photos floues ou mal cadrées</li>
            <li>• La première photo sera utilisée comme image principale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}