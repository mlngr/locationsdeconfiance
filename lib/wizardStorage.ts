// Persistance client minimale pour garantir la sauvegarde avant navigation.

export type AddressStepData = {
  banId: string;
  banType: string;
  addressLabel: string;
  city?: string;
  postalCode?: string;
};

export type WizardState = {
  address?: AddressStepData;
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