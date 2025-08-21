import { WizardState } from "@/lib/wizardStorage";

export type StepKey =
  | "adresse"
  | "details"
  | "loyer"
  | "photos"
  | "recap";

export function computeStepDone(state: WizardState, key: StepKey): boolean {
  switch (key) {
    case "adresse":
      return !!state.address?.banId; // coche verte uniquement si une sélection BAN existe
    case "details":
      return !!(state.details?.type && state.details?.surface && state.details?.rooms);
    case "loyer":
      return !!(state.pricing?.rent && state.pricing?.charges !== undefined);
    case "photos":
      return (state.photos?.length || 0) > 0; // au moins 1 photo
    case "recap":
      return false; // Always incomplete until published
    default:
      return false;
  }
}