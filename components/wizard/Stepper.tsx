"use client";
import { useEffect, useState } from "react";
import { loadWizard, WizardData } from "@/lib/wizardStorage";
import { computeStepDone, StepKey } from "./stepStatus";

interface Step {
  key: StepKey;
  label: string;
  href: string;
}

const steps: Step[] = [
  { key: "adresse", label: "Adresse", href: "/wizard/adresse" },
  { key: "photos", label: "Photos", href: "/wizard/photos" }
];

interface StepperProps {
  currentStep?: StepKey;
}

export default function Stepper({ currentStep }: StepperProps) {
  const [wizardData, setWizardData] = useState<WizardData>({});

  useEffect(() => {
    // Load wizard data and listen for changes
    const loadData = () => {
      setWizardData(loadWizard());
    };
    
    loadData();
    
    // Listen for storage changes to update stepper
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wizard:create-listing") {
        loadData();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically in case of same-tab updates
    const interval = setInterval(loadData, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white border-b">
      <div className="container max-w-4xl py-4">
        <nav className="flex items-center justify-center">
          <ol className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const isCompleted = computeStepDone(wizardData, step.key);
              const isCurrent = currentStep === step.key;
              const isClickable = isCompleted || isCurrent;

              return (
                <li key={step.key} className="flex items-center">
                  {index > 0 && (
                    <div 
                      className={`w-8 h-0.5 mr-8 ${
                        computeStepDone(wizardData, steps[index - 1].key) 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                  
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm ${
                        isCompleted
                          ? "text-green-600 font-medium"
                          : isCurrent
                          ? "text-blue-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-green-600 mt-1">Terminé</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}