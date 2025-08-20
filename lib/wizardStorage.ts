"use client";

export interface WizardAddressData {
  banId?: string;
  banType?: string;
  addressLabel?: string;
  city?: string;
  postalCode?: string;
}

export interface WizardPhotoData {
  urls: string[];
}

export interface WizardData {
  address?: WizardAddressData;
  photos?: WizardPhotoData;
}

const WIZARD_STORAGE_KEY = "wizard:create-listing";

export function loadWizard(): WizardData {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(WIZARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading wizard data:", error);
    return {};
  }
}

export function saveWizard(data: WizardData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving wizard data:", error);
  }
}

export function clearWizard(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing wizard data:", error);
  }
}

export function updateWizardAddress(addressData: WizardAddressData): void {
  const current = loadWizard();
  saveWizard({
    ...current,
    address: addressData
  });
}

export function updateWizardPhotos(photosData: WizardPhotoData): void {
  const current = loadWizard();
  saveWizard({
    ...current,
    photos: photosData
  });
}