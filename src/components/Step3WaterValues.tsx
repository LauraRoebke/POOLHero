import React, { useState } from 'react';
import { 
  DisinfectionMethod, 
  WaterValues,
  AutoDosingConfig
} from '../types';
import { MeasurementGuide } from './MeasurementGuide';
import { 
  TestTube, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight, 
  ArrowLeft,
  Droplets,
  Zap,
  Wind,
  Shield,
  HelpCircle,
  X,
  BookOpen,
  Info,
  Check,
  Sliders,
  Sparkles
} from 'lucide-react';

interface Step3Props {
  disinfectionMethod: DisinfectionMethod;
  waterValues: WaterValues;
  autoDosing: AutoDosingConfig;
  onChangeMethod: (method: DisinfectionMethod) => void;
  onChangeValues: (values: WaterValues) => void;
  onChangeAutoDosing: (config: AutoDosingConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

type ValueRating = 'green' | 'yellow' | 'red' | 'blue';

interface StatusResult {
  rating: ValueRating;
  text: string;
  badgeClass: string;
  accentClass: string;
  idealText: string;
}

const METHOD_OPTIONS: { id: DisinfectionMethod; label: string; icon: React.FC<{ className?: string }> }[] = [
  {
    id: 'chlorine',
    label: 'Chlor',
    icon: Droplets,
  },
  {
    id: 'salt',
    label: 'Salzelektrolyse',
    icon: Zap,
  },
  {
    id: 'oxygen',
    label: 'Aktivsauerstoff',
    icon: Wind,
  },
  {
    id: 'bromine',
    label: 'Brom',
    icon: Shield,
  },
];

// Normale, klare Indikatorfarben (nicht pastell, aber nicht 100% übersättigt)
const C_RED = '#ef4444';    // Klares, normales Rot
const C_AMBER = '#f59e0b';  // Klares, warmes Warngelb/Bernstein
const C_GREEN = '#22c55e';  // Klares, sattes Frische-Grün
const C_BLUE = '#3b82f6';   // Klares Wasser-Blau

const SLIDER_GRADIENTS = {
  // ph: Min 6.0, Max 8.5 (Range 2.5). Ideal: 7.0 - 7.4 (40% - 56%), Gelb: 6.8-7.0 (32%-40%) & 7.4-7.6 (56%-64%), Rot: <6.8 (<32%) & >7.6 (>64%)
  ph: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 28%, ${C_AMBER} 33%, ${C_AMBER} 39%, ${C_GREEN} 40%, ${C_GREEN} 56%, ${C_AMBER} 57%, ${C_AMBER} 64%, ${C_RED} 65%, ${C_RED} 100%)`,

  // freeChlorine: Min 0, Max 3.0 (Range 3.0). Ideal: 0.3 - 1.0 (10% - 33.3%), Gelb: 0.15-0.3 (5%-10%) & 1.0-1.8 (33.3%-60%), Rot: <0.15 (<5%) & >1.8 (>60%)
  freeChlorine: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 4%, ${C_AMBER} 5%, ${C_AMBER} 9%, ${C_GREEN} 10%, ${C_GREEN} 33.3%, ${C_AMBER} 34%, ${C_AMBER} 60%, ${C_RED} 61%, ${C_RED} 100%)`,

  // totalChlorine: Min 0, Max 3.0 (Range 3.0). 0 bis 0.2 mg/l GRÜN, dann gelb (0.2-0.5) und rot (>0.5)!
  // 0 bis 0.2 mg/l = 0% bis 6.7%, 0.2 bis 0.5 mg/l = 6.7% bis 16.7%, > 0.5 mg/l = > 16.7%
  totalChlorine: `linear-gradient(to right, ${C_GREEN} 0%, ${C_GREEN} 6.7%, ${C_AMBER} 7.5%, ${C_AMBER} 16.7%, ${C_RED} 17.5%, ${C_RED} 100%)`,

  // cyanuricAcid: Min 0, Max 100 (Range 100). Ideal: 15 - 35 (15% - 35%), Gelb: 0-15 (0-15%) & 35-50 (35%-50%), Rot: >50 (>50%)
  cyanuricAcid: `linear-gradient(to right, ${C_AMBER} 0%, ${C_AMBER} 14%, ${C_GREEN} 15%, ${C_GREEN} 35%, ${C_AMBER} 36%, ${C_AMBER} 50%, ${C_RED} 51%, ${C_RED} 100%)`,

  // saltLevel: Min 1.0, Max 5.0 (Range 4.0). Ideal: 3.0 - 4.0 (50% - 75%), Gelb: 2.5-3.0 (37.5%-50%) & 4.0-4.5 (75%-87.5%), Rot: <2.5 (<37.5%) & >4.5 (>87.5%)
  saltLevel: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 36%, ${C_AMBER} 37.5%, ${C_AMBER} 49%, ${C_GREEN} 50%, ${C_GREEN} 75%, ${C_AMBER} 76%, ${C_AMBER} 87.5%, ${C_RED} 88%, ${C_RED} 100%)`,

  // redox: Min 500, Max 900 (Range 400). Ideal: 700 - 760 (50% - 65%), Gelb: 650-700 (37.5%-50%) & 760-800 (65%-75%), Rot: <650 (<37.5%) & >800 (>75%)
  redox: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 36%, ${C_AMBER} 37.5%, ${C_AMBER} 49%, ${C_GREEN} 50%, ${C_GREEN} 65%, ${C_AMBER} 66%, ${C_AMBER} 75%, ${C_RED} 76%, ${C_RED} 100%)`,

  // activeOxygen: Min 0, Max 10 (Range 10). Ideal: 5.0 - 8.0 (50% - 80%), Gelb: 3.5-5.0 (35%-50%) & 8.0-9.0 (80%-90%), Rot: <3.5 (<35%) & >9.0 (>90%)
  activeOxygen: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 34%, ${C_AMBER} 35%, ${C_AMBER} 49%, ${C_GREEN} 50%, ${C_GREEN} 80%, ${C_AMBER} 81%, ${C_AMBER} 90%, ${C_RED} 91%, ${C_RED} 100%)`,

  // bromine: Min 0, Max 6 (Range 6). Ideal: 2.0 - 4.0 (33.3% - 66.7%), Gelb: 1.2-2.0 (20%-33.3%) & 4.0-5.0 (66.7%-83.3%), Rot: <1.2 (<20%) & >5.0 (>83.3%)
  bromine: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 19%, ${C_AMBER} 20%, ${C_AMBER} 32%, ${C_GREEN} 33.3%, ${C_GREEN} 66.7%, ${C_AMBER} 67%, ${C_AMBER} 83.3%, ${C_RED} 84%, ${C_RED} 100%)`,

  // alkalinity: Min 0, Max 250 (Range 250). Ideal: 80 - 120 (32% - 48%), Gelb: 50-80 (20%-32%) & 120-150 (48%-60%), Rot: <50 (<20%) & >150 (>60%)
  alkalinity: `linear-gradient(to right, ${C_RED} 0%, ${C_RED} 19%, ${C_AMBER} 20%, ${C_AMBER} 31%, ${C_GREEN} 32%, ${C_GREEN} 48%, ${C_AMBER} 49%, ${C_AMBER} 60%, ${C_RED} 61%, ${C_RED} 100%)`,

  // Reiner Farbverlauf von Blau (kalt) zu Rot (warm)
  waterTemp: `linear-gradient(to right, ${C_BLUE} 0%, ${C_RED} 100%)`,
};

export const Step3WaterValues: React.FC<Step3Props> = ({
  disinfectionMethod,
  waterValues,
  autoDosing,
  onChangeMethod,
  onChangeValues,
  onChangeAutoDosing,
  onBack,
  onNext,
}) => {
  const [viewMode, setViewMode] = useState<'inputs' | 'guide'>('inputs');
  const [showMeasureModal, setShowMeasureModal] = useState<boolean>(false);
  const [measureTab, setMeasureTab] = useState<'all' | 'shake' | 'strip' | 'photometer'>('all');

  const handleToggleAutoDosing = (key: keyof AutoDosingConfig) => {
    const nextVal = !autoDosing[key];
    const newConfig = { ...autoDosing, [key]: nextVal };
    onChangeAutoDosing(newConfig);

    // Wenn der Nutzer automatische Salzelektrolyse oder Chlor-Dosierung einschaltet, Methode passend einstellen
    if (key === 'autoSalt' && nextVal) {
      onChangeMethod('salt');
    } else if (key === 'autoChlorine' && nextVal) {
      onChangeMethod('chlorine');
    }
  };

  const handleValChange = (field: keyof WaterValues, val: number) => {
    onChangeValues({
      ...waterValues,
      [field]: isNaN(val) ? 0 : val,
    });
  };

  const getPhStatus = (ph: number): StatusResult => {
    const idealText = '7,0 – 7,4';
    if (ph >= 7.0 && ph <= 7.4) {
      return { rating: 'green', text: 'Optimal (7,0 – 7,4)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((ph >= 6.8 && ph < 7.0) || (ph > 7.4 && ph <= 7.6)) {
      return { rating: 'yellow', text: ph < 7.0 ? 'Leicht sauer' : 'Leicht alkalisch', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: ph < 6.8 ? 'Zu sauer (< 6,8)' : 'Zu alkalisch (> 7,6)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getChlorineStatus = (fCl: number): StatusResult => {
    const idealText = '0,3 – 0,6 mg/l (bei Hitze bis 1,0)';
    if (fCl >= 0.3 && fCl <= 1.0) {
      return { rating: 'green', text: 'Optimal (0,3 – 1,0 mg/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if (fCl > 1.0 && fCl <= 1.8) {
      return { rating: 'yellow', text: 'Leicht erhöht', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else if (fCl >= 0.15 && fCl < 0.3) {
      return { rating: 'yellow', text: 'Knapp ausreichend', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: fCl < 0.15 ? 'Zu niedrig (Keimgefahr)' : 'Stark überdosiert', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getTotalChlorineStatus = (total: number, free: number): StatusResult => {
    const bound = Math.max(0, Math.round((total - free) * 100) / 100);
    const idealText = '0,0 – 0,2 mg/l (max. 0,2 gebunden)';
    if (total <= 0.2 || (bound <= 0.2 && total <= 1.2)) {
      return { 
        rating: 'green', 
        text: total <= 0.2 ? `Gesamt: ${total} mg/l (Optimal)` : `Gebunden: ${bound} mg/l (Optimal)`, 
        badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', 
        accentClass: 'accent-emerald-600', 
        idealText 
      };
    } else if (bound <= 0.4 || total <= 0.5) {
      return { 
        rating: 'yellow', 
        text: total <= 0.5 ? `Gesamt: ${total} mg/l (Leicht erhöht)` : `Gebunden: ${bound} mg/l (Erhöht)`, 
        badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', 
        accentClass: 'accent-amber-500', 
        idealText 
      };
    } else {
      return { 
        rating: 'red', 
        text: `Gebunden: ${bound} mg/l (Chloramine / Geruch)`, 
        badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', 
        accentClass: 'accent-rose-600', 
        idealText 
      };
    }
  };

  const getCyaStatus = (cya: number): StatusResult => {
    const idealText = '15 – 35 mg/l (max. 50)';
    if (cya >= 15 && cya <= 35) {
      return { rating: 'green', text: 'Optimal (15 – 35 mg/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if (cya < 15) {
      return { rating: 'yellow', text: 'Niedrig (< 15 mg/l)', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else if (cya <= 50) {
      return { rating: 'yellow', text: 'Grenzwertig (35 – 50 mg/l)', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: 'Chlorblockade (> 50 mg/l)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getSaltStatus = (salt: number): StatusResult => {
    const idealText = '3,0 – 4,0 g/l (ca. 0,3% – 0,4%)';
    if (salt >= 3.0 && salt <= 4.0) {
      return { rating: 'green', text: 'Optimal (3,0 – 4,0 g/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((salt >= 2.5 && salt < 3.0) || (salt > 4.0 && salt <= 5.0)) {
      return { rating: 'yellow', text: salt < 3.0 ? 'Leicht gering (< 3,0 g/l)' : 'Erhöht (> 4,0 g/l)', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: salt < 2.5 ? 'Kritisch gering (< 2,5 g/l)' : 'Zu hoch (> 5,0 g/l)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getRedoxStatus = (redox: number): StatusResult => {
    const idealText = '700 – 750 mV';
    if (redox >= 700 && redox <= 760) {
      return { rating: 'green', text: 'Optimal (700 – 750 mV)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((redox >= 650 && redox < 700) || (redox > 760 && redox <= 800)) {
      return { rating: 'yellow', text: redox < 700 ? 'Mäßig (650 – 700 mV)' : 'Hoch (> 760 mV)', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: redox < 650 ? 'Zu gering (< 650 mV)' : 'Sehr hoch (> 800 mV)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getOxygenStatus = (o2: number): StatusResult => {
    const idealText = '5,0 – 8,0 mg/l';
    if (o2 >= 5.0 && o2 <= 8.0) {
      return { rating: 'green', text: 'Optimal (5,0 – 8,0 mg/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((o2 >= 3.5 && o2 < 5.0) || (o2 > 8.0 && o2 <= 10.0)) {
      return { rating: 'yellow', text: o2 < 5.0 ? 'Leicht zu niedrig' : 'Leicht überdosiert', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: o2 < 3.5 ? 'Zu gering (< 3,5 mg/l)' : 'Stark überdosiert (> 10 mg/l)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getBromineStatus = (br: number): StatusResult => {
    const idealText = '2,0 – 4,0 mg/l';
    if (br >= 2.0 && br <= 4.0) {
      return { rating: 'green', text: 'Optimal (2,0 – 4,0 mg/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((br >= 1.2 && br < 2.0) || (br > 4.0 && br <= 5.5)) {
      return { rating: 'yellow', text: br < 2.0 ? 'Leicht zu niedrig' : 'Leicht erhöht', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: br < 1.2 ? 'Zu niedrig (< 1,2 mg/l)' : 'Zu hoch (> 5,5 mg/l)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getAlkalinityStatus = (ta: number): StatusResult => {
    const idealText = '80 – 120 mg/l';
    if (ta >= 80 && ta <= 120) {
      return { rating: 'green', text: 'Optimal (80 – 120 mg/l)', badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if ((ta >= 50 && ta < 80) || (ta > 120 && ta <= 150)) {
      return { rating: 'yellow', text: ta < 80 ? 'Leicht instabil (< 80)' : 'Leicht erhöht (> 120)', badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: ta < 50 ? 'pH-Puffer fehlt (< 50 mg/l)' : 'Zu hoch (> 150 mg/l)', badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getTempStatus = (temp: number): StatusResult => {
    const idealText = '24 – 28 °C';
    if (temp < 20) {
      return { rating: 'blue', text: `${temp}°C (Kalt)`, badgeClass: 'text-blue-800 bg-blue-100 border-blue-300 font-semibold', accentClass: 'accent-blue-600', idealText };
    } else if (temp < 24) {
      return { rating: 'blue', text: `${temp}°C (Erfrischend kühl)`, badgeClass: 'text-sky-800 bg-sky-100 border-sky-300 font-semibold', accentClass: 'accent-sky-600', idealText };
    } else if (temp >= 24 && temp <= 28) {
      return { rating: 'green', text: `${temp}°C (Optimal & angenehm)`, badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-semibold', accentClass: 'accent-emerald-600', idealText };
    } else if (temp > 28 && temp <= 32) {
      return { rating: 'yellow', text: `${temp}°C (Warm – Algengefahr)`, badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-semibold', accentClass: 'accent-amber-500', idealText };
    } else {
      return { rating: 'red', text: `${temp}°C (Sehr warm – hoher Chemieverbrauch)`, badgeClass: 'text-rose-800 bg-rose-100 border-rose-300 font-semibold', accentClass: 'accent-rose-600', idealText };
    }
  };

  const getCardColorClass = (rating: ValueRating) => {
    switch (rating) {
      case 'green':
        return 'bg-emerald-50/60 border-emerald-400 ring-1 ring-emerald-300/50 shadow-2xs';
      case 'yellow':
        return 'bg-amber-50/60 border-amber-400 ring-1 ring-amber-300/50 shadow-2xs';
      case 'red':
        return 'bg-rose-50/60 border-rose-400 ring-1 ring-rose-300/50 shadow-2xs';
      case 'blue':
        return 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-300/50 shadow-2xs';
      default:
        return 'bg-slate-50/70 border-slate-200';
    }
  };

  const phStatus = getPhStatus(waterValues.ph);
  const chlorineStatus = getChlorineStatus(waterValues.freeChlorine);
  const totalChlorineStatus = getTotalChlorineStatus(waterValues.totalChlorine, waterValues.freeChlorine);
  const cyaStatus = getCyaStatus(waterValues.cyanuricAcid);
  const saltStatus = getSaltStatus(waterValues.saltLevel);
  const redoxStatus = getRedoxStatus(waterValues.redox);
  const oxygenStatus = getOxygenStatus(waterValues.activeOxygen);
  const bromineStatus = getBromineStatus(waterValues.bromine);
  const alkStatus = getAlkalinityStatus(waterValues.alkalinity ?? 100);
  const tempStatus = getTempStatus(waterValues.waterTemp);

  if (viewMode === 'guide') {
    return (
      <MeasurementGuide
        activeTab={measureTab}
        onChangeTab={setMeasureTab}
        onBackToInputs={() => {
          setViewMode('inputs');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mode="page"
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#159ba9]">
              Schritt 3 von 5
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Wasserwerte & Desinfektion
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Auswahl der Desinfektionsmethode und Erfassung der aktuellen Messwerte. Die Farbbalken zeigen sofort, ob die Werte im optimalen Bereich liegen.
          </p>
        </div>
      </div>

      {/* Desinfektionsmethode */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
            Desinfektionsmethode
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Eingesetzte Desinfektionsmethode im laufenden Normalbetrieb
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {METHOD_OPTIONS.map((opt) => {
            const isSelected = disinfectionMethod === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                id={`method-${opt.id}-btn`}
                onClick={() => onChangeMethod(opt.id)}
                className={`p-3.5 sm:p-4 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-[#1aabbb]/10 text-[#1d1f3e] ring-2 ring-[#1aabbb]/40 shadow-xs'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#1aabbb] text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-900">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automatische Dosierung mit Switch-Buttons für pH, Salzelektrolyse und Chlor */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
            Automatische Dosierung & Regelung
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automatische Mess- & Regeltechnik oder Dosieranlage vorhanden? (Aktivieren, falls zutreffend)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. pH-Regulierung */}
          <div
            id="autodose-ph-card"
            onClick={() => handleToggleAutoDosing('autoPh')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
              autoDosing.autoPh
                ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 shadow-xs'
                : 'bg-slate-50/80 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-sm font-bold text-slate-900 block">pH-Regulierung</span>
              <span className="text-xs text-slate-500 font-medium">Automatische pH-Pumpe</span>
            </div>
            <button
              type="button"
              role="switch"
              id="switch-autodose-ph"
              aria-checked={autoDosing.autoPh}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAutoDosing('autoPh');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoDosing.autoPh ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  autoDosing.autoPh ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Salzelektrolyse */}
          <div
            id="autodose-salt-card"
            onClick={() => handleToggleAutoDosing('autoSalt')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
              autoDosing.autoSalt
                ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 shadow-xs'
                : 'bg-slate-50/80 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-sm font-bold text-slate-900 block">Salzelektrolyse</span>
              <span className="text-xs text-slate-500 font-medium">Automatische Salzzelle</span>
            </div>
            <button
              type="button"
              role="switch"
              id="switch-autodose-salt"
              aria-checked={autoDosing.autoSalt}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAutoDosing('autoSalt');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoDosing.autoSalt ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  autoDosing.autoSalt ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Chlor-Dosierung */}
          <div
            id="autodose-chlorine-card"
            onClick={() => handleToggleAutoDosing('autoChlorine')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
              autoDosing.autoChlorine
                ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 shadow-xs'
                : 'bg-slate-50/80 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-sm font-bold text-slate-900 block">Chlor-Dosierung</span>
              <span className="text-xs text-slate-500 font-medium">Flüssigchlor-Dosierer</span>
            </div>
            <button
              type="button"
              role="switch"
              id="switch-autodose-chlorine"
              aria-checked={autoDosing.autoChlorine}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAutoDosing('autoChlorine');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoDosing.autoChlorine ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  autoDosing.autoChlorine ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ÖFFENTLICHE AUSWAHL DER 3 MESSMETHODEN & MESSANLEITUNG */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#1aabbb]/10 text-[#159ba9] border border-[#1aabbb]/30">
                Messmethoden & Anleitung
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Messmethoden der Wasserwerte
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
              Auswahl der Messmethode für eine genaue Schritt-für-Schritt Anleitung, Farbskalen-Hilfe und Praxistipps:
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMeasureTab('all');
                setViewMode('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-bold text-[#159ba9] hover:text-[#1d1f3e] bg-teal-50 hover:bg-teal-100 py-2.5 px-4 rounded-xl border border-teal-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#159ba9]" />
              <span>Anleitung als eigene Seite öffnen</span>
            </button>
            <button
              type="button"
              id="open-measure-popup-btn"
              onClick={() => {
                setMeasureTab('all');
                setShowMeasureModal(true);
              }}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 px-3 rounded-xl border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
              title="Großes Pop-up öffnen"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Als Pop-up</span>
            </button>
          </div>
        </div>

        {/* 3 Methoden Karten öffentlich wählbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Karte 1: Schütteltest */}
          <div 
            id="method-card-shake"
            onClick={() => {
              setMeasureTab('shake');
              setViewMode('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative p-5 rounded-2xl border-2 border-slate-200 hover:border-[#1aabbb] bg-slate-50/50 hover:bg-[#1aabbb]/5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-100/70 text-[#159ba9] font-extrabold text-[11px] border border-teal-200">
                  Methode 1 • Tabletten
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-[#159ba9] transition-colors">
                  Farbvergleich
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#159ba9] transition-colors font-heading">
                Schütteltest (Tester)
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Klassischer Farbvergleich mit <strong>Phenol Red</strong> (pH) und <strong>DPD 1</strong> (Chlor) Reagenztabletten.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#159ba9]">
              <span>Anleitung ansehen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Karte 2: Streifentest */}
          <div 
            id="method-card-strip"
            onClick={() => {
              setMeasureTab('strip');
              setViewMode('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative p-5 rounded-2xl border-2 border-slate-200 hover:border-[#1aabbb] bg-slate-50/50 hover:bg-[#1aabbb]/5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100/70 text-sky-700 font-extrabold text-[11px] border border-sky-200">
                  Methode 2 • Test-Strips
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-[#159ba9] transition-colors">
                  In 15 Sek.
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#159ba9] transition-colors font-heading">
                Streifentest (Quick-Strips)
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schneller Mehrfachtest für pH-Wert, Chlor und Alkalinität durch kurzes Eintauchen in 15 Sekunden.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#159ba9]">
              <span>Anleitung ansehen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Karte 3: Photometer */}
          <div 
            id="method-card-photometer"
            onClick={() => {
              setMeasureTab('photometer');
              setViewMode('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative p-5 rounded-2xl border-2 border-slate-200 hover:border-[#1aabbb] bg-slate-50/50 hover:bg-[#1aabbb]/5 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100/70 text-indigo-700 font-extrabold text-[11px] border border-indigo-200">
                  Methode 3 • Digital
                </span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-[#159ba9] transition-colors">
                  Sensor-Optik
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#159ba9] transition-colors font-heading">
                Digitales Photometer
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lichtsensor-Messkammer (PoolLab, Scuba II) für präzise Digitalwerte ohne subjektive Farbabschätzung.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#159ba9]">
              <span>Anleitung ansehen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Aktuelle Wasserwerte: 2 nebeneinander auf Desktop */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1aabbb]/10 text-[#159ba9] rounded-xl">
            <TestTube className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Aktuelle Wasserwerte eintragen
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Schieberegler anpassen oder genaue Messwerte direkt in die Felder eingeben:
            </p>
          </div>
        </div>

        {/* 2-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* pH-Wert */}
          <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(phStatus.rating)}`}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="input-ph" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                pH-Wert
              </label>
              <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${phStatus.badgeClass}`}>
                {phStatus.text}
              </span>
            </div>
            {/* Idealbereich */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Idealbereich:</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {phStatus.idealText}
              </span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <input
                type="range"
                min="6.0"
                max="8.5"
                step="0.1"
                value={waterValues.ph}
                onChange={(e) => handleValChange('ph', parseFloat(e.target.value))}
                style={{ background: SLIDER_GRADIENTS.ph }}
                className="w-full pool-slider"
              />
              <div className="w-24">
                <input
                  type="number"
                  id="input-ph"
                  min="5.5"
                  max="9.0"
                  step="0.05"
                  value={waterValues.ph}
                  onChange={(e) => handleValChange('ph', parseFloat(e.target.value))}
                  className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden shadow-2xs"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
              <span className="text-rose-600 font-semibold">6.0 (Sauer)</span>
              <span className="text-emerald-700 font-bold">7.0 – 7.4 (Ideal)</span>
              <span className="text-rose-600 font-semibold">8.5 (Alkalisch)</span>
            </div>
          </div>

          {/* METHOD: CHLORINE */}
          {disinfectionMethod === 'chlorine' && (
            <>
              {/* Freies Chlor */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(chlorineStatus.rating)}`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="input-free-chlorine" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                    Freies wirksames Chlor (DPD 1)
                  </label>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${chlorineStatus.badgeClass}`}>
                    {chlorineStatus.text}
                  </span>
                </div>
                {/* Idealbereich */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Idealbereich:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {chlorineStatus.idealText}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.05"
                    value={waterValues.freeChlorine}
                    onChange={(e) => handleValChange('freeChlorine', parseFloat(e.target.value))}
                    style={{ background: SLIDER_GRADIENTS.freeChlorine }}
                    className="w-full pool-slider"
                  />
                  <div className="w-24 relative">
                    <input
                      type="number"
                      id="input-free-chlorine"
                      min="0"
                      max="5.0"
                      step="0.05"
                      value={waterValues.freeChlorine}
                      onChange={(e) => handleValChange('freeChlorine', parseFloat(e.target.value))}
                      className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                  <span className="text-rose-600 font-semibold">0.0 (Keimgefahr)</span>
                  <span className="text-emerald-700 font-bold">0.6 mg/l (Ideal)</span>
                  <span className="text-amber-600 font-semibold">3.0 (Erhöht)</span>
                </div>
              </div>

              {/* Gesamtchlor */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(totalChlorineStatus.rating)}`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="input-total-chlorine" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                    Gesamtchlor (DPD 3)
                  </label>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${totalChlorineStatus.badgeClass}`}>
                    {totalChlorineStatus.text}
                  </span>
                </div>
                {/* Idealbereich */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Idealbereich:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {totalChlorineStatus.idealText}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.05"
                    value={waterValues.totalChlorine}
                    onChange={(e) => handleValChange('totalChlorine', parseFloat(e.target.value))}
                    style={{ background: SLIDER_GRADIENTS.totalChlorine }}
                    className="w-full pool-slider"
                  />
                  <div className="w-24 relative">
                    <input
                      type="number"
                      id="input-total-chlorine"
                      min="0"
                      max="5.0"
                      step="0.05"
                      value={waterValues.totalChlorine}
                      onChange={(e) => handleValChange('totalChlorine', parseFloat(e.target.value))}
                      className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                  <span className="text-emerald-700 font-bold">0,0 – 0,2 mg/l (Optimal)</span>
                  <span className="text-amber-600 font-semibold">0,2 – 0,5 mg/l (Erhöht)</span>
                  <span className="text-rose-600 font-semibold">&gt; 0,5 mg/l (Kritisch)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Differenz zum freien Chlor = gebundenes Chlor (Chloramine, Grenzwert: max. 0,2 mg/l)
                </div>
              </div>

              {/* Cyanursäure */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(cyaStatus.rating)}`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="input-cya" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                    Cyanursäure (Chlor-Stabilisator)
                  </label>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${cyaStatus.badgeClass}`}>
                    {cyaStatus.text}
                  </span>
                </div>
                {/* Idealbereich */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Idealbereich:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {cyaStatus.idealText}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={waterValues.cyanuricAcid}
                    onChange={(e) => handleValChange('cyanuricAcid', parseFloat(e.target.value))}
                    style={{ background: SLIDER_GRADIENTS.cyanuricAcid }}
                    className="w-full pool-slider"
                  />
                  <div className="w-24 relative">
                    <input
                      type="number"
                      id="input-cya"
                      min="0"
                      max="150"
                      step="1"
                      value={waterValues.cyanuricAcid}
                      onChange={(e) => handleValChange('cyanuricAcid', parseFloat(e.target.value))}
                      className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                  <span className="text-amber-600 font-semibold">0 (Kein UV-Schutz)</span>
                  <span className="text-emerald-700 font-bold">20 – 30 mg/l (Ideal)</span>
                  <span className="text-rose-600 font-semibold">&gt;50 (Chlorblockade!)</span>
                </div>
              </div>
            </>
          )}

          {/* METHOD: SALT */}
          {disinfectionMethod === 'salt' && (
            <>
              {/* Salzgehalt */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(saltStatus.rating)}`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="input-salt-level" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                    Salzgehalt im Beckenwasser
                  </label>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${saltStatus.badgeClass}`}>
                    {saltStatus.text}
                  </span>
                </div>
                {/* Idealbereich */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Idealbereich:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {saltStatus.idealText}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.1"
                    value={waterValues.saltLevel}
                    onChange={(e) => handleValChange('saltLevel', parseFloat(e.target.value))}
                    style={{ background: SLIDER_GRADIENTS.saltLevel }}
                    className="w-full pool-slider"
                  />
                  <div className="w-24 relative">
                    <input
                      type="number"
                      id="input-salt-level"
                      min="0"
                      max="10"
                      step="0.1"
                      value={waterValues.saltLevel}
                      onChange={(e) => handleValChange('saltLevel', parseFloat(e.target.value))}
                      className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">g/l</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                  <span className="text-rose-600 font-semibold">&lt;2.5 g/l (Zelle schaltet ab)</span>
                  <span className="text-emerald-700 font-bold">3.0 – 3.5 g/l (Optimal)</span>
                  <span className="text-blue-600 font-semibold">&gt;4.0 g/l</span>
                </div>
              </div>

              {/* Redox */}
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(redoxStatus.rating)}`}>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="input-redox" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                    Redox-Potential (ORP)
                  </label>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${redoxStatus.badgeClass}`}>
                    {redoxStatus.text}
                  </span>
                </div>
                {/* Idealbereich */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Idealbereich:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {redoxStatus.idealText}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <input
                    type="range"
                    min="500"
                    max="850"
                    step="5"
                    value={waterValues.redox}
                    onChange={(e) => handleValChange('redox', parseFloat(e.target.value))}
                    style={{ background: SLIDER_GRADIENTS.redox }}
                    className="w-full pool-slider"
                  />
                  <div className="w-24 relative">
                    <input
                      type="number"
                      id="input-redox"
                      min="400"
                      max="900"
                      step="5"
                      value={waterValues.redox}
                      onChange={(e) => handleValChange('redox', parseFloat(e.target.value))}
                      className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mV</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                  <span className="text-rose-600 font-semibold">&lt;650 mV (Keimgefahr)</span>
                  <span className="text-emerald-700 font-bold">700 – 750 mV (Optimal)</span>
                  <span className="text-blue-600 font-semibold">&gt;760 mV</span>
                </div>
              </div>
            </>
          )}

          {/* METHOD: OXYGEN */}
          {disinfectionMethod === 'oxygen' && (
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(oxygenStatus.rating)}`}>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="input-oxygen" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                  Aktivsauerstoff (O₂-Gehalt)
                </label>
                <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${oxygenStatus.badgeClass}`}>
                  {oxygenStatus.text}
                </span>
              </div>
              {/* Idealbereich */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Idealbereich:</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {oxygenStatus.idealText}
                </span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.2"
                  value={waterValues.activeOxygen}
                  onChange={(e) => handleValChange('activeOxygen', parseFloat(e.target.value))}
                  style={{ background: SLIDER_GRADIENTS.activeOxygen }}
                  className="w-full pool-slider"
                />
                <div className="w-24 relative">
                  <input
                    type="number"
                    id="input-oxygen"
                    min="0"
                    max="15"
                    step="0.2"
                    value={waterValues.activeOxygen}
                    onChange={(e) => handleValChange('activeOxygen', parseFloat(e.target.value))}
                    className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                <span className="text-rose-600 font-semibold">0 mg/l (Unwirksam)</span>
                <span className="text-emerald-700 font-bold">5.0 – 8.0 mg/l (Ideal)</span>
                <span className="text-amber-600 font-semibold">&gt;8 mg/l</span>
              </div>
            </div>
          )}

          {/* METHOD: BROMINE */}
          {disinfectionMethod === 'bromine' && (
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(bromineStatus.rating)}`}>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="input-bromine" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                  Bromgehalt
                </label>
                <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${bromineStatus.badgeClass}`}>
                  {bromineStatus.text}
                </span>
              </div>
              {/* Idealbereich */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Idealbereich:</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {bromineStatus.idealText}
                </span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.1"
                  value={waterValues.bromine}
                  onChange={(e) => handleValChange('bromine', parseFloat(e.target.value))}
                  style={{ background: SLIDER_GRADIENTS.bromine }}
                  className="w-full pool-slider"
                />
                <div className="w-24 relative">
                  <input
                    type="number"
                    id="input-bromine"
                    min="0"
                    max="10"
                    step="0.1"
                    value={waterValues.bromine}
                    onChange={(e) => handleValChange('bromine', parseFloat(e.target.value))}
                    className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
                <span className="text-rose-600 font-semibold">0 mg/l (Zu niedrig)</span>
                <span className="text-emerald-700 font-bold">2.0 – 4.0 mg/l (Ideal)</span>
                <span className="text-amber-600 font-semibold">&gt;4.0 mg/l</span>
              </div>
            </div>
          )}

          {/* Alkalinität (TA) */}
          <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(alkStatus.rating)}`}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="input-alkalinity" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                Alkalinität (TA / Säurekapazität)
              </label>
              <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${alkStatus.badgeClass}`}>
                {alkStatus.text}
              </span>
            </div>
            {/* Idealbereich */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Idealbereich:</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {alkStatus.idealText}
              </span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={waterValues.alkalinity ?? 100}
                onChange={(e) => handleValChange('alkalinity', parseFloat(e.target.value))}
                style={{ background: SLIDER_GRADIENTS.alkalinity }}
                className="w-full pool-slider"
              />
              <div className="w-24 relative">
                <input
                  type="number"
                  id="input-alkalinity"
                  min="0"
                  max="250"
                  step="5"
                  value={waterValues.alkalinity ?? 100}
                  onChange={(e) => handleValChange('alkalinity', parseFloat(e.target.value))}
                  className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                />
                <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">mg/l</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
              <span className="text-rose-600 font-semibold">&lt;50 (pH-Wert instabil)</span>
              <span className="text-emerald-700 font-bold">80 – 120 mg/l (Optimal)</span>
              <span className="text-amber-600 font-semibold">&gt;120 mg/l</span>
            </div>
          </div>

          {/* Wassertemperatur: Jetzt exakt 10 bis 40 Grad */}
          <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 space-y-3 ${getCardColorClass(tempStatus.rating)}`}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="input-temp" className="text-base sm:text-lg font-bold text-slate-800 cursor-pointer">
                Wassertemperatur (°C)
              </label>
              <span className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold border transition-colors ${tempStatus.badgeClass}`}>
                {tempStatus.text}
              </span>
            </div>
            {/* Idealbereich */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Richtwert:</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {tempStatus.idealText}
              </span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <input
                type="range"
                min="10"
                max="40"
                step="0.5"
                value={waterValues.waterTemp}
                onChange={(e) => handleValChange('waterTemp', parseFloat(e.target.value))}
                style={{ background: SLIDER_GRADIENTS.waterTemp }}
                className="w-full pool-slider"
              />
              <div className="w-24 relative">
                <input
                  type="number"
                  id="input-temp"
                  min="10"
                  max="40"
                  step="0.5"
                  value={waterValues.waterTemp}
                  onChange={(e) => handleValChange('waterTemp', parseFloat(e.target.value))}
                  className="w-full text-center font-bold bg-white border border-slate-300 rounded-xl py-2 text-base focus:border-[#1aabbb] focus:ring-1 focus:ring-[#1aabbb] outline-hidden pr-6 shadow-2xs"
                />
                <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-semibold">°C</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1 px-1">
              <span className="text-blue-600 font-semibold">10°C (Kalt)</span>
              <span className="text-slate-700 font-bold">24 – 28°C (Optimal)</span>
              <span className="text-red-600 font-semibold">40°C (Heiß)</span>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Ratgeber / Messanleitung mit 3 Bereichen */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1aabbb]/10 text-[#159ba9] rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Anleitung: Wasserwerte richtig messen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schritt-für-Schritt Anleitung für Schütteltest, Streifentest und Photometer
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMeasureModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMeasureTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  measureTab === 'all'
                    ? 'bg-[#1d1f3e] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Alle 3 Methoden
              </button>
              <button
                type="button"
                onClick={() => setMeasureTab('shake')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  measureTab === 'shake'
                    ? 'bg-[#1aabbb] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                1. Schütteltest (Tabletten)
              </button>
              <button
                type="button"
                onClick={() => setMeasureTab('strip')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  measureTab === 'strip'
                    ? 'bg-[#1aabbb] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                2. Streifentest (Test-Strips)
              </button>
              <button
                type="button"
                onClick={() => setMeasureTab('photometer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  measureTab === 'photometer'
                    ? 'bg-[#1aabbb] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                3. Photometer (Digital)
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-7 space-y-6 text-slate-700">
              
              {/* Grundregel für alle: Richtige Probenentnahme */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#1d1f3e] text-[#1aabbb] flex items-center justify-center text-xs font-bold">i</span>
                  <span>Wichtigste Grundregel vor jedem Test: Die richtige Probenentnahme</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wasserprobe niemals direkt von der Wasseroberfläche entnehmen. Das Messgefäß ca. <strong>30 bis 50 cm</strong> unter die Oberfläche (etwa Unterarmlänge) eintauchen und ca. 50 cm Abstand zu Einlaufdüsen und Skimmer halten.
                </p>
              </div>

              {/* BEREICH 1: SCHÜTTELTEST */}
              {(measureTab === 'all' || measureTab === 'shake') && (
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#159ba9] font-extrabold text-xs border border-teal-200">
                        Methode 1
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        Manueller Schütteltest (Tablettentester)
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Der klassische Farbvergleich mit <strong>Phenol Red</strong> (für pH-Wert) und <strong>DPD 1</strong> (für freies Chlor / Brom).
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <strong className="text-slate-800">Ablauf Schritt für Schritt:</strong>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-600 mt-1">
                        <li>Tester unter Wasser füllen, bis beide Messkammern randvoll sind.</li>
                        <li>Tabletten direkt aus dem Blister in die entsprechende Kammer drücken (<strong>Phenol Red</strong> links, <strong>DPD 1</strong> rechts).</li>
                        <li>Deckel fest aufdrücken und ca. 15–20 Sekunden kräftig schütteln, bis sich die Tabletten vollständig aufgelöst haben.</li>
                        <li>Tester gegen neutrales Tageslicht (keine direkte pralle Sonne, kein künstliches Kunstlicht) halten und Farbton mit der Skala abgleichen.</li>
                      </ol>
                    </div>

                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-900">
                      <strong>Wichtiger Praxistipp:</strong> Reagenztabletten <strong>niemals</strong> mit bloßen Fingern berühren. Hautfette und Schweiß verfälschen das Ergebnis sofort. Ausschließlich Tabletten mit der Aufschrift „Rapid“ für manuelle Tester verwenden.
                    </div>
                  </div>
                </div>
              )}

              {/* BEREICH 2: STREIFENTEST */}
              {(measureTab === 'all' || measureTab === 'strip') && (
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#159ba9] font-extrabold text-xs border border-teal-200">
                        Methode 2
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        Streifentest (Teststreifen / Quick-Strips)
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Schnelltest für eine erste Orientierung bezüglich pH-Wert, freiem Chlor, Gesamthärte und Alkalinität.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <strong className="text-slate-800">Ablauf Schritt für Schritt:</strong>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-600 mt-1">
                        <li>Einen Teststreifen mit trockenen Händen aus der Dose entnehmen und die Dose sofort wieder luftdicht verschließen.</li>
                        <li>Den Teststreifen ca. 20–30 cm tief für exakt <strong>1 bis 2 Sekunden</strong> ins Wasser eintauchen (nicht durchs Wasser wirbeln).</li>
                        <li>Herausnehmen, <strong>nicht</strong> trocken schütteln, sondern waagerecht halten, damit die Testfelder nicht ineinander verlaufen.</li>
                        <li>Exakt <strong>15 Sekunden</strong> warten und direkt an die Farbskala auf der Röhre anhalten.</li>
                      </ol>
                    </div>

                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-900">
                      <strong>Wichtiger Praxistipp:</strong> Streifentests reagieren extrem empfindlich auf Feuchtigkeit und UV-Licht in der Lagerung. Nach Ablauf des Verfallsdatums oder längerer Lagerung in der Hitze liefern sie ungenaue Werte. Bei akuten Wasserproblemen stets mit Schütteltest oder Photometer gegenprüfen!
                    </div>
                  </div>
                </div>
              )}

              {/* BEREICH 3: PHOTOMETER */}
              {(measureTab === 'all' || measureTab === 'photometer') && (
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#159ba9] font-extrabold text-xs border border-teal-200">
                        Methode 3
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        Photometer (Elektronisches Digitalmessgerät)
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Präzisionsmessung per Lichtsensor (z.B. PoolLab, Scuba II) – schließt menschliche Ablesefehler durch Farbtäuschung komplett aus.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <strong className="text-slate-800">Ablauf Schritt für Schritt:</strong>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-600 mt-1">
                        <li>Messkammer mit klarem Poolwasser füllen und mit Lichtschutzdeckel verschließen.</li>
                        <li><strong>Zero-Taste drücken:</strong> Das Gerät führt einen Nullabgleich mit dem Trübungsgrad der Wasserprobe durch.</li>
                        <li>Passende Photometer-Tablette zugeben (Achtung: Aufschrift <strong>„Photometer“</strong>, keine „Rapid“-Tabletten verwenden!).</li>
                        <li>Tablette mit dem Rührstab vollständig zerdrücken, Kammer verschließen und Test-Taste drücken.</li>
                        <li>Exakten numerischen Wert digital ablesen.</li>
                      </ol>
                    </div>

                    <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 text-teal-900">
                      <strong>Wichtiger Praxistipp:</strong> Messkammer nach jeder Messung gründlich mit frischem Wasser ausspülen. Bei Verkalkung oder Fingerabdrücken an der Optik liefert das Gerät verfälschte Ergebnisse.
                    </div>
                  </div>
                </div>
              )}

              {/* Typische Messfehler & Ausbleich-Effekt */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Achtung: Typische Messfehler und Ausbleich-Effekt</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-rose-800 leading-relaxed">
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                    <strong>Der Ausbleich-Effekt:</strong> Bei sehr hohem Chlorwert (&gt; 10 mg/l nach Schockchlorung) wird der Farbstoff in der Testkammer sofort gebleicht. Die Probe bleibt transparent weiß, obwohl viel zu viel Chlor vorhanden ist! Probe 1:1 mit Leitungswasser verdünnen und erneut testen.
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                    <strong>Ablesezeitpunkt beachten:</strong> Farbvergleiche nach 20–30 Sekunden ablesen. Lässt man das Gefäß 5 Minuten stehen, oxidiert die Lösung weiter und täuscht einen falschen Chlorwert vor.
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMeasureModal(false)}
                className="bg-[#1d1f3e] hover:bg-[#282b54] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer"
              >
                Verstanden, weiter mit den Wasserwerten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
