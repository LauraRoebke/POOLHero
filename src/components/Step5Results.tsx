import React, { useRef, useState } from 'react';
import { PoolFinderState } from '../types';
import { analyzePoolData, isVacationContext } from '../utils/calculator';
import { exportElementToPdf } from '../utils/pdfExport';
import { 
  Printer, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  ShoppingCart, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  FileCheck, 
  Edit3, 
  HelpCircle, 
  Clock, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface Step5Props {
  state: PoolFinderState;
  onRestart: () => void;
  onEditStep: (stepNumber: number) => void;
}

export const Step5Results: React.FC<Step5Props> = ({ state, onRestart, onEditStep }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const actionPlanPdfRef = useRef<HTMLDivElement>(null);
  const customerServiceRef = useRef<HTMLDivElement>(null);

  const [isExportingActionPdf, setIsExportingActionPdf] = useState(false);
  const [isExportingCustomerPdf, setIsExportingCustomerPdf] = useState(false);
  const [addedCartIds, setAddedCartIds] = useState<Set<string>>(new Set());
  const [actionPdfSuccess, setActionPdfSuccess] = useState(false);
  const [customerPdfSuccess, setCustomerPdfSuccess] = useState(false);

  const analysis = analyzePoolData(state);

  const todayFormatted = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // 1. Handlung als PDF herunterladen / ausdrucken
  const handlePrintAction = async () => {
    if (!actionPlanPdfRef.current) return;
    setIsExportingActionPdf(true);

    try {
      const filename = `PoolHero_Handlungsplan_${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportElementToPdf(actionPlanPdfRef.current, { filename, marginMm: 6 });
      setActionPdfSuccess(true);
      setTimeout(() => setActionPdfSuccess(false), 5000);
    } catch (err) {
      console.error('Action plan PDF export failed, fallback to print:', err);
      window.print();
    } finally {
      setIsExportingActionPdf(false);
    }
  };

  // 2. Kundenservice Dossier als PDF exportieren
  const handleDownloadCustomerServicePdf = async () => {
    if (!customerServiceRef.current) return;
    setIsExportingCustomerPdf(true);

    try {
      const filename = `PoolHero_Kundenservice_Dossier_${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportElementToPdf(customerServiceRef.current, { filename, marginMm: 6 });
      setCustomerPdfSuccess(true);
      setTimeout(() => setCustomerPdfSuccess(false), 5000);
    } catch (err) {
      console.error('Customer service PDF export failed:', err);
      window.print();
    } finally {
      setIsExportingCustomerPdf(false);
    }
  };

  const toggleCart = (productId: string) => {
    setAddedCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Ursachenanalyse & Begründung
  const reasons: { title: string; explanation: string; severity: 'critical' | 'warning' | 'info' }[] = [];

  // pH-Wert
  if (state.waterValues.ph > 7.4) {
    reasons.push({
      title: `pH-Wert ist zu hoch (${state.waterValues.ph})`,
      explanation: `Bei einem pH-Wert über 7,4 verliert Desinfektionschlor bis zu 75% seiner Wirksamkeit. Zudem bilden sich rasch Kalkausfällungen und das Wasser reizt Augen und Schleimhäute.`,
      severity: state.waterValues.ph >= 7.8 ? 'critical' : 'warning',
    });
  } else if (state.waterValues.ph < 7.0) {
    reasons.push({
      title: `pH-Wert ist zu niedrig (${state.waterValues.ph})`,
      explanation: `Saures Wasser greift Beckenwände, Fugen, Poolfolie und metallische Einbauteile (z. B. Einlaufdüsen, Leitern, Wärmepumpen) korrosiv an.`,
      severity: state.waterValues.ph <= 6.6 ? 'critical' : 'warning',
    });
  }

  // Chlor / Desinfektion
  if (state.disinfectionMethod === 'chlorine') {
    if (state.waterValues.freeChlorine < 0.3) {
      reasons.push({
        title: `Freies wirksames Chlor ist zu niedrig (${state.waterValues.freeChlorine} mg/l)`,
        explanation: `Es besteht eine Desinfektionslücke im Wasser. Krankheitserreger, Bakterien und Algen können sich ungehindert ausbreiten.`,
        severity: 'critical',
      });
    }

    const boundChlorine = Math.max(0, Math.round((state.waterValues.totalChlorine - state.waterValues.freeChlorine) * 100) / 100);
    if (boundChlorine > 0.2) {
      reasons.push({
        title: `Erhöhtes gebundenes Chlor (${boundChlorine} mg/l)`,
        explanation: `Gebundenes Chlor (Chloramine) erzeugt stechenden Geruch sowie Augenreizungen und muss durch eine gezielte Stoßchlorung oxidiert und abgebaut werden.`,
        severity: 'warning',
      });
    }

    if (state.waterValues.cyanuricAcid > 50) {
      reasons.push({
        title: `Cyanursäure ist kritisch überhöht (${state.waterValues.cyanuricAcid} mg/l)`,
        explanation: `Bei Werten über 50 mg/l bindet die Cyanursäure das Chlor dauerhaft (Chlorblockade). Das Wasser wirkt trüb oder grün, obwohl der Tester Chlor anzeigt. Ein Teilwasserwechsel ist unumgänglich.`,
        severity: 'critical',
      });
    }
  }

  // Salzelektrolyse
  if (state.disinfectionMethod === 'salt') {
    if (state.waterValues.saltLevel < 3.0) {
      reasons.push({
        title: `Salzgehalt ist zu gering (${state.waterValues.saltLevel} g/l)`,
        explanation: `Die Salzelektrolysezelle kann nicht genügend Aktivchlor produzieren, was zu mangelnder Desinfektion führt.`,
        severity: 'warning',
      });
    }
    if (state.waterValues.redox < 700) {
      reasons.push({
        title: `Redox-Potential ist zu niedrig (${state.waterValues.redox} mV)`,
        explanation: `Die Entkeimungsgeschwindigkeit ist zu langsam (Sollwert: 700 - 750 mV).`,
        severity: 'warning',
      });
    }
  }

  // Sauerstoff
  if (state.disinfectionMethod === 'oxygen' && state.waterValues.activeOxygen < 5.0) {
    reasons.push({
      title: `Aktivsauerstoff-Gehalt zu niedrig (${state.waterValues.activeOxygen} mg/l)`,
      explanation: `Der Mindestwirkstoffgehalt für sicheren Schutz vor Bakterien und Algen ist unterschritten.`,
      severity: 'warning',
    });
  }

  // Brom
  if (state.disinfectionMethod === 'bromine' && (state.waterValues.bromine < 2.0 || state.waterValues.bromine > 4.0)) {
    reasons.push({
      title: `Bromgehalt weicht ab (${state.waterValues.bromine} mg/l)`,
      explanation: `Der ideale Bromwert liegt zwischen 2,0 und 4,0 mg/l.`,
      severity: 'warning',
    });
  }

  // Spezifische Problembefunde
  if (state.selectedProblems.includes('green_water')) {
    reasons.push({
      title: 'Akuter Algenbefall (Grünes Wasser)',
      explanation: 'Mikroskopische Algen schweben im Wasser und haben sich an Beckenwänden festgesetzt. Eine mechanische Reinigung mit anschließender Stoßchlorung und Algizid ist nötig.',
      severity: 'critical',
    });
  }

  if (state.selectedProblems.includes('cloudy_water')) {
    reasons.push({
      title: 'Trübes / milchiges Wasser',
      explanation: 'Feinste Schwebeteilchen können vom Filter nicht erfasst werden und müssen durch ein Flockmittel gebunden und ausgefiltert werden.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('slippery_surfaces')) {
    reasons.push({
      title: 'Glitschige Beckenwände & Biofilm',
      explanation: 'Ein Algen- und Bakterien-Biofilm bildet sich auf der Folie. Muss manuell abgebürstet und chemisch neutralisiert werden.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('foam_surface')) {
    reasons.push({
      title: 'Schaumbildung auf der Oberfläche',
      explanation: 'Verursacht durch Seifenreste, Sonnencremes oder nicht schaumfreie Algenverhütungsmittel.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('chlorine_smell')) {
    reasons.push({
      title: 'Starker Chlorgeruch & Reizungen',
      explanation: 'Unerwünschte Chlorverbindungen (Chloramine) müssen durch eine Schockbehandlung zerstört werden.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('brown_metallic')) {
    reasons.push({
      title: 'Braune / metallische Verfärbungen',
      explanation: 'Oxidierte Metalle (Eisen, Mangan, Kupfer aus Brunnenwasser) müssen gebunden und filtriert werden.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('scale_deposits')) {
    reasons.push({
      title: 'Kalkablagerungen & raue Wände',
      explanation: 'Kalkausfällungen durch hohen pH-Wert oder hohe Wasserhärte.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('corrosion')) {
    reasons.push({
      title: 'Rostende Metallteile & Korrosion',
      explanation: 'Sichtbare Korrosionsspuren an Leitern, Schrauben oder Einbauteilen deuten auf einen zu niedrigen/sauren pH-Wert (< 7,0), überdosiertes Chlor oder Salzelektrolyse ohne adäquate Opferanode hin.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('yellow_waterline')) {
    reasons.push({
      title: 'Gelblicher Schmutzrand an der Wasserlinie',
      explanation: 'Fettige Rückstände von Sonnenmilch, Kosmetika und Umweltschmutz schwimmen auf der Wasseroberfläche und brennen sich an der Folienkante ein. Spezial-Randreiniger und Skimmer-Vliese lösen das Problem.',
      severity: 'warning',
    });
  }

  if (state.selectedProblems.includes('bleached_liner')) {
    reasons.push({
      title: 'Ausgeblichene oder verblasste Folienbereiche',
      explanation: 'Punktuelle Folienaufhellungen entstehen typischerweise, wenn Chlortabletten direkt ins Becken geworfen werden oder Granulat ungelöst auf den Boden sinkt. Chlor stets vorlösen oder über den Dosierschwimmer zugeben.',
      severity: 'info',
    });
  }

  if (state.environment === 'heavy_trees') {
    reasons.push({
      title: 'Erhöhter Phosphateintrag (Starker Baumbestand)',
      explanation: 'Pollen und Laub füttern Algen kontinuierlich mit Phosphaten. Regelmäßige Schockung und Vorfilter-Reinigung sind nötig.',
      severity: 'info',
    });
  }

  if (state.filterType === 'cartridge' || state.filterType === 'balls') {
    const filterName = state.filterType === 'cartridge' ? 'Kartuschenfilter' : 'Filterbälle (Synthetik)';
    reasons.push({
      title: `Wichtiger Filterhinweis (${filterName})`,
      explanation: `Achtung: ${filterName} dürfen keinesfalls mit herkömmlichen Flockmitteln oder Flockkissen behandelt werden, da die feinen Poren des Filtermaterials verkleben. Bei Wassertrübungen ausschließlich flüssigen Spezial-Klarmacher verwenden oder das Filtermaterial manuell auswaschen.`,
      severity: 'info',
    });
  }

  if (isVacationContext(state.notes)) {
    reasons.push({
      title: 'Urlaubs-Vorsorge & Abwesenheits-Schutz aktiviert',
      explanation: 'Hinweis zur Abwesenheit: Für eine verlässliche Depotwirkung während längerer Abwesenheit ohne kontinuierliche manuelle Dosierung sind spezielle Langzeit-Schutzmaßnahmen und Depot-Chlortabletten in den Handlungsplan integriert.',
      severity: 'info',
    });
  }

  const isActionNeeded = reasons.length > 0 || analysis.status !== 'good' || analysis.dosages.length > 0;

  // Dringlichkeits- und Schwierigkeitssortierung
  const severityRank: Record<string, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  const sortedReasons = [...reasons].sort(
    (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9)
  );

  const sortedDosages = [...analysis.dosages].sort(
    (a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0)
  );

  // Labels for Kundenservice PDF
  const shapeNames: Record<string, string> = {
    rectangle: 'Rechteckbecken',
    round: 'Rundbecken',
    oval: 'Ovalbecken',
    eight: 'Achtformbecken',
    custom: 'Individuelle Form',
  };

  const poolTypeNames: Record<string, string> = {
    liner: 'Folienbecken / Styroporstein',
    concrete: 'Beton- / Fliesenbecken',
    polyester: 'GFK / Einstückbecken (Polyester)',
    intex: 'Aufstellbecken / Frame-Pool (Intex/Bestway)',
    stainless: 'Edelstahlbecken',
  };

  const filterNames: Record<string, string> = {
    sand: 'Sandfilteranlage (Quarzsand)',
    glass: 'Filterglas (AFM / Aktiviertes Glas)',
    cartridge: 'Kartuschenfilter',
    balls: 'Filterbälle (Synthetik)',
    filterballs: 'Filterbälle (Synthetik)',
  };

  const coverNames: Record<string, string> = {
    none: 'Keine Abdeckung',
    solar: 'Solarplane / GeoBubble',
    tarp: 'Planenabdeckung (Winter-/Sommerplane)',
    roller_safety: 'Roll- & Schutzabdeckung',
    dome: 'Cabrio Dome / Überdachung',
    safety: 'Roll- & Schutzabdeckung',
    roller: 'Roll- & Schutzabdeckung',
    enclosure: 'Cabrio Dome / Überdachung',
  };

  const envNames: Record<string, string> = {
    clean: 'Gering / Freie Fläche',
    indoor: 'Innenbereich (Hallenbad)',
    light_trees: 'Leichter Bewuchs / Garten',
    heavy_trees: 'Starker Baumbestand & Pollenflug',
    high_sun: 'Volle Sonneneinstrahlung (> 6 Std.)',
  };

  const problemNames: Record<string, string> = {
    routine_maintenance: 'Routine-Check (Kein akutes Problem)',
    green_water: 'Akuter Algenbefall (Grünes Wasser)',
    cloudy_water: 'Trübes / milchiges Wasser',
    slippery_surfaces: 'Glitschige Beckenwände & Biofilm',
    foam_surface: 'Schaumbildung auf der Oberfläche',
    chlorine_smell: 'Starker Chlorgeruch & Reizungen',
    brown_metallic: 'Braune / metallische Verfärbungen',
    scale_deposits: 'Kalkablagerungen & raue Wände',
    corrosion: 'Rostende Metallteile & Korrosion',
    yellow_waterline: 'Gelblicher Schmutzrand an der Wasserlinie',
    bleached_liner: 'Ausgeblichene oder verblasste Folienbereiche',
  };

  // =========================================================================
  // GEFORDERTE ZWEIZEILER FÜR DIE BEIDEN EXPORTE
  // =========================================================================

  // 1. Zweizeiler für "Handlung ausdrucken": Was passt momentan nicht?
  const getActionPlanTwoLiner = (): { line1: string; line2: string } => {
    const issues: string[] = [];
    const wv = state.waterValues;

    if (wv.ph > 7.4) {
      issues.push(`pH-Wert ist mit ${wv.ph} zu hoch (Ideal: 7,0–7,4).`);
    } else if (wv.ph < 7.0) {
      issues.push(`pH-Wert ist mit ${wv.ph} zu niedrig (Ideal: 7,0–7,4).`);
    }

    if (state.disinfectionMethod === 'chlorine') {
      if (wv.freeChlorine < 0.3) {
        issues.push(`Freies Chlor ist mit ${wv.freeChlorine} mg/l unzureichend.`);
      }
      if (wv.totalChlorine - wv.freeChlorine > 0.2) {
        issues.push(`Gebundenes Chlor erhöht (${(wv.totalChlorine - wv.freeChlorine).toFixed(2)} mg/l).`);
      }
      if (wv.cyanuricAcid > 50) {
        issues.push(`Cyanursäure mit ${wv.cyanuricAcid} mg/l kritisch erhöht.`);
      }
    } else if (state.disinfectionMethod === 'salt') {
      if (wv.saltLevel < 3.0) issues.push(`Salzgehalt (${wv.saltLevel} g/l) zu gering.`);
      if (wv.redox < 700) issues.push(`Redox (${wv.redox} mV) zu niedrig.`);
    } else if (state.disinfectionMethod === 'oxygen' && wv.activeOxygen < 5.0) {
      issues.push(`Aktivsauerstoff (${wv.activeOxygen} mg/l) zu niedrig.`);
    }

    if (state.selectedProblems.includes('green_water')) issues.push('Algenbefall vorhanden.');
    else if (state.selectedProblems.includes('cloudy_water')) issues.push('Wassertrübung festgestellt.');
    else if (state.selectedProblems.includes('slippery_surfaces')) issues.push('Glitschige Beckenwände.');

    if (issues.length === 0) {
      return {
        line1: 'Alle gemessenen Wasserwerte liegen im optimalen Idealbereich (pH 7,0–7,4 und korrekte Desinfektion).',
        line2: 'Es sind keine akuten Korrekturmaßnahmen nötig; die reguläre Dauerpflege wie gewohnt fortführen.'
      };
    }

    return {
      line1: `Aktueller Befund: ${issues.slice(0, 3).join(' ')}`,
      line2: 'Maßnahme: Zur Wiederherstellung der optimalen Wasserqualität die nachfolgend berechneten Dosierungen und Schritte in der angegebenen Reihenfolge durchführen.'
    };
  };

  // 2. Zweizeiler für "Kundenservice": Kompakte Tool-Empfehlung
  const getCustomerServiceToolTwoLiner = (): { line1: string; line2: string } => {
    if (analysis.status === 'good' || analysis.dosages.length === 0) {
      return {
        line1: 'System-Empfehlung: Keine akute Chemikaliendosierung erforderlich; alle Parameter liegen im Sollbereich.',
        line2: 'Gewohnte Dauerpflege (z.B. Langzeitchlortablette) und 8 Stunden tägliche Filterlaufzeit beibehalten.'
      };
    }

    const first = analysis.dosages[0];
    const second = analysis.dosages[1];

    let line1 = `System-Empfehlung: Vorrangig pH-Wert mit ${first.amount} ${first.productName} auf 7,2 einstellen`;
    if (second) {
      line1 += ` und anschließend ${second.amount} ${second.productName} zudosieren.`;
    } else {
      line1 += ' und nach 2 Stunden Filterlauf erneut prüfen.';
    }

    const line2 = 'Filteranlage für mindestens 24–48 Stunden im Dauerbetrieb laufen lassen und abschließend Rückspülung durchführen.';

    return { line1, line2 };
  };

  const actionTwoLiner = getActionPlanTwoLiner();
  const serviceTwoLiner = getCustomerServiceToolTwoLiner();

  // Slider controls for Recommended Products
  const products = analysis.recommendedProducts;
  const productSliderRef = useRef<HTMLDivElement>(null);

  const handleProductScrollLeft = () => {
    if (productSliderRef.current) {
      productSliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  const handleProductScrollRight = () => {
    if (productSliderRef.current) {
      productSliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* ========================================================= */}
      {/* TOP BAR / ERGEBNIS-KASTEN MIT BUTTONS                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1aabbb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#159ba9]">
              Schritt 5 von 5
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Ergebnis & Analyse
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individueller Handlungsplan mit exakten Dosierempfehlungen, Ursachenanalyse und Original-Pflegemitteln.
          </p>
        </div>

        {/* Buttons: Handlung ausdrucken, Kundenservice, Neu starten */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button 1: Handlung ausdrucken / PDF */}
          <button
            type="button"
            id="btn-print-action"
            onClick={handlePrintAction}
            disabled={isExportingActionPdf}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Druckt & lädt den kompakten Handlungs- & Dosierplan mit Zweizeiler, Dosierung und Schritten als PDF herunter"
          >
            {isExportingActionPdf ? (
              <Clock className="w-4 h-4 text-slate-600 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 text-slate-600" />
            )}
            <span>{isExportingActionPdf ? 'Erstelle PDF...' : 'Handlung ausdrucken'}</span>
          </button>

          {/* Button 2: Kundenservice (Ausführliches 2-teiliges Dossier für Support) */}
          <button
            type="button"
            id="btn-customer-service-pdf"
            onClick={handleDownloadCustomerServicePdf}
            disabled={isExportingCustomerPdf}
            className="px-4 py-2 rounded-xl bg-[#1aabbb] hover:bg-[#159ba9] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Erstellt eine zweigeteilte PDF-Übersicht für den Kundenservice (Kunden-Basisdaten & Tool-Empfehlung)"
          >
            {isExportingCustomerPdf ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            <span>{isExportingCustomerPdf ? 'Erstelle PDF...' : 'Kundenservice'}</span>
          </button>

          {/* Button 3: Neu starten */}
          <button
            type="button"
            id="btn-restart"
            onClick={onRestart}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Neu starten"
            aria-label="Neu starten"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success feedback toasts */}
      {actionPdfSuccess && (
        <div className="p-3.5 bg-emerald-50 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2 no-print shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Der <strong>Handlungs- & Dosierplan</strong> wurde erfolgreich als PDF generiert.</span>
        </div>
      )}

      {customerPdfSuccess && (
        <div className="p-3.5 bg-emerald-50 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2 no-print shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Das <strong>Kundenservice-Dossier</strong> wurde erfolgreich heruntergeladen.</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT WRAPPER: DIE 4 STRUKTURIERTEN BEREICHE (4 KÄSTEN)   */}
      {/* ========================================================= */}
      <div 
        ref={reportRef}
        id="pool-analysis-report"
        className="space-y-5 print-report"
      >
        {/* ========================================================= */}
        {/* 1. KASTEN: HANDLUNG NÖTIG?                                */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" id="section-action-needed">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#1d1f3e] text-white text-sm font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Handlung nötig?
            </h3>
          </div>

          {/* Große Ampel-Box mit Status */}
          <div 
            className={`p-6 sm:p-7 rounded-2xl border-2 ${
              !isActionNeeded
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : analysis.status === 'critical'
                ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                {!isActionNeeded ? (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                ) : analysis.status === 'critical' ? (
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                    <AlertOctagon className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-heading">
                    {isActionNeeded ? 'Ja, eine Handlung ist erforderlich!' : 'Nein, keine akute Handlung nötig!'}
                  </h4>
                  <span className={`text-xs sm:text-sm uppercase tracking-wider font-extrabold px-3 py-1 rounded-full ${
                    !isActionNeeded
                      ? 'bg-emerald-200 text-emerald-800'
                      : analysis.status === 'critical'
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {!isActionNeeded ? 'Optimalzustand' : analysis.status === 'critical' ? 'Dringend' : 'Empfohlen'}
                  </span>
                </div>

                <p className="text-base sm:text-lg text-slate-800 mt-2.5 leading-relaxed font-medium">
                  {analysis.summaryText}
                </p>
              </div>
            </div>
          </div>

          {/* Detaillierte Ursachen & Begründung: woran liegt es? */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#1aabbb]" />
              <span>Ursachen & mögliche Auslöser</span>
            </h4>

            {sortedReasons.length === 0 ? (
              <p className="text-sm text-slate-600 leading-relaxed">
                Alle gemessenen Wasserwerte liegen aktuell im optimalen Idealbereich nach den Richtlinien für privates Poolwasser. Es liegen keine akuten Verunreinigungen oder Algenbefall vor. Lediglich die gewohnte wöchentliche Pflege fortführen.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedReasons.map((r, idx) => (
                  <div key={idx} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 text-sm space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        r.severity === 'critical' ? 'bg-rose-500' : r.severity === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                      }`} />
                      <strong className="text-slate-900 font-bold text-base">{r.title}</strong>
                    </div>
                    <p className="text-slate-600 pl-5 leading-relaxed text-sm">{r.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. KASTEN: DOSIERUNGSEMPFEHLUNGEN                          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" id="section-dosages">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#1d1f3e] text-white text-sm font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                Dosierungsempfehlungen
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Berechnet auf Grundlage der gegebenen Angaben
            </span>
          </div>

          {sortedDosages.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>✓ Keine akuten Korrekturdosierungen erforderlich. Die normale Dauerpflege (z. B. 1 Chlortablette pro Woche) aufrechterhalten.</span>
            </div>
          ) : (
            <div className="space-y-3.5 w-full">
              {sortedDosages.map((dose) => (
                <div 
                  key={dose.id}
                  className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                        {dose.productName}
                      </h4>
                      {dose.urgent && (
                        <span className="text-xs uppercase font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                          Dringend erforderlich
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#1aabbb]">
                      {dose.purpose}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 sm:pl-6 sm:border-l border-slate-200">
                    <span className="text-xs sm:text-sm text-slate-500 block">Berechnete Menge:</span>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1d1f3e] font-heading block">
                      {dose.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Herstellerhinweis unten drunter im Kasten */}
          <div className="text-xs sm:text-sm text-slate-500 pt-3 border-t border-slate-100 flex items-start gap-1.5">
            <span className="text-slate-400 font-bold shrink-0">*</span>
            <span>Hinweis: Stets auch die Gebrauchsanweisung und Dosierangaben des jeweiligen Herstellers beachten.</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. KASTEN: EMPFOHLENE PRODUKTE (RESPONSIVER SLIDER)       */}
        {/* Produktbilder zeigen exakt die Verpackung & Artikelbezeichnung */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 no-action-print" id="section-recommended-products">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#1d1f3e] text-white text-sm font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                  Empfohlene Produkte
                </h3>
                <p className="text-sm text-slate-600 mt-0.5 font-medium">
                  Exakt auf den Handlungsplan abgestimmte Original-Pflegemittel
                </p>
              </div>
            </div>

            {/* Slider Nav Controls */}
            {products.length > 0 && (
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs sm:text-sm text-slate-500 mr-1 font-medium hidden sm:inline">
                  {products.length} {products.length === 1 ? 'Artikel' : 'Artikel empfohlen'}
                </span>
                <button
                  type="button"
                  onClick={handleProductScrollLeft}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  title="Vorherige Artikel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleProductScrollRight}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  title="Nächste Artikel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Responsive Slider Track: 3-4 cards visible on desktop */}
          {products.length === 0 ? (
            <p className="text-xs text-slate-400">Keine spezifischen Produkte erforderlich.</p>
          ) : (
            <div 
              ref={productSliderRef}
              className="flex gap-4 overflow-x-auto snap-x scroll-smooth pb-2 pt-1 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((prod) => {
                const isAdded = addedCartIds.has(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="w-[280px] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] min-w-[260px] snap-start shrink-0 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Produktbild: Zeigt die Verpackung mit aufgedruckter Artikelbezeichnung */}
                      <div className="w-full h-48 bg-slate-50/80 rounded-xl overflow-hidden border border-slate-100 relative flex items-center justify-center p-2 mb-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        {prod.badge && (
                          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs ${
                            prod.badge.toLowerCase().includes('bestseller')
                              ? 'bg-amber-400 text-amber-950'
                              : 'bg-[#1d1f3e] text-white'
                          }`}>
                            {prod.badge}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-slate-600 border border-slate-200 shadow-2xs">
                          {prod.unitSize}
                        </span>
                      </div>

                      {/* Brand / Hersteller */}
                      <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#159ba9] mb-1">
                        {prod.brand || 'POOL TOTAL'}
                      </div>

                      {/* Artikelbezeichnung */}
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]" title={prod.name}>
                        {prod.name}
                      </h4>

                      {/* Preis & Grundpreis */}
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900 font-heading">
                            {prod.price.toFixed(2).replace('.', ',')} € *
                          </span>
                          {prod.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {prod.originalPrice.toFixed(2).replace('.', ',')} €
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {prod.basePriceText || `(${prod.price.toFixed(2).replace('.', ',')} € pro ${prod.unitSize})`}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleCart(prod.id)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isAdded
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#1aabbb] hover:bg-[#159ba9] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Im Warenkorb</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>In den Warenkorb</span>
                          </>
                        )}
                      </button>

                      <a
                        href={prod.articleUrl || 'https://www.pool-total.de'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-center border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center justify-center gap-1 block"
                      >
                        <span>Zum Artikel</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. KASTEN: SCHRITT-FÜR-SCHRITT ANLEITUNG                  */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-4" id="section-step-by-step">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#1d1f3e] text-white text-sm font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Schritt-für-Schritt Anleitung
            </h3>
          </div>

          {/* Schritte vertikal untereinander aufgereiht */}
          <div className="space-y-3.5 w-full">
            {analysis.actionPlan.map((step) => (
              <div 
                key={step.stepNumber}
                className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-2xs hover:bg-slate-50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1d1f3e] text-white flex items-center justify-center text-base font-bold shrink-0 mt-0.5 shadow-xs">
                  {step.stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                      {step.title}
                    </h4>
                    <span className="text-xs sm:text-sm font-semibold text-[#159ba9] bg-[#1aabbb]/10 px-3 py-1 rounded-full border border-[#1aabbb]/20 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1aabbb]" />
                      {step.timeframe}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 mt-2.5 leading-relaxed font-normal">
                    {step.description}
                  </p>

                  {step.importantHint && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs shrink-0">Tipp</span>
                      <span>{step.importantHint}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* BOTTOM ACTION BAR (STANDARDIZED WITH STEPS 1-4)           */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#1d1f3e] to-[#1aabbb] text-white rounded-2xl p-6 shadow-md shadow-[#1aabbb]/20 flex flex-col sm:flex-row items-center justify-between gap-6 no-print">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-[#1aabbb]" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              Analyse abgeschlossen
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            Individueller Handlungsplan
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Eingaben anpassen</span>
          </button>

          <button
            type="button"
            id="step5-restart-btn"
            onClick={onRestart}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#1d1f3e] font-bold py-3.5 px-8 rounded-xl text-base transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer shrink-0"
          >
            <RotateCcw className="w-5 h-5 text-[#1aabbb]" />
            <span>Neue Analyse</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. PDF-VORLAGE: "HANDLUNG AUSDRUCKEN"                      */}
      {/* Oben: Zweizeiler was momentan nicht passt                  */}
      {/* Darunter: Dosierungsanweisung                              */}
      {/* Darunter: Schritt-für-Schritt Anleitung untereinander      */}
      {/* Übersichtlich, klar, ohne Schnickschnack                   */}
      {/* ========================================================= */}
      <div 
        style={{ position: 'fixed', left: '-9999px', top: 0, width: '900px', backgroundColor: '#ffffff', zIndex: -100 }}
      >
        <div 
          ref={actionPlanPdfRef}
          id="action-plan-pdf-container"
          className="bg-white p-8 text-slate-900 space-y-6 font-sans"
          style={{ width: '900px', backgroundColor: '#ffffff' }}
        >
          {/* Header */}
          <div className="border-b-2 border-[#1d1f3e] pb-4 flex justify-between items-end">
            <div>
              <div className="text-2xl font-black font-heading tracking-tight">
                <span className="text-[#1d1f3e]">POOL</span>
                <span className="text-[#1aabbb]">Hero</span>
                <span className="text-slate-800 font-bold ml-2">• Handlungs- & Dosierplan</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Pflege- und Dosierleitfaden zur Wiederherstellung optimaler Wasserwerte
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div><strong>Datum:</strong> {todayFormatted}</div>
              <div><strong>Beckenwasser:</strong> {state.volumeM3} m³ ({shapeNames[state.shape] || state.shape})</div>
              <div><strong>Desinfektion:</strong> {state.disinfectionMethod === 'chlorine' ? 'Chlor' : state.disinfectionMethod === 'salt' ? 'Salzelektrolyse' : state.disinfectionMethod === 'oxygen' ? 'Aktivsauerstoff' : 'Brom'}</div>
            </div>
          </div>

          {/* 1. TEIL OBEN: WAS PASST MOMENTAN NICHT? (ZWEIZEILER) */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1d1f3e] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#1aabbb]" />
              <span>Was passt momentan nicht? (Befund)</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {actionTwoLiner.line1}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {actionTwoLiner.line2}
            </p>
          </div>

          {/* 2. TEIL DARUNTER: DOSIERUNGSANWEISUNGEN */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1f3e]">
                Dosierungsanweisungen (für {state.volumeM3} m³ Beckeninhalt)
              </h3>
              <span className="text-[11px] text-slate-500">Exakt berechnete Wirkstoffmengen</span>
            </div>

            {sortedDosages.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                ✓ Keine akute Chemikaliendosierung erforderlich. Regelmäßige Dauerpflege aufrechterhalten.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedDosages.map((dose) => (
                  <div 
                    key={dose.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex justify-between items-center gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dose.productName}</span>
                        {dose.urgent && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                            Dringend
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#159ba9] font-medium">{dose.purpose}</div>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-100 shrink-0">
                      <div className="text-[10px] text-slate-400 font-medium">Berechnete Dosis</div>
                      <div className="text-lg font-black text-[#1d1f3e] font-heading">{dose.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. TEIL DARUNTER: SCHRITT-FÜR-SCHRITT ANLEITUNG UNTEREINANDER */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1f3e]">
                Schritt-für-Schritt Anleitung
              </h3>
              <span className="text-[11px] text-slate-500">In der angegebenen Reihenfolge durchführen</span>
            </div>

            <div className="space-y-2.5">
              {analysis.actionPlan.map((step) => (
                <div 
                  key={step.stepNumber}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#1d1f3e] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      <span className="text-[10px] font-semibold text-[#159ba9] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {step.timeframe}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                    {step.importantHint && (
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        <strong className="text-slate-800">Tipp: </strong>{step.importantHint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
            <span>Erstellt mit POOLHero • Bei Rückfragen steht Ihnen der POOL-Total Kundenservice gerne zur Seite.</span>
            <span>www.pool-total.de</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PDF-VORLAGE: "KUNDENSERVICE"                           */}
      {/* Aufgeteilt in ZWEI klare Abschnitte:                      */}
      {/* ABSCHNITT 1: Kundendaten & Basisdaten (Eingabe Grundlage)  */}
      {/* ABSCHNITT 2: System-Diagnose & Empfehlung (Zweizeiler &   */}
      {/*             Dosierungsliste)                             */}
      {/* ========================================================= */}
      <div 
        style={{ position: 'fixed', left: '-9999px', top: 0, width: '1000px', backgroundColor: '#ffffff', zIndex: -100 }}
      >
        <div 
          ref={customerServiceRef}
          id="customer-service-export-container"
          className="bg-white p-8 text-slate-900 space-y-6 font-sans"
          style={{ width: '1000px', backgroundColor: '#ffffff' }}
        >
          {/* Header */}
          <div className="border-b-2 border-[#1d1f3e] pb-4 flex justify-between items-end">
            <div>
              <div className="text-2xl font-black font-heading tracking-tight">
                <span className="text-[#1d1f3e]">POOL</span>
                <span className="text-[#1aabbb]">Hero</span>
                <span className="text-slate-700 font-bold ml-2">• Kundenservice Dossier</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Zweiteilige Fachübersicht: Kundendaten (Grundlage) und System-Empfehlung für die Kundenberatung
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div><strong>Datum:</strong> {todayFormatted}</div>
              <div><strong>Berechnet für:</strong> {state.volumeM3} m³ ({shapeNames[state.shape] || state.shape})</div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ABSCHNITT 1: EINGEGEBENE DATEN DES KUNDEN (GRUNDLAGE)    */}
          {/* ========================================================= */}
          <div className="border-2 border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1d1f3e] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1f3e]">
                  Abschnitt 1: Eingegebene Kundendaten & Pool-Basisdaten
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Datengrundlage</span>
            </div>

            {/* 1.1 Becken-Kenndaten & Maße */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">1.1 Becken-Kenndaten & Abmessungen:</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Beckenform:</span>
                  <span className="font-semibold text-slate-800">{shapeNames[state.shape] || state.shape}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Wasservolumen:</span>
                  <span className="font-bold text-[#1aabbb]">{state.volumeM3} m³ (ca. {(state.volumeM3 * 1000).toLocaleString('de-DE')} Liter)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Beckenbauart:</span>
                  <span className="font-semibold text-slate-800">{poolTypeNames[(state as any).poolType] || 'Standardbecken'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Abmessungen:</span>
                  <span className="font-semibold text-slate-800">
                    {state.shape === 'round' 
                      ? `Ø ${state.dimensions.diameter} m, Tiefe: ${state.dimensions.depth} m`
                      : `${state.dimensions.length} m x ${state.dimensions.width} m, Tiefe: ${state.dimensions.depth} m`}
                  </span>
                </div>
                <div className="flex justify-between py-1 col-span-2">
                  <span className="text-slate-500">Standort / Umgebungseinfluss:</span>
                  <span className="font-semibold text-slate-800">{envNames[state.environment] || state.environment} ({state.location === 'indoor' ? 'Innenbereich' : 'Außenbereich'})</span>
                </div>
              </div>
            </div>

            {/* 1.2 Ausrüstung & Technik */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">1.2 Ausrüstung, Abdeckung & Dosieranlagen:</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Filteranlage & Medium:</span>
                  <span className="font-semibold text-slate-800">{filterNames[state.filterType] || state.filterType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">Desinfektionsmethode:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {state.disinfectionMethod === 'chlorine' ? 'Chlor-Desinfektion' : state.disinfectionMethod === 'salt' ? 'Salzelektrolyse' : state.disinfectionMethod === 'oxygen' ? 'Aktivsauerstoff' : 'Brom'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Poolabdeckung:</span>
                  <span className="font-semibold text-slate-800">
                    {(() => {
                      const list = state.covers && state.covers.length > 0 ? state.covers : (state.cover ? [state.cover] : ['none']);
                      return list.map(c => coverNames[c] || c).join(', ');
                    })()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Automatische Dosieranlagen:</span>
                  <span className="font-semibold text-slate-800">
                    {(() => {
                      const actives: string[] = [];
                      if (state.autoDosing?.autoPh) actives.push('pH-Regulierung');
                      if (state.autoDosing?.autoSalt) actives.push('Salzelektrolyse');
                      if (state.autoDosing?.autoChlorine) actives.push('Chlor');
                      return actives.length > 0 ? actives.join(', ') : 'Keine (rein manuell)';
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* 1.3 Gemessene Wasserwerte */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">1.3 Gemessene Wasserwerte des Kunden:</div>
              <table className="w-full text-xs border border-slate-200 bg-white rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 text-left">Parameter</th>
                    <th className="p-2 text-center">Gemessener Wert</th>
                    <th className="p-2 text-center">Empfohlener Idealbereich</th>
                    <th className="p-2 text-right">Einstufung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-medium">pH-Wert</td>
                    <td className="p-2 text-center font-bold">{state.waterValues.ph}</td>
                    <td className="p-2 text-center text-slate-600">7,0 - 7,4</td>
                    <td className="p-2 text-right font-semibold">
                      {state.waterValues.ph >= 7.0 && state.waterValues.ph <= 7.4 ? 'Optimal' : state.waterValues.ph > 7.4 ? 'Zu hoch' : 'Zu niedrig'}
                    </td>
                  </tr>
                  {state.disinfectionMethod === 'chlorine' && (
                    <>
                      <tr>
                        <td className="p-2 font-medium">Freies Chlor (DPD 1)</td>
                        <td className="p-2 text-center font-bold">{state.waterValues.freeChlorine} mg/l</td>
                        <td className="p-2 text-center text-slate-600">0,3 - 1,0 mg/l</td>
                        <td className="p-2 text-right font-semibold">
                          {state.waterValues.freeChlorine >= 0.3 && state.waterValues.freeChlorine <= 1.0 ? 'Optimal' : state.waterValues.freeChlorine < 0.3 ? 'Zu niedrig' : 'Erhöht'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Gesamtchlor (DPD 3)</td>
                        <td className="p-2 text-center font-bold">{state.waterValues.totalChlorine} mg/l</td>
                        <td className="p-2 text-center text-slate-600">max. 0,2 über freiem Chlor</td>
                        <td className="p-2 text-right font-semibold">
                          {state.waterValues.totalChlorine - state.waterValues.freeChlorine > 0.2 ? 'Chloramin-Warnung' : 'Normal'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Cyanursäure (Stabilisator)</td>
                        <td className="p-2 text-center font-bold">{state.waterValues.cyanuricAcid} mg/l</td>
                        <td className="p-2 text-center text-slate-600">20 - 30 mg/l (max. 50)</td>
                        <td className="p-2 text-right font-semibold">
                          {state.waterValues.cyanuricAcid > 50 ? 'Chlorblockade' : state.waterValues.cyanuricAcid <= 30 ? 'Optimal' : 'Grenzwertig'}
                        </td>
                      </tr>
                    </>
                  )}
                  {state.disinfectionMethod === 'salt' && (
                    <>
                      <tr>
                        <td className="p-2 font-medium">Salzgehalt</td>
                        <td className="p-2 text-center font-bold">{state.waterValues.saltLevel} g/l</td>
                        <td className="p-2 text-center text-slate-600">3,0 - 4,0 g/l</td>
                        <td className="p-2 text-right font-semibold">
                          {state.waterValues.saltLevel >= 3.0 ? 'Optimal' : 'Zu niedrig'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Redox-Potential (ORP)</td>
                        <td className="p-2 text-center font-bold">{state.waterValues.redox} mV</td>
                        <td className="p-2 text-center text-slate-600">700 - 750 mV</td>
                        <td className="p-2 text-right font-semibold">
                          {state.waterValues.redox >= 700 ? 'Optimal' : 'Zu niedrig'}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td className="p-2 font-medium">Alkalinität (TA)</td>
                    <td className="p-2 text-center font-bold">{state.waterValues.alkalinity ?? 100} mg/l</td>
                    <td className="p-2 text-center text-slate-600">80 - 120 mg/l</td>
                    <td className="p-2 text-right font-semibold">
                      {(state.waterValues.alkalinity ?? 100) >= 80 && (state.waterValues.alkalinity ?? 100) <= 120 ? 'Optimal' : (state.waterValues.alkalinity ?? 100) < 80 ? 'Zu niedrig' : 'Erhöht'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Wassertemperatur</td>
                    <td className="p-2 text-center font-bold">{state.waterValues.waterTemp} °C</td>
                    <td className="p-2 text-center text-slate-600">24 - 28 °C</td>
                    <td className="p-2 text-right font-semibold">{state.waterValues.waterTemp > 28 ? 'Warm' : 'Normal'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1.4 Auffälligkeiten & Kundennotiz */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">1.4 Gemeldete Auffälligkeiten, Notizen & Foto:</div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 font-medium mr-1">Probleme:</span>
                  {state.selectedProblems.length === 0 ? (
                    <span className="text-slate-600">Keine Auffälligkeiten gemeldet (Routinepflege).</span>
                  ) : (
                    state.selectedProblems.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-semibold text-[11px] border border-slate-200">
                        {problemNames[p] || p}
                      </span>
                    ))
                  )}
                </div>
                {state.notes && (
                  <div className="border-t border-slate-100 pt-1.5 text-slate-700">
                    <span className="font-semibold text-slate-900">Kundennotiz:</span> "{state.notes}"
                  </div>
                )}
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Foto-Upload:</span>
                  <span className="font-medium text-slate-700">
                    {state.photo ? `Foto hochgeladen (${state.photo.name || 'pool_zustand.jpg'})` : 'Kein Foto hinterlegt'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ABSCHNITT 2: SYSTEM-DIAGNOSE & EMPFEHLUNG DES TOOLS       */}
          {/* ========================================================= */}
          <div className="border-2 border-[#1aabbb]/30 rounded-2xl p-5 space-y-4 bg-[#1aabbb]/5">
            <div className="flex items-center justify-between border-b border-[#1aabbb]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1aabbb] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1d1f3e]">
                  Abschnitt 2: System-Diagnose & Handlungsempfehlung (Tool-Ausgabe)
                </h3>
              </div>
              <span className="text-[11px] text-[#159ba9] font-bold">Auswertung für Kundenservice</span>
            </div>

            {/* 2.1 Kompakter 2-Zeiler: Was empfiehlt das Tool? */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-[#1d1f3e] uppercase tracking-wider">
                Tool-Empfehlung (Kompakter Befund):
              </div>
              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {serviceTwoLiner.line1}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {serviceTwoLiner.line2}
              </p>
            </div>

            {/* 2.2 Dosierungshinweise (Nur kurz als Liste / Tabelle) */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">
                Dosierungshinweise (Berechnete Mengen für {state.volumeM3} m³):
              </div>
              {analysis.dosages.length === 0 ? (
                <div className="text-xs text-emerald-800 bg-white p-2.5 rounded-xl border border-emerald-200 font-medium">
                  Keine chemischen Korrekturen erforderlich. Normale wöchentliche Dauerpflege aufrechterhalten.
                </div>
              ) : (
                <table className="w-full text-xs border border-slate-200 bg-white rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2 text-left">Empfohlenes Produkt</th>
                      <th className="p-2 text-center font-bold">Menge</th>
                      <th className="p-2 text-left">Zweck</th>
                      <th className="p-2 text-left">Dosierhinweis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.dosages.map(d => (
                      <tr key={d.id}>
                        <td className="p-2 font-bold text-slate-900">{d.productName}</td>
                        <td className="p-2 text-center font-black text-[#1aabbb]">{d.amount}</td>
                        <td className="p-2 text-slate-600">{d.purpose}</td>
                        <td className="p-2 text-slate-500 text-[11px]">{d.applicationNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 2.3 Wesentliche Maßnahmen im Überblick */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">Wesentliche Maßnahmen im Überblick:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {analysis.actionPlan.map(s => (
                  <div key={s.stepNumber} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="font-bold text-[#1aabbb] shrink-0">{s.stepNumber}.</span>
                    <div>
                      <div className="font-bold text-slate-900">{s.title} ({s.timeframe})</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Servicenotiz */}
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
              <span><strong>Kundenservice-Check:</strong> Daten und Dosierplan verifiziert durch POOLHero Analyse-Engine.</span>
              <span className="text-slate-500 font-mono">POOL-Total Support</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
