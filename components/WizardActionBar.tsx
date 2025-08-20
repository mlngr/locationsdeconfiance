"use client";
import { useWizard, WIZARD_STEPS } from "./WizardContext";

interface WizardActionBarProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function WizardActionBar({ 
  onSubmit, 
  isSubmitting = false,
  className = "" 
}: WizardActionBarProps) {
  const { currentStep, nextStep, prevStep, canProceed } = useWizard();
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep && onSubmit) {
      onSubmit();
    } else {
      nextStep();
    }
  };

  return (
    <div className={`
      sticky bottom-0 bg-white border-t shadow-lg 
      ${className}
    `}
    style={{ 
      paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      paddingLeft: 'max(1rem, env(safe-area-inset-left))',
      paddingRight: 'max(1rem, env(safe-area-inset-right))',
    }}>
      <div className="container flex gap-3 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
          className="
            btn btn-outline flex-1 min-h-[44px] 
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-manipulation
          "
        >
          {isFirstStep ? 'Annuler' : 'Retour'}
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="
            btn btn-primary flex-2 min-h-[44px]
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-manipulation
          "
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publication...
            </span>
          ) : isLastStep ? (
            'Publier'
          ) : (
            'Continuer'
          )}
        </button>
      </div>
    </div>
  );
}