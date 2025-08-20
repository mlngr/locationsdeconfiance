import type { WizardState } from "@/lib/wizardStorage";

export type WizardStepKey = "adresse" | "photos";

export function computeStepDone(state: WizardState, key: WizardStepKey): boolean {
  if (key === "adresse") {
    return Boolean(state.address?.banId);
  }
  if (key === "photos") {
    return (state.photos?.length ?? 0) >= 1;
  }
  return false;
}