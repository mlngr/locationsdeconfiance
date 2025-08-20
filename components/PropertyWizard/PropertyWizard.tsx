"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadPhotos } from '@/lib/storage';
import { PropertyDraft } from '@/types';
import Stepper, { WizardStep } from './Stepper';
import PropertyTypeStep from './steps/PropertyTypeStep';
import AddressStep from './steps/AddressStep';
import CharacteristicsStep from './steps/CharacteristicsStep';
import EnergyStep from './steps/EnergyStep';
import PhotosStep from './steps/PhotosStep';
import PriceStep from './steps/PriceStep';
import ContactStep from './steps/ContactStep';

const wizardSteps: WizardStep[] = [
  { id: 'type', title: 'Type de bien', description: 'Maison, appartement, parking', isCompleted: false, isActive: false },
  { id: 'address', title: 'Adresse', description: 'Localisation du bien', isCompleted: false, isActive: false },
  { id: 'characteristics', title: 'Caractéristiques', description: 'Titre et description', isCompleted: false, isActive: false },
  { id: 'energy', title: 'Bilan énergétique', description: 'DPE A à G', isCompleted: false, isActive: false },
  { id: 'photos', title: 'Photos', description: 'Images du bien', isCompleted: false, isActive: false },
  { id: 'price', title: 'Prix de location', description: 'Loyer et charges', isCompleted: false, isActive: false },
  { id: 'contact', title: 'Contact', description: 'Vos coordonnées', isCompleted: false, isActive: false }
];

interface PropertyWizardProps {
  draftId?: string;
}

export default function PropertyWizard({ draftId }: PropertyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(wizardSteps);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [propertyData, setPropertyData] = useState<Partial<PropertyDraft>>({});

  // Load existing draft if draftId provided
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  // Update step completion status
  useEffect(() => {
    const updatedSteps = [...steps];
    updatedSteps.forEach((step, index) => {
      step.isActive = index === currentStep;
      step.isCompleted = isStepCompleted(step.id);
      step.hasError = !!errors[step.id];
    });
    setSteps(updatedSteps);
  }, [currentStep, propertyData, errors]);

  const loadDraft = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('is_draft', true)
        .single();

      if (error) throw error;
      if (data) {
        setPropertyData(data);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const isStepCompleted = (stepId: string): boolean => {
    switch (stepId) {
      case 'type':
        return !!propertyData.property_type;
      case 'address':
        return !!(propertyData.address_label && propertyData.address_provider_id);
      case 'characteristics':
        return !!(propertyData.title && propertyData.description);
      case 'energy':
        return !!propertyData.dpe_rating;
      case 'photos':
        return true; // Photos are optional
      case 'price':
        return !!(propertyData.rent_base && propertyData.rent_base > 0);
      case 'contact':
        return !!(propertyData.contact_name && propertyData.contact_email);
      default:
        return false;
    }
  };

  const validateStep = (stepId: string): string | null => {
    switch (stepId) {
      case 'type':
        if (!propertyData.property_type) {
          return 'Veuillez sélectionner un type de bien.';
        }
        break;
      case 'address':
        if (!propertyData.address_label || !propertyData.address_provider_id) {
          return 'Veuillez sélectionner une adresse dans la liste.';
        }
        break;
      case 'characteristics':
        if (!propertyData.title?.trim()) {
          return 'Le titre est obligatoire.';
        }
        if (!propertyData.description?.trim()) {
          return 'La description est obligatoire.';
        }
        break;
      case 'energy':
        if (!propertyData.dpe_rating) {
          return 'Veuillez sélectionner une classe énergétique.';
        }
        break;
      case 'price':
        if (!propertyData.rent_base || propertyData.rent_base <= 0) {
          return 'Le loyer hors charges doit être supérieur à 0.';
        }
        break;
      case 'contact':
        if (!propertyData.contact_name?.trim()) {
          return 'Le nom du contact est obligatoire.';
        }
        if (!propertyData.contact_email?.trim()) {
          return 'L\'email de contact est obligatoire.';
        }
        break;
    }
    return null;
  };

  const saveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Veuillez vous connecter.');

      const draftData = {
        ...propertyData,
        owner_id: user.id,
        is_draft: true,
        // Legacy compatibility
        price: propertyData.rent_base || 0,
        city: propertyData.city || '',
        postal_code: propertyData.postal_code || ''
      };

      if (propertyData.id) {
        // Update existing draft
        const { error } = await supabase
          .from('properties')
          .update(draftData)
          .eq('id', propertyData.id)
          .eq('owner_id', user.id);
        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('properties')
          .insert(draftData)
          .select()
          .single();
        if (error) throw error;
        setPropertyData({ ...propertyData, id: data.id });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleStepChange = (field: string, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this step
    const stepId = steps[currentStep].id;
    if (errors[stepId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[stepId];
        return newErrors;
      });
    }
  };

  const handleNext = async () => {
    const stepId = steps[currentStep].id;
    const error = validateStep(stepId);
    
    if (error) {
      setErrors(prev => ({ ...prev, [stepId]: error }));
      return;
    }

    // Save draft after each valid step
    await saveDraft();
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or the current step
    if (stepIndex <= currentStep || steps[stepIndex].isCompleted) {
      setCurrentStep(stepIndex);
    }
  };

  const handlePublish = async () => {
    // Validate all steps
    const stepErrors: Record<string, string> = {};
    steps.forEach(step => {
      const error = validateStep(step.id);
      if (error) {
        stepErrors[step.id] = error;
      }
    });

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Go to first step with error
      const firstErrorStep = steps.findIndex(step => stepErrors[step.id]);
      if (firstErrorStep !== -1) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Veuillez vous connecter.');

      // Upload photos if any
      let photoUrls: string[] = [];
      if (propertyData.photos_files && propertyData.photos_files.length > 0) {
        const { urls } = await uploadPhotos(Array.from(propertyData.photos_files), user.id, propertyData.id);
        photoUrls = urls;
      }

      // Publish the property
      const publishData = {
        ...propertyData,
        is_draft: false,
        photos: photoUrls,
        // Legacy compatibility
        price: propertyData.rent_base || 0,
        city: propertyData.city || '',
        postal_code: propertyData.postal_code || ''
      };

      const { error } = await supabase
        .from('properties')
        .update(publishData)
        .eq('id', propertyData.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      router.push('/properties');
    } catch (error: any) {
      console.error('Error publishing property:', error);
      setErrors({ general: error.message || 'Erreur lors de la publication' });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepId = steps[currentStep].id;
    const stepError = errors[stepId];

    switch (stepId) {
      case 'type':
        return (
          <PropertyTypeStep
            value={propertyData.property_type}
            onChange={(value) => handleStepChange('property_type', value)}
            error={stepError}
          />
        );
      case 'address':
        return (
          <AddressStep
            value={propertyData}
            onChange={(addressData) => setPropertyData(prev => ({ ...prev, ...addressData }))}
            error={stepError}
          />
        );
      case 'characteristics':
        return (
          <CharacteristicsStep
            value={propertyData}
            onChange={(data) => setPropertyData(prev => ({ ...prev, ...data }))}
            error={stepError}
          />
        );
      case 'energy':
        return (
          <EnergyStep
            value={propertyData.dpe_rating}
            onChange={(value) => handleStepChange('dpe_rating', value)}
            error={stepError}
          />
        );
      case 'photos':
        return (
          <PhotosStep
            value={propertyData.photos_files}
            onChange={(value) => handleStepChange('photos_files', value)}
            error={stepError}
          />
        );
      case 'price':
        return (
          <PriceStep
            value={propertyData}
            onChange={(data) => setPropertyData(prev => ({ ...prev, ...data }))}
            error={stepError}
          />
        );
      case 'contact':
        return (
          <ContactStep
            value={propertyData}
            onChange={(data) => setPropertyData(prev => ({ ...prev, ...data }))}
            error={stepError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Créer une annonce</h1>
        <p className="mt-2 text-gray-600">Suivez les étapes pour créer votre annonce</p>
      </div>

      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderCurrentStep()}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Publication...' : 'Publier l\'annonce'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}