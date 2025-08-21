// Persistance client minimale pour garantir la sauvegarde avant navigation.

export type AddressStepData = {
  banId: string;
  banType: string;
  addressLabel: string;
  city?: string;
  postalCode?: string;
};

export type DetailsStepData = {
  type?: string;
  surface?: number;
  rooms?: number;
  furnished?: boolean;
  floor?: number;
  elevator?: boolean;
  description?: string;
  dpe?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  contactEmail?: string;
  contactPhone?: string;
};

export type PricingStepData = {
  rent?: number; // Loyer hors charges
  charges?: number; // Charges
  // Note: deposit removed as per requirements
};

export type WizardState = {
  address?: AddressStepData;
  details?: DetailsStepData;
  pricing?: PricingStepData;
  photos?: string[]; // URLs uploadées
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