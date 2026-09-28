import React, { useRef, useState } from 'react';
import { 
  WaterProblemId, 
  UploadedPhoto 
} from '../types';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Info,
  Leaf,
  CloudFog,
  ShieldAlert,
  Wind,
  EyeOff,
  Droplets,
  Layers,
  Wrench,
  CircleDot,
  Palette,
  CheckCircle2,
  Sparkles,
  Palmtree,
  Snowflake,
  Flower2
} from 'lucide-react';

interface ProblemOptionWithIcon {
  id: WaterProblemId;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  defaultSeverity: 'low' | 'medium' | 'high' | 'info';
}

interface Step4Props {
  selectedProblems: WaterProblemId[];
  notes: string;
  photo: UploadedPhoto | null;
  onToggleProblem: (id: WaterProblemId) => void;
  onChangeNotes: (notes: string) => void;
  onPhotoUpload: (photo: UploadedPhoto | null) => void;
  onBack: () => void;
  onNext: () => void;
}

const PROBLEM_OPTIONS: ProblemOptionWithIcon[] = [
  {
    id: 'green_water',
    title: 'Grünes Wasser / Algenbildung',
    subtitle: 'Wasser ist grünlich verfärbt, Algen schweben im Becken, unzureichende Sichttiefe',
    icon: Leaf,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/60',
    defaultSeverity: 'high',
  },
  {
    id: 'cloudy_water',
    title: 'Trübes / milchiges Wasser',
    subtitle: 'Wasser wirkt undurchsichtig und stumpf, feine Schwebstoffe sind sichtbar',
    icon: CloudFog,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100 border-slate-200',
    defaultSeverity: 'medium',
  },
  {
    id: 'slippery_surfaces',
    title: 'Glitschige Beckenwände & rutschiger Boden',
    subtitle: 'Spürbarer Biofilm an Folienwänden, Einstiegstreppen und Bodenfugen',
    icon: ShieldAlert,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/60',
    defaultSeverity: 'high',
  },
  {
    id: 'foam_surface',
    title: 'Schaumbildung auf der Wasseroberfläche',
    subtitle: 'Weißer Schaum, vor allem bei laufender Pumpe oder Gegenstromanlage',
    icon: Wind,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 border-sky-200/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'chlorine_smell',
    title: 'Starker Chlorgeruch & brennende Augen',
    subtitle: 'Stechender Hallenbad-Geruch und Augenreizungen durch gebundenes Chlor',
    icon: EyeOff,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-200/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'brown_metallic',
    title: 'Braunes / rötlich-schwarzes Wasser',
    subtitle: 'Oxidiertes Brunnenwasser mit gelöstem Eisen, Mangan oder Kupfer',
    icon: Droplets,
    iconColor: 'text-amber-800',
    iconBg: 'bg-amber-100/60 border-amber-300/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'scale_deposits',
    title: 'Raue Kalkablagerungen / weiße Ränder',
    subtitle: 'Kalkkrusten an der Poolfolie, den Einlaufdüsen und an den Skimmern',
    icon: Layers,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200/60',
    defaultSeverity: 'low',
  },
  {
    id: 'corrosion',
    title: 'Rostende Metallteile & Korrosion',
    subtitle: 'Rostspuren an Einbauteilen, Einstiegsleitern, Schrauben oder Wärmetauschern',
    icon: Wrench,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 border-orange-200/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'yellow_waterline',
    title: 'Gelblicher Schmutzrand an der Wasserlinie',
    subtitle: 'Fett- und Kosmetikablagerungen, Sonnencreme und Schmutzränder am Beckenrand',
    icon: CircleDot,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50 border-yellow-200/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'bleached_liner',
    title: 'Ausgeblichene oder verblasste Folienbereiche',
    subtitle: 'Weiße oder ausgeblichene Stellen an der Poolfolie durch Chlorkonzentration oder UV',
    icon: Palette,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200/60',
    defaultSeverity: 'low',
  },
  {
    id: 'vacation',
    title: 'Urlaub & längere Abwesenheit',
    subtitle: 'Vorsorge für Urlaubszeit (Langzeit-Chlordepot, Algenschutz-Depot, Filterlaufzeiten)',
    icon: Palmtree,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/60',
    defaultSeverity: 'medium',
  },
  {
    id: 'spring_opening',
    title: 'Frühling / Auswinterung & Saisonstart',
    subtitle: 'Pool nach der Winterpause wieder in Betrieb nehmen, Grundreinigung und Schockchlorung',
    icon: Flower2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/60',
    defaultSeverity: 'info',
  },
  {
    id: 'winter_closing',
    title: 'Winter / Einwinterung & Winterschutz',
    subtitle: 'Pool winterfest machen (Aktiv- oder Passiv-Überwinterung), Frostschutz und Winterschutzmittel',
    icon: Snowflake,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 border-sky-200/60',
    defaultSeverity: 'info',
  },
  {
    id: 'routine_maintenance',
    title: 'Kein akutes Problem',
    subtitle: 'Nur Überprüfung der aktuellen Werte.',
    icon: CheckCircle2,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-200/60',
    defaultSeverity: 'info',
  },
];

export const Step4Problems: React.FC<Step4Props> = ({
  selectedProblems,
  notes,
  photo,
  onToggleProblem,
  onChangeNotes,
  onPhotoUpload,
  onBack,
  onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Bitte eine gültige Bilddatei (JPEG, PNG, WEBP) auswählen.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Die Datei ist zu groß (maximal 8 MB erlaubt).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onPhotoUpload({
        file,
        dataUrl,
        name: file.name,
        size: file.size,
      });
    };
    reader.onerror = () => {
      setUploadError('Fehler beim Einlesen des Fotos. Bitte erneut versuchen.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* Title Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#159ba9]">
              Schritt 4 von 5
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Probleme & Auffälligkeiten
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Aufgetretene Auffälligkeiten auswählen, optional ein Foto hochladen und Anmerkungen für die Diagnose hinterlegen.
          </p>
        </div>
      </div>

      {/* Auffälligkeiten Checkliste (2 Spalten nebeneinander auf Desktop) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
              Auffälligkeiten
            </h3>
            <span className="text-[11px] font-bold text-[#159ba9] bg-cyan-50 px-2 py-0.5 rounded-md">
              Mehrfachauswahl möglich
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Alle Punkte auswählen, die aktuell auf das Poolwasser zutreffen:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROBLEM_OPTIONS.map((item) => {
            const isChecked = selectedProblems.includes(item.id);
            const isRoutine = item.id === 'routine_maintenance';
            const IconComp = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => onToggleProblem(item.id)}
                className={`p-3.5 sm:p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  isRoutine ? 'col-span-full' : ''
                } ${
                  isChecked
                    ? 'bg-[#1aabbb]/10 text-[#1d1f3e] ring-2 ring-[#1aabbb]/40 shadow-xs'
                    : isRoutine
                      ? 'bg-slate-50/90 hover:bg-slate-100 text-slate-700'
                      : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-[#1aabbb] text-white shadow-2xs' : `${item.iconBg} ${item.iconColor}`
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-sm sm:text-base font-bold leading-tight ${isChecked ? 'text-[#1d1f3e]' : 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-[#1aabbb] text-white'
                      : 'bg-slate-200 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Foto-Upload & 3. Notizen: 2 Spalten nebeneinander auf Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Foto Upload Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 bg-cyan-50 text-[#159ba9] rounded-xl">
                <ImageIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  Foto hochladen (optional)
                </h3>
                <p className="text-xs text-slate-500">
                  Hilft bei der Sichtprüfung von Wassertrübungen und Algenbefall
                </p>
              </div>
            </div>

            {photo ? (
              <div className="mt-3 p-3 bg-slate-50/80 rounded-xl">
                <div className="relative rounded-lg overflow-hidden bg-white max-h-56 flex items-center justify-center">
                  <img
                    src={photo.dataUrl}
                    alt="Pool Vorschau"
                    className="max-h-56 w-auto object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onPhotoUpload(null)}
                    className="absolute top-2 right-2 bg-white/95 hover:bg-white text-rose-600 p-2 rounded-full shadow-md transition-all cursor-pointer"
                    title="Foto entfernen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="truncate max-w-[240px] font-medium">{photo.name}</span>
                  <span>{(photo.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-3 rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'bg-[#1aabbb]/10 ring-2 ring-[#1aabbb]/40'
                    : 'bg-slate-50/80 hover:bg-slate-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-[#159ba9] flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Foto hierher ziehen oder klicken zum Auswählen
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unterstützt JPG, PNG, WEBP bis zu 8 MB
                </p>
              </div>
            )}

            {uploadError && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl flex items-center gap-2 mt-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notizen Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  Notizen & bisherige Maßnahmen (optional)
                </h3>
                <p className="text-xs text-slate-500">
                  Besonderheiten (z.B. Starkregen, Neubefüllung, Tierhaare)
                </p>
              </div>
            </div>

            <textarea
              id="input-notes"
              rows={5}
              value={notes}
              onChange={(e) => onChangeNotes(e.target.value)}
              placeholder="Z.B.: Gestern 200g pH-Minus zugegeben, Rückspülung durchgeführt, Brunnenwasser nachgefüllt..."
              className="w-full bg-slate-50 focus:bg-white rounded-xl p-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#1aabbb]/25 transition-all outline-hidden resize-none"
            />
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-[#159ba9] shrink-0" />
            <span>Alle Angaben fließen in die Auswertung und den Handlungsplan ein.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
