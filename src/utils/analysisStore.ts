import { PoolFinderState, PoolShape, LocationType, EnvironmentExposure, FilterType, CoverType, DisinfectionMethod, WaterProblemId } from '../types';

export interface SavedAnalysis {
  id: string; // e.g. "PH-84921"
  createdAt: string; // ISO date string
  formattedDate: string;
  state: PoolFinderState;
  summary: {
    volumeM3: number;
    shape: string;
    disinfectionMethod: string;
    ph: number;
    status: 'good' | 'warning' | 'critical';
    problemsCount: number;
    title: string;
  };
}

const STORAGE_KEY = 'poolhero_saved_analyses_v1';

/**
 * Generate a clean, easily readable 5-digit analysis ID like "PH-84921"
 */
export function generateAnalysisId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PH-${randomNum}`;
}

/**
 * Normalize an ID for search: "ph 84921", "PH-84921", "#84921", "84921" -> "PH-84921"
 */
export function normalizeAnalysisId(rawInput: string): string {
  const cleaned = rawInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('PH')) {
    const numPart = cleaned.slice(2);
    return `PH-${numPart}`;
  }
  return `PH-${cleaned}`;
}

/**
 * Get all saved analyses from localStorage
 */
export function getAllSavedAnalyses(): SavedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SavedAnalysis[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Failed to load saved analyses from localStorage:', err);
    return [];
  }
}

/**
 * Save an analysis to localStorage
 */
export function saveAnalysis(state: PoolFinderState, customId?: string): SavedAnalysis {
  const all = getAllSavedAnalyses();
  const id = customId || state.analysisId || generateAnalysisId();
  const now = new Date();

  const formattedDate = now.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let status: 'good' | 'warning' | 'critical' = 'good';
  if (state.waterValues.ph > 7.6 || state.waterValues.ph < 6.8 || state.selectedProblems.includes('green_water')) {
    status = 'critical';
  } else if (state.waterValues.ph > 7.4 || state.waterValues.ph < 7.0 || state.selectedProblems.length > 0) {
    status = 'warning';
  }

  const newEntry: SavedAnalysis = {
    id,
    createdAt: now.toISOString(),
    formattedDate,
    state: {
      ...state,
      analysisId: id,
      createdAt: now.toISOString(),
    },
    summary: {
      volumeM3: state.volumeM3,
      shape: state.shape,
      disinfectionMethod: state.disinfectionMethod,
      ph: state.waterValues.ph,
      status,
      problemsCount: state.selectedProblems.filter((p) => p !== 'routine_maintenance').length,
      title: `${state.volumeM3} m³ Becken • pH ${state.waterValues.ph.toFixed(1)} • ${state.selectedProblems.length ? state.selectedProblems.length + ' Problem(e)' : 'Routine'}`,
    },
  };

  // Upsert: replace if existing, otherwise prepend
  const filtered = all.filter((item) => item.id !== id);
  const updated = [newEntry, ...filtered].slice(0, 30); // keep last 30

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist analysis to localStorage:', err);
  }

  return newEntry;
}

/**
 * Retrieve analysis by ID from localStorage
 */
export function findAnalysisById(searchId: string): SavedAnalysis | null {
  const normalized = normalizeAnalysisId(searchId);
  if (!normalized) return null;

  const all = getAllSavedAnalyses();
  const found = all.find((item) => normalizeAnalysisId(item.id) === normalized);
  return found || null;
}

/**
 * Delete an analysis from localStorage
 */
export function deleteAnalysisById(id: string): void {
  const all = getAllSavedAnalyses();
  const filtered = all.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to delete analysis:', e);
  }
}

/**
 * Compact payload encoding for cross-device sharing via URL query parameter
 */
interface CompactPayload {
  i: string; // id
  v: number; // volume
  s: string; // shape
  l: string; // location
  e: string; // environment
  f: string; // filter
  c: string[]; // covers
  m: string; // disinfection method
  wv: {
    ph: number;
    fc: number;
    tc: number;
    cya: number;
    sl: number;
    rx: number;
    ao: number;
    t: number;
    br: number;
    h: number;
    alk?: number;
  };
  p: string[]; // problems
  n?: string; // notes
  ad?: { ph: boolean; cl: boolean; sl: boolean };
}

export function encodeStateToShareUrl(analysisId: string, state: PoolFinderState): string {
  try {
    const compact: CompactPayload = {
      i: analysisId,
      v: state.volumeM3,
      s: state.shape,
      l: state.location,
      e: state.environment,
      f: state.filterType,
      c: state.covers || [state.cover],
      m: state.disinfectionMethod,
      wv: {
        ph: state.waterValues.ph,
        fc: state.waterValues.freeChlorine,
        tc: state.waterValues.totalChlorine,
        cya: state.waterValues.cyanuricAcid,
        sl: state.waterValues.saltLevel,
        rx: state.waterValues.redox,
        ao: state.waterValues.activeOxygen,
        t: state.waterValues.waterTemp,
        br: state.waterValues.bromine,
        h: state.waterValues.waterHardness,
        alk: state.waterValues.alkalinity,
      },
      p: state.selectedProblems,
      n: state.notes ? state.notes.slice(0, 300) : undefined,
      ad: state.autoDosing ? {
        ph: state.autoDosing.autoPh,
        cl: state.autoDosing.autoChlorine,
        sl: state.autoDosing.autoSalt,
      } : undefined,
    };

    const json = JSON.stringify(compact);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    
    // Build full URL
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?analyse=${analysisId}&d=${encoded}`;
  } catch (err) {
    console.error('Failed to encode state:', err);
    return `${window.location.origin}${window.location.pathname}?analyse=${analysisId}`;
  }
}

/**
 * Decode compact payload from URL parameter
 */
export function decodeStateFromUrl(): PoolFinderState | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('analyse') || params.get('id');
    const dataParam = params.get('d');

    // If we have an ID, check if it's already stored in localStorage
    if (idParam) {
      const local = findAnalysisById(idParam);
      if (local) {
        return local.state;
      }
    }

    // If we have a data parameter, decode it
    if (dataParam) {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(dataParam))));
      const compact: CompactPayload = JSON.parse(json);

      const restoredState: PoolFinderState = {
        currentStep: 5,
        analysisId: compact.i || idParam || generateAnalysisId(),
        inputMode: 'direct',
        shape: (compact.s as PoolShape) || 'rectangle',
        dimensions: { length: 6, width: 3.5, depth: 1.4, diameter: 4 },
        volumeM3: compact.v || 30,
        location: (compact.l as LocationType) || 'outdoor',
        environment: (compact.e as EnvironmentExposure) || 'light_trees',
        filterType: (compact.f as FilterType) || 'sand',
        cover: (compact.c && compact.c[0] as CoverType) || 'solar',
        covers: (compact.c as CoverType[]) || ['solar'],
        disinfectionMethod: (compact.m as DisinfectionMethod) || 'chlorine',
        waterValues: {
          ph: compact.wv.ph ?? 7.4,
          freeChlorine: compact.wv.fc ?? 0.5,
          totalChlorine: compact.wv.tc ?? 0.8,
          cyanuricAcid: compact.wv.cya ?? 25,
          saltLevel: compact.wv.sl ?? 3.2,
          redox: compact.wv.rx ?? 700,
          activeOxygen: compact.wv.ao ?? 5,
          waterTemp: compact.wv.t ?? 24,
          bromine: compact.wv.br ?? 2.5,
          waterHardness: compact.wv.h ?? 14,
          alkalinity: compact.wv.alk,
        },
        autoDosing: {
          autoPh: compact.ad?.ph ?? false,
          autoChlorine: compact.ad?.cl ?? false,
          autoSalt: compact.ad?.sl ?? false,
        },
        selectedProblems: (compact.p as WaterProblemId[]) || [],
        notes: compact.n || '',
        photo: null,
      };

      // Save into localStorage for future quick access
      saveAnalysis(restoredState, restoredState.analysisId);

      return restoredState;
    }

    return null;
  } catch (err) {
    console.error('Failed to decode state from URL:', err);
    return null;
  }
}
