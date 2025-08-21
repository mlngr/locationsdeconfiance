"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loadWizard, WizardState } from "@/lib/wizardStorage";

export type WizardStep = {
  key: string;
  label: string;
  path: string;
};

const WIZARD_STEPS: WizardStep[] = [
  { key: "adresse", label: "Adresse", path: "/wizard/adresse" },
  { key: "details", label: "Détails", path: "/wizard/details" },
  { key: "loyer", label: "Loyer", path: "/wizard/loyer" },
  { key: "photos", label: "Photos", path: "/wizard/photos" },
  { key: "recap", label: "Récapitulatif", path: "/wizard/recap" },
];

function computeStepComplete(state: WizardState, stepKey: string): boolean {
  switch (stepKey) {
    case "adresse":
      return !!state.address?.banId;
    case "details":
      return !!(state.details?.type && state.details?.surface && state.details?.rooms);
    case "loyer":
      return !!(state.pricing?.rent && state.pricing?.charges !== undefined);
    case "photos":
      return (state.photos?.length || 0) > 0;
    case "recap":
      return false; // Always incomplete until published
    default:
      return false;
  }
}

function canAccessStep(state: WizardState, stepIndex: number): boolean {
  // Can access current step and any completed previous steps
  for (let i = 0; i < stepIndex; i++) {
    if (!computeStepComplete(state, WIZARD_STEPS[i].key)) {
      return false;
    }
  }
  return true;
}

export default function StepsNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [wizardState, setWizardState] = useState<WizardState>({});

  useEffect(() => {
    setWizardState(loadWizard());
  }, [pathname]); // Reload when path changes

  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.path === pathname);

  return (
    <nav className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        {WIZARD_STEPS.map((step, index) => {
          const isComplete = computeStepComplete(wizardState, step.key);
          const isCurrent = index === currentStepIndex;
          const canAccess = canAccessStep(wizardState, index);
          const isAccessible = canAccess || isCurrent;

          return (
            <button
              key={step.key}
              onClick={() => {
                if (isAccessible) {
                  router.push(step.path);
                }
              }}
              disabled={!isAccessible}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isCurrent
                  ? "border-blue-500 text-blue-600"
                  : isComplete
                  ? "border-green-500 text-green-600 hover:text-green-800"
                  : isAccessible
                  ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  : "border-transparent text-gray-300 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center">
                {isComplete && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}