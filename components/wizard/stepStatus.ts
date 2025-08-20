import { WizardData } from "@/lib/wizardStorage";

export type StepKey = "adresse" | "photos";

export function computeStepDone(state: WizardData, key: StepKey): boolean {
  switch (key) {
    case "adresse":
      return !!(state.address?.banId);
    case "photos":
      return !!(state.photos?.urls && state.photos.urls.length >= 1);
    default:
      return false;
  }
}

export function getStepStatus(state: WizardData, key: StepKey): "completed" | "active" | "pending" {
  if (computeStepDone(state, key)) {
    return "completed";
  }
  
  // For now, we'll consider the current step as active
  // This could be enhanced with more sophisticated logic
  return "pending";
}