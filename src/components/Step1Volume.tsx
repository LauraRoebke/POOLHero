import React, { useState, useEffect } from 'react';
import { PoolShape, PoolDimensions } from '../types';
import { calculateVolume } from '../utils/calculator';
import { 
  Calculator, 
  Info, 
  Check,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Step1Props {
  inputMode?: 'calculator' | 'direct';
  shape: PoolShape;
  dimensions: PoolDimensions;
  volumeM3: number;
  onChangeInputMode?: (mode: 'calculator' | 'direct') => void;
  onChangeShape: (shape: PoolShape) => void;
  onChangeDimensions: (dims: PoolDimensions) => void;
  onChangeVolume: (vol: number) => void;
  onNext?: () => void;
}

const SHAPE_OPTIONS: { id: PoolShape; name: string; iconShape: string }[] = [
  {
    id: 'rectangle',
    name: 'Rechteck',
    iconShape: 'w-6 h-4 border-2 border-current rounded-xs',
  },
  {
    id: 'round',
    name: 'Rund',
    iconShape: 'w-5 h-5 border-2 border-current rounded-full',
  },
  {
    id: 'oval',
    name: 'Oval',
    iconShape: 'w-6 h-4 border-2 border-current rounded-full',
  },
  {
    id: 'eight',
    name: 'Achtform',
    iconShape: 'flex items-center -space-x-0.5',
  },
];

const PRESET_LITERS = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

export const Step1Volume: React.FC<Step1Props> = ({
  shape,
  dimensions,
  volumeM3,
  onChangeShape,
  onChangeDimensions,
  onChangeVolume,
}) => {
  const currentLiters = Math.round((volumeM3 || 0) * 1000);
  const [literInput, setLiterInput] = useState<string>(currentLiters > 0 ? String(currentLiters) : '');
  const [showCalculatorSection, setShowCalculatorSection] = useState<boolean>(true);

  // Sync internal text input when volumeM3 changes externally
  useEffect(() => {
    const liters = Math.round((volumeM3 || 0) * 1000);
    setLiterInput(liters > 0 ? String(liters) : '');
  }, [volumeM3]);

  const handleLiterInputChange = (rawVal: string) => {
    setLiterInput(rawVal);
    const parsed = parseInt(rawVal.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const m3 = Math.round((parsed / 1000) * 100) / 100;
      onChangeVolume(m3);
    } else if (rawVal === '') {
      onChangeVolume(0);
    }
  };

  const handleSelectPreset = (liters: number) => {
    setLiterInput(String(liters));
    onChangeVolume(liters / 1000);
  };

  const handleDimChange = (field: keyof PoolDimensions, value: number) => {
    const nextDims = {
      ...dimensions,
      [field]: Math.max(0, value),
    };
    onChangeDimensions(nextDims);
    const newVol = calculateVolume(shape, nextDims);
    onChangeVolume(newVol);
    setLiterInput(newVol > 0 ? String(Math.round(newVol * 1000)) : '');
  };

  const handleShapeSelect = (newShape: PoolShape) => {
    onChangeShape(newShape);
    const newVol = calculateVolume(newShape, dimensions);
    onChangeVolume(newVol);
    setLiterInput(newVol > 0 ? String(Math.round(newVol * 1000)) : '');
  };

  const calculatedM3FromDims = calculateVolume(shape, dimensions);
  const calculatedLitersFromDims = Math.round(calculatedM3FromDims * 1000);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* 1. Haupt-Arbeitsbereich: Bekanntes Beckenvolumen direkt eingeben */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#159ba9]">
              Schritt 1 von 5
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Beckenvolumen eingeben
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grundlage für Auswertung und Dosierungen.
          </p>
        </div>

        {/* Direkteingabe in Litern mit integrierter m³-Anzeige */}
        <div className="space-y-4">
          <div>
            <div className="relative max-w-lg">
              <input
                type="text"
                inputMode="numeric"
                id="input-pool-liters"
                value={literInput}
                onChange={(e) => handleLiterInputChange(e.target.value)}
                placeholder="z. B. 30.000 Liter"
                className="w-full text-xl sm:text-2xl font-black bg-slate-50 focus:bg-white rounded-xl px-4 py-3.5 text-[#1d1f3e] focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-36 shadow-2xs tabular-nums"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs sm:text-sm font-bold pointer-events-none select-none">
                <span className="text-slate-400">Liter</span>
                <span className="text-slate-300">|</span>
                <span className="text-[#159ba9] font-mono">
                  {volumeM3 > 0 ? `${volumeM3.toLocaleString('de-DE')} m³` : '— m³'}
                </span>
              </div>
            </div>

            {/* Automatische Umrechnung in m³ & kompakter Hinweis */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Automatische Umrechnung:</span>
                <strong className="text-[#159ba9] font-mono text-sm">
                  ≈ {volumeM3 > 0 ? volumeM3.toLocaleString('de-DE') : '0'} m³
                </strong>
              </div>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-400">
                1 m³ entspricht 1.000 Litern Poolwasser.
              </span>
            </div>
          </div>

          {/* Häufige Poolgrößen zur Schnellauswahl */}
          <div className="pt-1">
            <span className="block text-xs font-bold text-slate-600 mb-2">
              Schnellauswahl:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_LITERS.map((liters) => {
                const isSelected = currentLiters === liters;
                return (
                  <button
                    key={liters}
                    type="button"
                    onClick={() => handleSelectPreset(liters)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1d1f3e] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {liters.toLocaleString('de-DE')} L
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visuelle Ergebnisdarstellung direkt unterhalb der Eingabe */}
        {volumeM3 > 0 && (
          <div className="bg-gradient-to-r from-[#171938] via-[#1b2b40] to-[#125863] text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/15">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span>
                  <span>Beckenvolumen ermittelt</span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums">
                    {currentLiters.toLocaleString('de-DE')} Liter
                  </span>
                  <span className="text-sm font-semibold text-cyan-100/80">
                    ≈ {volumeM3.toLocaleString('de-DE')} m³
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Separater Bereich unterhalb: Beckenvolumen nicht bekannt? Volumen berechnen */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-[#159ba9]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Beckenvolumen nicht bekannt? Volumen berechnen
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCalculatorSection(!showCalculatorSection)}
            className="text-xs font-bold text-slate-500 hover:text-[#159ba9] flex items-center gap-1 p-1 cursor-pointer transition-colors"
          >
            <span>{showCalculatorSection ? 'Einklappen' : 'Ausklappen'}</span>
            {showCalculatorSection ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {showCalculatorSection && (
          <div className="space-y-5 pt-1">
            {/* 1. Beckenform */}
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Beckenform wählen:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHAPE_OPTIONS.map((item) => {
                  const isSelected = shape === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`shape-${item.id}-btn`}
                      onClick={() => handleShapeSelect(item.id)}
                      className={`p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1aabbb]/10 text-[#159ba9] ring-2 ring-[#1aabbb]/40 shadow-xs font-bold'
                          : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#1d1f3e] shadow-2xs">
                        {item.id === 'eight' ? (
                          <div className="flex items-center -space-x-0.5 opacity-90">
                            <div className="w-2 h-3.5 border-2 border-current rounded-full" />
                            <div className="w-2 h-3.5 border-2 border-current rounded-full" />
                          </div>
                        ) : (
                          <div className={item.iconShape} />
                        )}
                      </div>
                      <span className="text-xs truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Maßeingaben */}
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Beckenmaße eingeben (in Meter):
              </span>

              {shape === 'round' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  <div>
                    <label htmlFor="input-calc-diameter" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                      Durchmesser (Ø)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-calc-diameter"
                        min="0.5"
                        max="25"
                        step="0.1"
                        value={dimensions.diameter || ''}
                        onChange={(e) => handleDimChange('diameter', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-8 shadow-2xs"
                        placeholder="z. B. 4.0"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-calc-depth-round" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                      Wassertiefe
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-calc-depth-round"
                        min="0.3"
                        max="3.5"
                        step="0.05"
                        value={dimensions.depth || ''}
                        onChange={(e) => handleDimChange('depth', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-8 shadow-2xs"
                        placeholder="z. B. 1.4"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                  <div>
                    <label htmlFor="input-calc-length" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                      Länge
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-calc-length"
                        min="1"
                        max="50"
                        step="0.1"
                        value={dimensions.length || ''}
                        onChange={(e) => handleDimChange('length', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-8 shadow-2xs"
                        placeholder="z. B. 6.0"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-calc-width" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                      Breite
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-calc-width"
                        min="1"
                        max="25"
                        step="0.1"
                        value={dimensions.width || ''}
                        onChange={(e) => handleDimChange('width', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-8 shadow-2xs"
                        placeholder="z. B. 3.5"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-calc-depth" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                      Wassertiefe
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-calc-depth"
                        min="0.3"
                        max="3.5"
                        step="0.05"
                        value={dimensions.depth || ''}
                        onChange={(e) => handleDimChange('depth', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden pr-8 shadow-2xs"
                        placeholder="z. B. 1.4"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Info className="w-3.5 h-3.5 text-[#1aabbb] shrink-0" />
                <span>
                  <strong>Mess-Tipp:</strong> Reale Wassertiefe vom Beckenboden bis zur Mitte des Skimmers messen (ca. 10–15 cm unter Beckenrand).
                </span>
              </div>
            </div>

            {/* Berechnetes Ergebnis der Maße (wird automatisch übernommen) */}
            <div className="bg-slate-50/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Berechnetes Beckenvolumen
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading tabular-nums">
                    {calculatedLitersFromDims > 0 ? calculatedLitersFromDims.toLocaleString('de-DE') : '0'} Liter
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    ≈ {calculatedM3FromDims > 0 ? calculatedM3FromDims.toLocaleString('de-DE') : '0'} m³
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#159ba9] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Automatisch übernommen</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
