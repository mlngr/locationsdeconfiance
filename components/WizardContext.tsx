"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { AddressSuggestion } from "@/components/AddressAutocomplete";

export interface PropertyFormData {
  // Address step
  address_provider_id: string;
  address_label: string;
  postal_code: string;
  city: string;
  lat: number | null;
  lng: number | null;
  
  // Details step
  title: string;
  description: string;
  price: number;
  charges: number;
  property_type: string;
  dpe_rating: string;
  
  // Photos step
  files: FileList | null;
}

export interface WizardStep {
  id: string;
  label: string;
  isValid: (data: PropertyFormData) => boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'address',
    label: 'Adresse',
    isValid: (data) => Boolean(data.address_provider_id && data.address_label && data.postal_code && data.city)
  },
  {
    id: 'details',
    label: 'Détails',
    isValid: (data) => Boolean(data.title && data.description && data.price > 0)
  },
  {
    id: 'photos',
    label: 'Photos',
    isValid: () => true // Photos are optional
  },
  {
    id: 'review',
    label: 'Vérification',
    isValid: () => true
  }
];

interface WizardContextType {
  currentStep: number;
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isStepValid: (stepIndex: number) => boolean;
  canProceed: () => boolean;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

const INITIAL_FORM_DATA: PropertyFormData = {
  address_provider_id: '',
  address_label: '',
  postal_code: '',
  city: '',
  lat: null,
  lng: null,
  title: '',
  description: '',
  price: 0,
  charges: 0,
  property_type: 'appartement',
  dpe_rating: '',
  files: null,
};

const STORAGE_KEY = 'property_wizard_data';

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData({ ...INITIAL_FORM_DATA, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load wizard data from localStorage:', error);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.warn('Failed to save wizard data to localStorage:', error);
    }
  }, [formData]);

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step);
    }
  };

  const isStepValid = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= WIZARD_STEPS.length) return false;
    return WIZARD_STEPS[stepIndex].isValid(formData);
  };

  const canProceed = () => {
    return isStepValid(currentStep);
  };

  const resetWizard = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear wizard data from localStorage:', error);
    }
  };

  return (
    <WizardContext.Provider value={{
      currentStep,
      formData,
      updateFormData,
      nextStep,
      prevStep,
      goToStep,
      isStepValid,
      canProceed,
      resetWizard,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

// Helper to update address from BAN suggestion
export function updateAddressFromSuggestion(
  suggestion: AddressSuggestion,
  updateFormData: (updates: Partial<PropertyFormData>) => void
) {
  updateFormData({
    address_provider_id: suggestion.properties.id,
    address_label: suggestion.properties.label,
    postal_code: suggestion.properties.postcode,
    city: suggestion.properties.city,
    lat: suggestion.geometry.coordinates[1], // BAN returns [lng, lat]
    lng: suggestion.geometry.coordinates[0],
  });
}