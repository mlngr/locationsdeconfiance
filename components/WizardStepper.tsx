"use client";
import { useWizard, WIZARD_STEPS } from "./WizardContext";

interface WizardStepperProps {
  className?: string;
}

export default function WizardStepper({ className = "" }: WizardStepperProps) {
  const { currentStep, goToStep, isStepValid } = useWizard();

  return (
    <>
      {/* Mobile: Horizontal progress header */}
      <div className={`md:hidden bg-white border-b ${className}`}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Étape {currentStep + 1}/{WIZARD_STEPS.length}
            </h2>
            <span className="text-sm text-gray-600">
              {WIZARD_STEPS[currentStep].label}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop: Sidebar stepper */}
      <div className={`hidden md:block bg-gray-50 border-r ${className}`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Nouvelle annonce</h2>
          
          <nav className="space-y-1">
            {WIZARD_STEPS.map((step, index) => {
              const isCurrent = index === currentStep;
              const isCompleted = index < currentStep;
              const isValid = isStepValid(index);
              const canNavigate = isCompleted || index <= currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => canNavigate && goToStep(index)}
                  disabled={!canNavigate}
                  className={`
                    w-full flex items-center p-3 rounded-xl text-left transition-colors
                    ${isCurrent 
                      ? 'bg-blue-50 border-2 border-blue-200 text-blue-700' 
                      : isCompleted 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }
                    ${!canNavigate ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center">
                    <div 
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCurrent 
                          ? 'bg-blue-500 text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <div className="font-medium">{step.label}</div>
                      {isCurrent && !isValid && (
                        <div className="text-xs text-red-600 mt-1">
                          Remplissez tous les champs requis
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}