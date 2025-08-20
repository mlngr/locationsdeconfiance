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

export function getWizard(): WizardState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as WizardState;
  } catch {
    return {};
  }
}

export function saveWizard(patch: Partial<WizardState>) {
  if (typeof window === "undefined") return;
  const current = getWizard();
  const next = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function resetWizard() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}