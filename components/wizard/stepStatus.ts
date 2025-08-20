import { WizardState } from "@/lib/wizardStorage";

export type StepKey =
  | "type"
  | "adresse"
  | "caracteristiques"
  | "dpe"
  | "photos"
  | "description"
  | "prix"
  | "contact";

export function computeStepDone(state: WizardState, key: StepKey): boolean {
  switch (key) {
    case "adresse":
      return !!state.address?.banId; // coche verte uniquement si une sélection BAN existe
    case "photos":
      return (state.photos?.length || 0) > 0; // au moins 1 photo
    default:
      return false;
  }
}