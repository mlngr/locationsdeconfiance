// Persistance client minimale pour garantir la sauvegarde avant navigation.

export type AddressStepData = {
  banId: string;
  banType: string;
  addressLabel: string;
  city?: string;
  postalCode?: string;
};

export type DetailsStepData = {
  propertyType: string; // Appartement, Maison, Studio, Autre
  surface: number; // m², > 0
  rooms: number; // >= 1
  furnished: boolean;
  floor?: number; // >= 0 or empty if RDC
  elevator: boolean;
};

export type LoyerStepData = {
  rent: number; // >= 0
  charges: number; // >= 0
  deposit: number; // >= 0
};

export type WizardState = {
  address?: AddressStepData;
  details?: DetailsStepData;
  loyer?: LoyerStepData;
  photosCount?: number; // For step status, actual files in wizardVolatile
  photos?: string[]; // URLs uploadées (final step)
};

const KEY = "wizard:create-listing";

export function loadWizard(): WizardState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWizard(partial: Partial<WizardState>) {
  const curr = loadWizard();
  const next = { ...curr, ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearWizard() {
  localStorage.removeItem(KEY);
}