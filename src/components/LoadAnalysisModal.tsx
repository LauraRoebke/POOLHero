import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  getAllSavedAnalyses, 
  findAnalysisById, 
  deleteAnalysisById, 
  SavedAnalysis, 
  normalizeAnalysisId 
} from '../utils/analysisStore';
import { PoolFinderState, PoolShape } from '../types';

interface LoadAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadAnalysis: (state: PoolFinderState) => void;
}

export const LoadAnalysisModal: React.FC<LoadAnalysisModalProps> = ({
  isOpen,
  onClose,
  onLoadAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedList, setSavedList] = useState<SavedAnalysis[]>([]);
  const [searchResult, setSearchResult] = useState<SavedAnalysis | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedList(getAllSavedAnalyses());
      setSearchQuery('');
      setSearchResult(null);
      setHasSearched(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const query = searchQuery.trim();

    if (!query) {
      setErrorMessage('Bitte eine Vorgangs-ID eingeben (z. B. PH-84921).');
      return;
    }

    // Check if user pasted a URL with data
    if (query.includes('?analyse=') || query.includes('?id=') || query.includes('&d=')) {
      try {
        const urlObj = new URL(query.startsWith('http') ? query : `http://localhost/${query}`);
        const dataParam = urlObj.searchParams.get('d');
        const idParam = urlObj.searchParams.get('analyse') || urlObj.searchParams.get('id');

        if (dataParam) {
          const json = decodeURIComponent(escape(atob(decodeURIComponent(dataParam))));
          const compact = JSON.parse(json);
          const restoredState: PoolFinderState = {
            currentStep: 5,
            analysisId: compact.i || idParam || `PH-${Math.floor(10000 + Math.random() * 90000)}`,
            inputMode: 'direct',
            shape: (compact.s as PoolShape) || 'rectangle',
            dimensions: { length: 6, width: 3.5, depth: 1.4, diameter: 4 },
            volumeM3: compact.v || 30,
            location: compact.l || 'outdoor',
            environment: compact.e || 'light_trees',
            filterType: compact.f || 'sand',
            cover: compact.c?.[0] || 'solar',
            covers: compact.c || ['solar'],
            disinfectionMethod: compact.m || 'chlorine',
            waterValues: {
              ph: compact.wv?.ph ?? 7.4,
              freeChlorine: compact.wv?.fc ?? 0.5,
              totalChlorine: compact.wv?.tc ?? 0.8,
              cyanuricAcid: compact.wv?.cya ?? 25,
              saltLevel: compact.wv?.sl ?? 3.2,
              redox: compact.wv?.rx ?? 700,
              activeOxygen: compact.wv?.ao ?? 5,
              waterTemp: compact.wv?.t ?? 24,
              bromine: compact.wv?.br ?? 2.5,
              waterHardness: compact.wv?.h ?? 14,
              alkalinity: compact.wv?.alk,
            },
            autoDosing: {
              autoPh: compact.ad?.ph ?? false,
              autoChlorine: compact.ad?.cl ?? false,
              autoSalt: compact.ad?.sl ?? false,
            },
            selectedProblems: compact.p || [],
            notes: compact.n || '',
            photo: null,
          };

          onLoadAnalysis(restoredState);
          onClose();
          return;
        }
      } catch (err) {
        console.warn('URL parse error in modal search:', err);
      }
    }

    // Normal ID search
    const found = findAnalysisById(query);
    setHasSearched(true);
    if (found) {
      setSearchResult(found);
      setErrorMessage(null);
    } else {
      setSearchResult(null);
      const normalized = normalizeAnalysisId(query);
      setErrorMessage(`Keine gespeicherte Analyse unter der ID "${normalized || query}" auf diesem Gerät gefunden.`);
    }
  };

  const handleSelectAnalysis = (analysis: SavedAnalysis) => {
    onLoadAnalysis(analysis.state);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteAnalysisById(id);
    setSavedList(getAllSavedAnalyses());
    if (searchResult?.id === id) {
      setSearchResult(null);
    }
  };

  const copyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1aabbb]/10 text-[#159ba9] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-headline" className="text-lg sm:text-xl font-bold text-slate-800 font-heading">
                Analyse per Vorgangs-ID aufrufen
              </h3>
              <p className="text-xs text-slate-500">
                Bestehende Vorgänge mit allen Messwerten & Empfehlungen laden
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSearch} className="space-y-3">
            <label htmlFor="input-analysis-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vorgangs-ID / Service-Code eingeben
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-analysis-id"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="z. B. PH-84921 oder Direktlink"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1aabbb] focus:border-transparent font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#1aabbb] hover:bg-[#159ba9] text-white text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <span>Aufrufen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  Hinweis für den Kundenservice: Wurde die Analyse auf einem Kundengerät erstellt? Den <strong>Direktlink</strong> anfordern und oben in das Suchfeld einfügen.
                </p>
              </div>
            )}
          </form>

          {/* Direct Search Result Card */}
          {searchResult && (
            <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-[#1aabbb] shadow-sm flex items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#1d1f3e] font-mono tracking-wider">
                    {searchResult.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Gefunden
                  </span>
                  <span className="text-xs text-slate-400">
                    {searchResult.formattedDate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {searchResult.summary.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  Becken: {searchResult.summary.volumeM3} m³ • Desinfektion: {searchResult.summary.disinfectionMethod === 'chlorine' ? 'Chlor' : 'Salz'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectAnalysis(searchResult)}
                className="px-4 py-2 rounded-xl bg-[#1d1f3e] hover:bg-[#2a2d59] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <span>Analyse öffnen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Recent Saved Analyses List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              <span>Zuletzt erstellte Analysen ({savedList.length})</span>
            </h4>
            {savedList.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Klicken zum Sofort-Öffnen
              </span>
            )}
          </div>

          {savedList.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Bisher keine gespeicherten Analysen vorhanden
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Sobald eine Analyse in Schritt 5 abgeschlossen wird, wird automatisch eine Vorgangs-ID generiert und hier hinterlegt.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectAnalysis(item)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1aabbb] bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      item.summary.status === 'critical' 
                        ? 'bg-rose-500' 
                        : item.summary.status === 'warning' 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`} />

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-slate-900 group-hover:text-[#159ba9]">
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {item.formattedDate}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {item.summary.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => copyId(e, item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="ID in die Zwischenablage kopieren"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Aus Verlauf löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-[#159ba9] group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#1aabbb]" />
            <span>Kunden müssen lediglich die 5-stellige Vorgangs-ID (z. B. PH-84921) durchgeben.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
