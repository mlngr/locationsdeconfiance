"use client";
import React from 'react';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  hasError?: boolean;
}

interface StepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Étapes de création" className="mb-8">
      <ol className="space-y-4 md:space-y-0 md:space-x-8 md:flex">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && (step.isCompleted || index <= currentStep);
          
          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pt-4 md:pb-0 md:pl-0 ${
                  isCurrent
                    ? 'border-blue-600'
                    : step.isCompleted
                    ? 'border-green-600'
                    : step.hasError
                    ? 'border-red-600'
                    : 'border-gray-200'
                } ${isClickable ? 'cursor-pointer hover:border-gray-400' : ''}`}
                onClick={() => isClickable && onStepClick(index)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(index);
                  }
                }}
              >
                <span className="text-sm font-medium">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mr-3 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : step.isCompleted
                        ? 'bg-green-600 text-white'
                        : step.hasError
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : step.hasError ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`${
                      isCurrent
                        ? 'text-blue-600'
                        : step.isCompleted
                        ? 'text-green-600'
                        : step.hasError
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </span>
                <span className="text-sm text-gray-500">{step.description}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}