import React from 'react';
import { 
  EnvironmentExposure, 
  FilterType, 
  CoverType 
} from '../types';
import { 
  Trees, 
  Filter, 
  Shield, 
  Check 
} from 'lucide-react';

interface Step2Props {
  location?: any;
  environment: EnvironmentExposure;
  filterType: FilterType;
  covers: CoverType[];
  onChangeLocation?: (loc: any) => void;
  onChangeEnvironment: (env: EnvironmentExposure) => void;
  onChangeFilterType: (filter: FilterType) => void;
  onChangeCovers: (covers: CoverType[]) => void;
  onBack?: () => void;
  onNext?: () => void;
}

const ENVIRONMENT_OPTIONS: { id: EnvironmentExposure; label: string; desc: string }[] = [
  {
    id: 'clean',
    label: 'Kein oder kaum Bewuchs',
    desc: 'Kaum Baumbestand, Sträucher oder Garten in Beckennähe',
  },
  {
    id: 'light_trees',
    label: 'Mittel',
    desc: 'Normaler Gartenbewuchs mit Rasen und mäßiger Bepflanzung',
  },
  {
    id: 'heavy_trees',
    label: 'Viel Bewuchs',
    desc: 'Starker Baumbestand, Hecken oder direkt unter Bäumen',
  },
];

const FILTER_OPTIONS: { id: FilterType; label: string; desc: string }[] = [
  {
    id: 'sand',
    label: 'Filtersand',
    desc: 'Klassischer Quarzsand im Filterkessel',
  },
  {
    id: 'glass',
    label: 'Filterglas',
    desc: 'Aktiviertes Glasgranulat für feinere Filtration',
  },
  {
    id: 'cartridge',
    label: 'Kartuschenfilter',
    desc: 'Feinporige Vlies- oder Papierfilterpatrone',
  },
  {
    id: 'balls',
    label: 'Filterbälle (Synthetik)',
    desc: 'Polymerfaser-Filterbälle als leichtes Filtermaterial',
  },
];

const COVER_OPTIONS: { id: CoverType; label: string; desc: string }[] = [
  {
    id: 'none',
    label: 'Keine Abdeckung vorhanden',
    desc: 'Becken liegt dauerhaft offen',
  },
  {
    id: 'solar',
    label: 'Solarplane / GeoBubble Solarfolie',
    desc: 'Schwimmt auf der Oberfläche, heizt & senkt Verdunstung',
  },
  {
    id: 'tarp',
    label: 'Planenabdeckung',
    desc: 'Winter- & Sommerplane oder aufblasbare Abdeckplane',
  },
  {
    id: 'roller_safety',
    label: 'Roll- und Schutzabdeckung',
    desc: 'Tragfähiger Rollschutz, Sicherheitsabdeckung & Rollladen',
  },
  {
    id: 'dome',
    label: 'Cabrio Dome / Überdachung',
    desc: 'Transparente Pool-Kuppel oder feste Poolüberdachung',
  },
];

export const Step2Equipment: React.FC<Step2Props> = ({
  environment,
  filterType,
  covers,
  onChangeEnvironment,
  onChangeFilterType,
  onChangeCovers,
}) => {
  const handleToggleCover = (coverId: CoverType) => {
    if (coverId === 'none') {
      onChangeCovers(['none']);
      return;
    }

    const withoutNone = covers.filter((c) => c !== 'none');
    if (withoutNone.includes(coverId)) {
      const remaining = withoutNone.filter((c) => c !== coverId);
      onChangeCovers(remaining.length > 0 ? remaining : ['none']);
    } else {
      onChangeCovers([...withoutNone, coverId]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Title Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#159ba9]">
            Schritt 2 von 5
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
          Ausrüstung & Technik
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Gartenbewuchs, Filtermedium und Abdeckung beeinflussen den Chemikalienbedarf und das Algenrisiko maßgeblich.
        </p>
      </div>

      {/* Vertikale Anordnung der Fragen untereinander */}
      <div className="flex flex-col space-y-5">
        {/* Frage 1: Garten & Bewuchs */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Trees className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Garten & Bewuchs
              </h3>
              <p className="text-xs text-slate-500">
                Schmutzeintrag durch Bäume, Hecken und Garten
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {ENVIRONMENT_OPTIONS.map((opt) => {
              const isSelected = environment === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`env-${opt.id}-btn`}
                  onClick={() => onChangeEnvironment(opt.id)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1aabbb]/10 text-[#1d1f3e] ring-2 ring-[#1aabbb]/40 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{opt.label}</h4>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#1aabbb]' : 'bg-slate-200'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frage 2: Filtermedium */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-50 text-[#1aabbb]">
              <Filter className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Filtermedium
              </h3>
              <p className="text-xs text-slate-500">
                Eingesetztes Filtermaterial im Filterkessel oder der Filteranlage
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = filterType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`filter-${opt.id}-btn`}
                  onClick={() => onChangeFilterType(opt.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1aabbb]/10 text-[#1d1f3e] ring-2 ring-[#1aabbb]/40 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{opt.label}</h4>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#1aabbb]' : 'bg-slate-200'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frage 3: Poolabdeckung */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  Poolabdeckung
                </h3>
                <p className="text-xs text-slate-500">
                  Regelmäßig genutzte Schutzabdeckungen
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#159ba9] bg-cyan-50 px-2 py-0.5 rounded-md">
              Mehrfachauswahl
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {COVER_OPTIONS.map((opt) => {
              const isSelected = covers.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`cover-${opt.id}-btn`}
                  onClick={() => handleToggleCover(opt.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1aabbb]/10 text-[#1d1f3e] ring-2 ring-[#1aabbb]/40 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{opt.label}</h4>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>

                  <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-[#1aabbb] text-white' : 'bg-slate-200 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
