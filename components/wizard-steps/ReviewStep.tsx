"use client";
import { useWizard } from "../WizardContext";

export default function ReviewStep() {
  const { formData } = useWizard();
  
  const totalRent = formData.price + formData.charges;
  const fileCount = formData.files?.length || 0;

  const getDpeColor = (rating: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-500',
      B: 'bg-green-400', 
      C: 'bg-yellow-400',
      D: 'bg-yellow-500',
      E: 'bg-orange-400',
      F: 'bg-orange-500',
      G: 'bg-red-500',
    };
    return colors[rating] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vérifiez votre annonce</h2>
        <p className="text-gray-600">
          Relisez les informations avant de publier votre annonce.
        </p>
      </div>

      <div className="space-y-6">
        {/* Address Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Localisation
          </h3>
          <div className="space-y-2">
            <p className="text-gray-900">{formData.address_label}</p>
            <p className="text-sm text-gray-600">
              {formData.postal_code} {formData.city}
            </p>
          </div>
        </div>

        {/* Property Details Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Détails du bien
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{formData.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
              
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Type :</span> <span className="capitalize">{formData.property_type}</span></p>
                {formData.dpe_rating && (
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">DPE :</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-white text-xs font-medium ${getDpeColor(formData.dpe_rating)}`}>
                      {formData.dpe_rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3">Tarification</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyer hors charges :</span>
                    <span className="font-medium">{formData.price.toLocaleString()} €</span>
                  </div>
                  {formData.charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charges :</span>
                      <span className="font-medium">{formData.charges.toLocaleString()} €</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total CC :</span>
                    <span className="font-bold text-lg">{totalRent.toLocaleString()} €/mois</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photos
          </h3>
          <div className="flex items-center">
            <span className="text-gray-600">
              {fileCount > 0 ? (
                <>
                  {Math.min(fileCount, 6)} photo{Math.min(fileCount, 6) > 1 ? 's' : ''} sélectionnée{Math.min(fileCount, 6) > 1 ? 's' : ''}
                  {fileCount > 6 && (
                    <span className="text-red-600 ml-2">
                      ({fileCount - 6} photo{fileCount - 6 > 1 ? 's' : ''} en trop, {fileCount - 6 > 1 ? 'elles' : 'elle'} ne {fileCount - 6 > 1 ? 'seront' : 'sera'} pas uploadée{fileCount - 6 > 1 ? 's' : ''})
                    </span>
                  )}
                </>
              ) : (
                'Aucune photo sélectionnée'
              )}
            </span>
          </div>
        </div>

        {/* Publication Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-800 mb-2">📝 Après publication</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Votre annonce sera visible immédiatement</li>
            <li>• Vous pourrez la modifier depuis votre dashboard</li>
            <li>• Les locataires intéressés pourront vous contacter</li>
            <li>• Vous recevrez des notifications par email</li>
          </ul>
        </div>
      </div>
    </div>
  );
}