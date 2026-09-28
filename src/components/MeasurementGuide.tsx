import React from 'react';
import { 
  HelpCircle, 
  X, 
  ArrowLeft, 
  AlertTriangle, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';

interface MeasurementGuideProps {
  activeTab: 'all' | 'shake' | 'strip' | 'photometer';
  onChangeTab: (tab: 'all' | 'shake' | 'strip' | 'photometer') => void;
  onBackToInputs: () => void;
  mode?: 'page' | 'modal';
  onSwitchToPage?: () => void;
}

export const MeasurementGuide: React.FC<MeasurementGuideProps> = ({
  activeTab,
  onChangeTab,
  onBackToInputs,
  mode = 'page',
  onSwitchToPage,
}) => {
  return (
    <div className={`space-y-6 ${mode === 'page' ? 'w-full max-w-5xl mx-auto py-2' : ''}`}>
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#1aabbb]/10 text-[#159ba9] rounded-xl shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#159ba9] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Praxisfibel & Ratgeber
              </span>
              {mode === 'modal' && onSwitchToPage && (
                <button
                  type="button"
                  onClick={onSwitchToPage}
                  className="text-xs text-slate-500 hover:text-[#159ba9] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Als eigene Vollbildseite öffnen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Eigene Seite</span>
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading mt-1">
              Anleitung: Wasserwerte richtig messen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Schritt-für-Schritt Anleitungen, Farbskalen-Hilfe & typische Messfehler vermeiden
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToInputs}
          className="inline-flex items-center gap-2 bg-[#1d1f3e] hover:bg-[#282b54] text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Werte-Eingabe</span>
        </button>
      </div>

      {/* 3 Methoden Filter-Tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Messmethode auswählen:
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            id="tab-all-methods"
            onClick={() => onChangeTab('all')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
              activeTab === 'all'
                ? 'bg-[#1d1f3e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            Alle 3 Methoden im Vergleich
          </button>
          <button
            type="button"
            id="tab-shake-method"
            onClick={() => onChangeTab('shake')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
              activeTab === 'shake'
                ? 'bg-[#1aabbb] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            1. Schütteltest (Tabletten)
          </button>
          <button
            type="button"
            id="tab-strip-method"
            onClick={() => onChangeTab('strip')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
              activeTab === 'strip'
                ? 'bg-[#1aabbb] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            2. Streifentest (Quick-Strips)
          </button>
          <button
            type="button"
            id="tab-photometer-method"
            onClick={() => onChangeTab('photometer')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
              activeTab === 'photometer'
                ? 'bg-[#1aabbb] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            3. Photometer (Digital)
          </button>
        </div>
      </div>

      {/* Grundregel für alle Methoden: Richtige Probenentnahme */}
      <div className="bg-gradient-to-br from-sky-50 to-teal-50/50 rounded-2xl p-5 sm:p-6 border border-sky-200 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2.5 text-sky-950 font-bold text-base sm:text-lg font-heading">
          <span className="w-7 h-7 rounded-full bg-[#159ba9] text-white flex items-center justify-center text-sm font-extrabold shrink-0">
            !
          </span>
          <span>Wichtigste Grundregel vor jedem Test: Die richtige Probenentnahme</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Wasserprobe <strong>niemals von der Wasseroberfläche</strong> entnehmen. An der Oberfläche verdampfen Desinfektionsmittel durch Sonneneinstrahlung besonders schnell, und Schmutzfilme verfälschen das Ergebnis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-sky-200/70 space-y-1">
            <span className="font-bold text-sky-900 block">30 bis 50 cm Tiefe</span>
            <span className="text-slate-600">Gefäß etwa eine Unterarmlänge tief unter die Wasseroberfläche tauchen.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-sky-200/70 space-y-1">
            <span className="font-bold text-sky-900 block">50 cm Abstand</span>
            <span className="text-slate-600">Nicht direkt vor Einlaufdüsen oder dem Skimmerkorb messen.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-sky-200/70 space-y-1">
            <span className="font-bold text-sky-900 block">Laufende Filterpumpe</span>
            <span className="text-slate-600">Das Wasser vor der Messung mindestens 30 Min. durchmischen lassen.</span>
          </div>
        </div>
      </div>

      {/* METHODE 1: SCHÜTTELTEST */}
      {(activeTab === 'all' || activeTab === 'shake') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-teal-50 text-[#159ba9] font-extrabold text-xs border border-teal-200">
                Methode 1
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                Manueller Schütteltest (Tablettentester)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Präziser Farbvergleich mit Phenol Red & DPD 1
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Der manuelle Schütteltest ist der bewährte Standard für Poolbesitzer: Er nutzt spezielle Indikatortabletten (<strong>Phenol Red</strong> für den pH-Wert und <strong>DPD 1</strong> für freies Chlor bzw. Brom), die sich im Poolwasser auflösen und dieses verfärben.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Ablauf Schritt für Schritt:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#1aabbb] text-white flex items-center justify-center text-xs">1</span>
                  <span>Wasser einfüllen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Das Testgerät ca. 30–50 cm tief unter Wasser tauchen, bis beide Messkammern vollständig und blasenfrei gefüllt sind.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#1aabbb] text-white flex items-center justify-center text-xs">2</span>
                  <span>Tabletten einwerfen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Die Tabletten direkt aus dem Blister in die Kammern drücken: <strong>Phenol Red</strong> (links/rot) und <strong>DPD 1</strong> (rechts/weiß). <em>Niemals mit bloßen Fingern berühren!</em>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#1aabbb] text-white flex items-center justify-center text-xs">3</span>
                  <span>15–20 Sek. kräftig schütteln</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Deckel fest aufdrücken und ca. 15 bis 20 Sekunden intensiv schütteln, bis sich die Tabletten vollständig aufgelöst haben.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#1aabbb] text-white flex items-center justify-center text-xs">4</span>
                  <span>Bei Tageslicht ablesen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Den Tester gegen neutrales Nord-Tageslicht (nicht in die direkte Sonne oder unter gelbes Glühlampenlicht) halten und die Färbung mit der Skala vergleichen.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Wichtiger Praxistipp für Schütteltester:
            </strong>
            <p className="leading-relaxed">
              Für manuelle Tester ausschließlich Reagenztabletten mit dem Aufdruck <strong>„Rapid“</strong> (z.B. DPD No. 1 Rapid) verwenden. Diese lösen sich beim Schütteln schnell von selbst auf. Tabletten mit der Kennzeichnung <em>„Photometer“</em> sind härter gepresst und für Schütteltester ungeeignet.
            </p>
          </div>
        </div>
      )}

      {/* METHODE 2: STREIFENTEST */}
      {(activeTab === 'all' || activeTab === 'strip') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 font-extrabold text-xs border border-sky-200">
                Methode 2
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                Streifentest (Teststreifen / Quick-Strips)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Schnelle Mehrfachmessung in 15 Sekunden
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Teststreifen bieten die schnellste Möglichkeit, sich einen Überblick über mehrere Parameter (pH, freies Chlor, Alkalinität, Gesamthärte) auf einen Streich zu verschaffen.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Ablauf Schritt für Schritt:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Trockene Entnahme</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Einen Teststreifen nur mit absolut trockenen Händen aus der Dose entnehmen und den Deckel sofort wieder luftdicht verschließen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>1–2 Sekunden eintauchen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Den Streifen ca. 20–30 cm tief für exakt <strong>1 bis 2 Sekunden</strong> ins Wasser eintauchen (nicht hin und her wirbeln).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Waagerecht halten (nicht schütteln!)</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Streifen herausnehmen und <strong>waagerecht</strong> mit den Farbkissen nach oben halten. Niemals abschütteln, da sonst Reagenzien in benachbarte Kissen laufen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>Nach exakt 15 Sekunden ablesen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Exakt 15 Sekunden warten und den Streifen direkt an die Farbskala der Dose halten. Nach mehr als 30 Sekunden verfärben sich die Felder durch Sauerstoffoxidation falsch.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 text-xs text-sky-950 space-y-1">
            <strong className="font-bold flex items-center gap-1.5 text-sky-900">
              <Clock className="w-4 h-4 text-sky-600" />
              Lagerungs- & Haltbarkeitshinweis:
            </strong>
            <p className="leading-relaxed">
              Teststreifen reagieren hochsensibel auf Luftfeuchtigkeit und Hitze. Dose stets kühl und trocken lagern (nicht in der prallen Sonne am Beckenrand liegen lassen). Nach Ablauf des Haltbarkeitsdatums liefern Teststreifen systematisch verfälschte pH- und Chlorwerte.
            </p>
          </div>
        </div>
      )}

      {/* METHODE 3: PHOTOMETER */}
      {(activeTab === 'all' || activeTab === 'photometer') && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-200">
                Methode 3
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                Elektronisches Photometer (PoolLab, Scuba II)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Digitale optische Sensor-Messkammer
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Ein Photometer misst die Lichtdurchlässigkeit der Wasserprobe mittels kalibrierter Sensoren und zeigt den exakten Wert digital als Zahl auf dem Display an. Subjektive Ablesefehler durch unterschiedliche Lichtverhältnisse sind damit ausgeschlossen.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">
              Ablauf Schritt für Schritt:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Messküvette füllen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Das Photometer oder die Küvette 30–50 cm tief ins Wasser tauchen, bis die Messkammer randvoll ist. Lichtschutzdeckel aufsetzen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Nullabgleich („ZERO“) durchführen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Die <strong>ZERO-Taste</strong> drücken. Das Gerät misst die Eigenfärbung und Trübung der Wasserprobe, um diese bei der späteren Berechnung exakt herauszufiltern.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Photometer-Tablette zerdrücken</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Tablette (Kennzeichnung <strong>„Photometer“</strong>!) hinzugeben und mit dem Rührstab gründlich zerdrücken, bis sie restlos gelöst ist. Deckel schließen.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>Messung starten & Wert ablesen</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Die <strong>TEST-Taste</strong> drücken. Nach wenigen Sekunden erscheint der präzise Messwert auf dem Display (z.B. „pH 7.24“ oder „fCl 0.62 mg/l“).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <strong className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Optik-Pflege für dauerhafte Präzision:
            </strong>
            <p className="leading-relaxed">
              Messkammer nach jedem Test sofort mit sauberem Leitungswasser ausspülen und die Außenwände der Küvette mit einem fusselfreien Tuch trocken wischen. Kalkflecken oder Fingerabdrücke im Strahlengang brechen das Licht und erzeugen Fehlmessungen.
            </p>
          </div>
        </div>
      )}

      {/* TYPISCHE MESSFEHLER & DER GEFÄHRLICHE AUSBLEICH-EFFEKT */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-base sm:text-lg font-heading">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Häufige Fehlerquellen & der tückische „Ausbleich-Effekt“</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-rose-900">
          <div className="bg-white/90 p-4 rounded-xl border border-rose-200/80 space-y-1.5">
            <strong className="text-sm font-bold block text-rose-950">
              1. Der Ausbleich-Effekt bei Schockchlorung:
            </strong>
            <p className="text-slate-700 leading-relaxed">
              Bei kurz zuvor durchgeführter Stoßchlorung mit einem Chlorwert über <strong>10 mg/l</strong> zerstört das überschüssige Chlor den Indikatorfarbstoff sofort. Die Probe bleibt transparent weiß, und man glaubt fälschlicherweise, gar kein Chlor im Wasser zu haben.
            </p>
            <span className="block font-semibold text-rose-800 pt-1">
              Lösung: Wasserprobe 1:1 mit reinem Leitungswasser verdünnen, erneut messen und den angezeigten Wert verdoppeln.
            </span>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-rose-200/80 space-y-1.5">
            <strong className="text-sm font-bold block text-rose-950">
              2. Freies Chlor vs. Gesamtchlor (DPD 1 vs. DPD 3):
            </strong>
            <p className="text-slate-700 leading-relaxed">
              <strong>DPD 1</strong> misst das aktive, desinfizierende <em>freie Chlor</em>. Erst nach zusätzlicher Zugabe einer <strong>DPD 3</strong> Tablette in dieselbe Probe wird das <em>Gesamtchlor</em> gemessen.
            </p>
            <span className="block font-semibold text-rose-800 pt-1">
              Faustregel: Die Differenz (Gesamtchlor minus freies Chlor) ergibt das „gebundene Chlor“ (Chloramine, Chlorgeruch). Dieser Wert sollte stets unter 0,2 mg/l liegen.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Back Button Banner */}
      <div className="bg-gradient-to-r from-[#1d1f3e] to-[#1aabbb] text-white rounded-2xl p-6 shadow-md shadow-[#1aabbb]/20 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="text-xl font-bold font-heading">
            Werte ermittelt? Zurück zur Eingabe
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Gemessene Werte in die Regler eintragen, um den individuellen Handlungsplan zu erhalten.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToInputs}
          className="bg-white hover:bg-slate-100 text-[#1d1f3e] font-extrabold text-sm sm:text-base py-3.5 px-7 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shadow-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#1aabbb]" />
          <span>← Zurück zur Werte-Eingabe (Schritt 3)</span>
        </button>
      </div>
    </div>
  );
};
