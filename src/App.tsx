import React, { useState } from 'react';
import { 
  PoolFinderState, 
  PoolDimensions, 
  WaterValues, 
} from './types';
import { calculateVolume } from './utils/calculator';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { Step1Volume } from './components/Step1Volume';
import { Step2Equipment } from './components/Step2Equipment';
import { Step3WaterValues } from './components/Step3WaterValues';
import { Step4Problems } from './components/Step4Problems';
import { Step5Results } from './components/Step5Results';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

const INITIAL_DIMENSIONS: PoolDimensions = {
  length: 6,
  width: 3.5,
  depth: 1.4,
  diameter: 4,
};

const INITIAL_WATER_VALUES: WaterValues = {
  ph: 7.6,
  freeChlorine: 0.2,
  totalChlorine: 0.6,
  cyanuricAcid: 30,
  saltLevel: 3.2,
  redox: 680,
  activeOxygen: 4.5,
  waterTemp: 25,
  bromine: 2.5,
  waterHardness: 14,
};

const DEFAULT_STATE: PoolFinderState = {
  currentStep: 1,
  inputMode: 'calculator',
  shape: 'rectangle',
  dimensions: INITIAL_DIMENSIONS,
  volumeM3: calculateVolume('rectangle', INITIAL_DIMENSIONS),
  location: 'outdoor',
  environment: 'light_trees',
  filterType: 'sand',
  cover: 'solar',
  covers: ['solar'],
  disinfectionMethod: 'chlorine',
  waterValues: INITIAL_WATER_VALUES,
  autoDosing: {
    autoPh: false,
    autoChlorine: false,
    autoSalt: false,
  },
  selectedProblems: ['green_water'],
  notes: '',
  photo: null,
};

const STEP_TITLES: Record<number, string> = {
  1: 'Beckenvolumen',
  2: 'Ausrüstung',
  3: 'Wasserwerte',
  4: 'Auffälligkeiten',
  5: 'Ergebnis',
};

const NEXT_LABELS: Record<number, string> = {
  1: 'Weiter zu Ausrüstung',
  2: 'Weiter zu Wasserwerte',
  3: 'Weiter zu Auffälligkeiten',
  4: 'Auswertung berechnen',
};

export default function App() {
  const [state, setState] = useState<PoolFinderState>(DEFAULT_STATE);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  const markStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(stepNum)) {
        return [...prev, stepNum];
      }
      return prev;
    });
  };

  const goToStep = (stepNum: number) => {
    setState((prev) => ({ ...prev, currentStep: stepNum }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep = (currentStep: number) => {
    markStepComplete(currentStep);
    goToStep(currentStep + 1);
  };

  const handleStartFresh = () => {
    setState(DEFAULT_STATE);
    setCompletedSteps([1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isNextDisabled = state.currentStep === 1 && (!state.volumeM3 || state.volumeM3 <= 0);

  return (
    <div className="min-h-screen bg-[#ebf2f7] flex flex-col selection:bg-[#1aabbb]/20 selection:text-[#1d1f3e]">
      {/* App Header */}
      <Header onRestart={handleStartFresh} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-24">
        {/* Clickable Compact Stepper Header */}
        <div className="no-print">
          <Stepper
            currentStep={state.currentStep}
            onStepClick={goToStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Step Views */}
        <div>
          {state.currentStep === 1 && (
            <Step1Volume
              inputMode={state.inputMode}
              shape={state.shape}
              dimensions={state.dimensions}
              volumeM3={state.volumeM3}
              onChangeInputMode={(mode) => setState((p) => ({ ...p, inputMode: mode }))}
              onChangeShape={(shape) => setState((p) => ({ ...p, shape }))}
              onChangeDimensions={(dims) => setState((p) => ({ ...p, dimensions: dims }))}
              onChangeVolume={(vol) => setState((p) => ({ ...p, volumeM3: vol }))}
              onNext={() => handleNextFromStep(1)}
            />
          )}

          {state.currentStep === 2 && (
            <Step2Equipment
              location={state.location}
              environment={state.environment}
              filterType={state.filterType}
              covers={state.covers || (state.cover ? [state.cover] : ['solar'])}
              onChangeLocation={(location) => setState((p) => ({ ...p, location }))}
              onChangeEnvironment={(environment) => setState((p) => ({ ...p, environment }))}
              onChangeFilterType={(filterType) => setState((p) => ({ ...p, filterType }))}
              onChangeCovers={(covers) => setState((p) => ({ ...p, covers, cover: covers[0] || 'none' }))}
              onBack={() => goToStep(1)}
              onNext={() => handleNextFromStep(2)}
            />
          )}

          {state.currentStep === 3 && (
            <Step3WaterValues
              disinfectionMethod={state.disinfectionMethod}
              waterValues={state.waterValues}
              autoDosing={state.autoDosing}
              onChangeMethod={(disinfectionMethod) => setState((p) => ({ ...p, disinfectionMethod }))}
              onChangeValues={(waterValues) => setState((p) => ({ ...p, waterValues }))}
              onChangeAutoDosing={(autoDosing) => setState((p) => ({ ...p, autoDosing }))}
              onBack={() => goToStep(2)}
              onNext={() => handleNextFromStep(3)}
            />
          )}

          {state.currentStep === 4 && (
            <Step4Problems
              selectedProblems={state.selectedProblems}
              notes={state.notes}
              photo={state.photo}
              onToggleProblem={(problemId) => {
                setState((prev) => {
                  const exists = prev.selectedProblems.includes(problemId);
                  if (problemId === 'routine_maintenance') {
                    return {
                      ...prev,
                      selectedProblems: exists ? [] : ['routine_maintenance'],
                    };
                  } else {
                    const withoutRoutine = prev.selectedProblems.filter((id) => id !== 'routine_maintenance');
                    const nextProblems = exists
                      ? withoutRoutine.filter((id) => id !== problemId)
                      : [...withoutRoutine, problemId];
                    return { ...prev, selectedProblems: nextProblems };
                  }
                });
              }}
              onChangeNotes={(notes) => setState((p) => ({ ...p, notes }))}
              onPhotoUpload={(photo) => setState((p) => ({ ...p, photo }))}
              onBack={() => goToStep(3)}
              onNext={() => handleNextFromStep(4)}
            />
          )}

          {state.currentStep === 5 && (
            <Step5Results
              state={state}
              onRestart={handleStartFresh}
              onEditStep={(step) => goToStep(step)}
            />
          )}
        </div>
      </main>

      {/* Sticky Action Bar (Eigenständiger Bedienbereich mit Farbverlauf Dunkles Navy → Türkis) */}
      <aside aria-label="Schritt-Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#161836] via-[#1b2f44] to-[#12616d] text-white shadow-[0_-8px_32px_rgba(15,23,42,0.28)] border-t border-white/10 no-print py-3 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left / Info: Optional Zurück button + Status & Volumen */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {state.currentStep > 1 && (
              <button
                type="button"
                id="sticky-nav-back-btn"
                onClick={() => goToStep(state.currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap border border-white/15 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline">Zurück</span>
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white tracking-wide">
                <span className="text-cyan-300 font-extrabold">✓ Schritt {state.currentStep} von 5</span>
                <span className="text-white/40">·</span>
                <span className="text-slate-100 font-semibold truncate">{STEP_TITLES[state.currentStep]}</span>
              </div>
              <div className="text-xs sm:text-sm text-cyan-100/90 font-medium flex items-center gap-1.5 mt-0.5 tabular-nums">
                <span>
                  {state.volumeM3 > 0
                    ? `${Math.round(state.volumeM3 * 1000).toLocaleString('de-DE')} Liter · ${state.volumeM3.toLocaleString('de-DE')} m³`
                    : 'Beckenvolumen wird eingetragen'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Weiter Action Button */}
          <div className="flex items-center shrink-0">
            {state.currentStep < 5 ? (
              <button
                type="button"
                id="sticky-nav-next-btn"
                onClick={() => handleNextFromStep(state.currentStep)}
                disabled={isNextDisabled}
                className="group relative inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-base font-extrabold text-[#161836] bg-white hover:bg-cyan-50 shadow-lg hover:shadow-cyan-400/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
              >
                <span>{NEXT_LABELS[state.currentStep]}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#159ba9] group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                id="sticky-nav-restart-btn"
                onClick={handleStartFresh}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-cyan-300" />
                <span>Neue Analyse starten</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Informations- und Copyright-Footer (Getrennt von der Navigation) */}
      <footer className="mt-8 mb-24 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-600">
            PoolHero • Der Helfer bei Pool-Problemen
          </p>
          <p className="text-[11px] text-slate-400">
            Interaktive Diagnose und Dosierhilfe für kristallklares Poolwasser. Alle Angaben ohne Gewähr.
          </p>
        </div>
      </footer>
    </div>
  );
}
