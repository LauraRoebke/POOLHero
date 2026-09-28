import React from 'react';
import { Check, Droplets, Compass, TestTube2, AlertCircle, Award } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  completedSteps: number[];
}

interface StepItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { id: 1, label: '1. Volumen & Maße', shortLabel: '1. Volumen', icon: Droplets },
  { id: 2, label: '2. Ausrüstung', shortLabel: '2. Ausrüstung', icon: Compass },
  { id: 3, label: '3. Wasserwerte', shortLabel: '3. Wasserwerte', icon: TestTube2 },
  { id: 4, label: '4. Probleme & Foto', shortLabel: '4. Probleme', icon: AlertCircle },
  { id: 5, label: '5. Ergebnis & Plan', shortLabel: '5. Ergebnis', icon: Award },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick, completedSteps }) => {
  const progressPercent = Math.min(100, Math.max(10, ((currentStep - 1) / 4) * 100));

  return (
    <nav aria-label="Fortschrittsanzeige" className="w-full mb-4 sm:mb-6">
      {/* Sleek, Compact Stepper Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 shadow-xs">
        {/* Mobile Header (minimal height) */}
        <div className="flex items-center justify-between px-2 pb-1.5 sm:hidden text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#1d1f3e]">
            <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
            <span>Schritt {currentStep} von 5:</span>
            <span className="text-[#1aabbb]">{STEPS[currentStep - 1]?.shortLabel}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Continuous Slim Progress Track for Mobile */}
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-1.5 sm:hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1d1f3e] to-[#1aabbb] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps Grid - Low height, clickable segmented pills */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = currentStep === step.id;
            const isClickable = isCompleted || step.id <= currentStep;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                id={`stepper-step-${step.id}`}
                onClick={() => onStepClick(step.id)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-[#1d1f3e] text-white shadow-sm'
                    : isCompleted
                    ? 'bg-slate-50 hover:bg-slate-100 text-[#1d1f3e] cursor-pointer'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 opacity-60'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {/* Step indicator (compact badge or check) */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#1aabbb] text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Name */}
                <span className="truncate hidden md:inline text-xs">
                  {step.shortLabel}
                </span>

                {/* Icon for mobile / tablet when text is hidden */}
                <span className="md:hidden">
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
