"use client";

export type AddressStepData = {
  banId?: string;
  banType?: string;
  addressLabel?: string;
  city?: string;
  postalCode?: string;
};

export type WizardState = {
  address?: AddressStepData;
  photos?: string[];
};

const WIZARD_KEY = "wizard:create-listing";

export function loadWizard(): WizardState {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(WIZARD_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function saveWizard(partial: Partial<WizardState>): void {
  if (typeof window === "undefined") return;
  
  try {
    const current = loadWizard();
    const updated = { ...current, ...partial };
    localStorage.setItem(WIZARD_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function clearWizard(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(WIZARD_KEY);
  } catch {
    // Ignore storage errors
  }
}