import { WizardState } from "@/lib/wizardStorage";

export type StepKey = "adresse" | "photos";

export function computeStepDone(state: WizardState, key: StepKey): boolean {
  switch (key) {
    case "adresse":
      return Boolean(state.address?.banId);
    case "photos":
      return Boolean(state.photos && state.photos.length >= 1);
    default:
      return false;
  }
}