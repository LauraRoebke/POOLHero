import { 
  PoolFinderState, 
  PoolShape, 
  PoolDimensions, 
  DosageItem, 
  ActionStep, 
  ProductItem, 
  WaterProblemId 
} from '../types';
import { POOL_PRODUCTS } from '../data/products';

export function calculateVolume(shape: PoolShape, dims: PoolDimensions): number {
  const { length, width, depth, diameter } = dims;
  let rawVolume = 0;

  switch (shape) {
    case 'rectangle':
      rawVolume = length * width * depth;
      break;
    case 'round':
      rawVolume = Math.PI * Math.pow(diameter / 2, 2) * depth;
      break;
    case 'oval':
      // standard oval formula approx. length * width * depth * 0.89
      rawVolume = length * width * depth * 0.89;
      break;
    case 'eight':
      // eight shape approx. max_length * max_width * depth * 0.85
      rawVolume = length * width * depth * 0.85;
      break;
    case 'custom':
    default:
      rawVolume = length * width * depth;
      break;
  }

  return Math.max(0, Math.round(rawVolume * 10) / 10);
}

export interface AnalysisOutput {
  status: 'good' | 'warning' | 'critical';
  headline: string;
  summaryText: string;
  dosages: DosageItem[];
  actionPlan: ActionStep[];
  recommendedProducts: ProductItem[];
  warnings: string[];
  isVacationCare?: boolean;
}

export function isVacationContext(notes?: string): boolean {
  if (!notes) return false;
  const lower = notes.toLowerCase();
  const vacationKeywords = [
    'urlaub', 'ferien', 'verreisen', 'verreise', 'reise', 
    'abwesend', 'abwesenheit', 'wegfahren', 'wegfahre', 
    'nicht da', 'sommerurlaub', 'urlaubszeit', 'urlaubsreise', 
    'urlaubsvorbereitung', 'fliege weg', 'wegfliege'
  ];
  return vacationKeywords.some(kw => lower.includes(kw));
}

export function analyzePoolData(state: PoolFinderState): AnalysisOutput {
  const volume = Math.max(1, state.volumeM3 || 25);
  const { waterValues, disinfectionMethod, selectedProblems, filterType, location, cover, covers } = state;

  const dosages: DosageItem[] = [];
  const actionPlan: ActionStep[] = [];
  const recommendedProductIds = new Set<string>();
  const warnings: string[] = [];

  let isCritical = false;
  let isWarning = false;

  // 1. pH-Wert Analyse
  const currentPh = waterValues.ph;
  const targetPh = 7.2;
  const phDiff = Math.round((currentPh - targetPh) * 100) / 100;

  if (currentPh > 7.4) {
    isWarning = true;
    if (currentPh >= 7.8) isCritical = true;

    // Faustformel: ca. 100g pH-Minus Granulat pro 10 m³ Wasser, um den pH-Wert um 0,1 zu senken
    const steps = Math.abs(currentPh - 7.2) / 0.1;
    const amountGrams = Math.round(steps * 100 * (volume / 10));
    const amountDisplay = amountGrams >= 1000 
      ? `${(amountGrams / 1000).toFixed(2)} kg` 
      : `${amountGrams} g`;

    dosages.push({
      id: 'ph-minus',
      productName: 'pH-Minus Granulat',
      amount: amountDisplay,
      unit: amountGrams >= 1000 ? 'kg' : 'g',
      purpose: `pH-Wert senken von ${currentPh} auf Idealwert 7,2`,
      applicationNote: 'In einem Eimer mit Poolwasser vorlösen und bei laufender Filteranlage entlang des Beckenrands verteilen. Bei mehr als 500g in 2-3 Teilportionen im Abstand von 2 Stunden zugeben.',
      urgent: true,
    });
    recommendedProductIds.add('ph-minus-granulat');
  } else if (currentPh < 7.0) {
    isWarning = true;
    if (currentPh <= 6.6) isCritical = true;

    // Faustformel: ca. 100g pH-Plus Granulat pro 10 m³ Wasser, um den pH-Wert um 0,1 zu heben
    const steps = Math.abs(7.2 - currentPh) / 0.1;
    const amountGrams = Math.round(steps * 100 * (volume / 10));
    const amountDisplay = amountGrams >= 1000 
      ? `${(amountGrams / 1000).toFixed(2)} kg` 
      : `${amountGrams} g`;

    dosages.push({
      id: 'ph-plus',
      productName: 'pH-Plus Granulat',
      amount: amountDisplay,
      unit: amountGrams >= 1000 ? 'kg' : 'g',
      purpose: `pH-Wert anheben von ${currentPh} auf Idealwert 7,2`,
      applicationNote: 'Im Eimer vorlösen und vor die Einlaufdüsen gießen. Nach 2 Stunden Filtration erneut messen.',
      urgent: true,
    });
    recommendedProductIds.add('ph-plus-granulat');
  }

  // 2. Cyanursäure (Chlorblockade) Check
  if (disinfectionMethod === 'chlorine' && waterValues.cyanuricAcid > 50) {
    isCritical = true;
    warnings.push(
      `Hoher Cyanursäurewert (${waterValues.cyanuricAcid} mg/l): Es droht eine Chlorblockade! Ein Teilwasserwechsel von mindestens 30-50% des Beckenvolumens (${Math.round(volume * 0.35)} m³) ist dringend empfohlen.`
    );
  }

  // 3. Chloramine / Geruch Check
  if (disinfectionMethod === 'chlorine' && waterValues.totalChlorine - waterValues.freeChlorine > 0.2) {
    isWarning = true;
    warnings.push(
      `Erhöhter Gehalt an gebundenem Chlor (${(waterValues.totalChlorine - waterValues.freeChlorine).toFixed(2)} mg/l): Verursacht Augenbrennen und typischen Hallenbadgeruch. Eine Stoßchlorung ist erforderlich.`
    );
  }

  // 4. Problem-Spezifische Berechnungen
  const hasGreenWater = selectedProblems.includes('green_water');
  const hasCloudyWater = selectedProblems.includes('cloudy_water');
  const hasSlippery = selectedProblems.includes('slippery_surfaces');
  const hasFoam = selectedProblems.includes('foam_surface');
  const hasSmell = selectedProblems.includes('chlorine_smell');
  const hasMetallic = selectedProblems.includes('brown_metallic');
  const hasScale = selectedProblems.includes('scale_deposits');
  const hasCorrosion = selectedProblems.includes('corrosion');
  const hasYellowWaterline = selectedProblems.includes('yellow_waterline');
  const hasBleachedLiner = selectedProblems.includes('bleached_liner');
  const isRoutine = selectedProblems.includes('routine_maintenance') || selectedProblems.length === 0;

  if (hasGreenWater || hasSlippery) {
    isCritical = true;
  } else if (hasCloudyWater || hasSmell || hasMetallic || hasScale || hasFoam || hasCorrosion || hasYellowWaterline) {
    isWarning = true;
  }

  // Stoßchlorung berechnen (bei Algen, Trübung, Geruch oder freiem Chlor < 0.3)
  const needsShockChlorine = hasGreenWater || hasCloudyWater || hasSlippery || hasSmell || (disinfectionMethod === 'chlorine' && waterValues.freeChlorine < 0.3);

  if (needsShockChlorine && (disinfectionMethod === 'chlorine' || disinfectionMethod === 'salt')) {
    // 200g Schnell-Chlorgranulat pro 10 m³
    const shockGrams = Math.round(200 * (volume / 10));
    dosages.push({
      id: 'shock-chlorine',
      productName: 'Schnell-Chlorgranulat 56% (Schockchlorung)',
      amount: shockGrams >= 1000 ? `${(shockGrams / 1000).toFixed(2)} kg` : `${shockGrams} g`,
      unit: shockGrams >= 1000 ? 'kg' : 'g',
      purpose: 'Sofortige Desinfektion, oxidiert Algen, Bakterien und zersetzt Chloramine',
      applicationNote: 'Erst NACH Einstellung des pH-Wertes auf 7,0-7,2 zugeben! Im Eimer mit lauwarmem Wasser anrühren und abends bei laufender Pumpe zugeben.',
      urgent: true,
    });
    recommendedProductIds.add('chlor-53-granulat');
  }

  // Algenvernichter
  if (hasGreenWater || hasSlippery) {
    // 100ml pro 10 m³ als Schockdosis
    const algaecideMl = Math.round(100 * (volume / 10));
    dosages.push({
      id: 'algaecide',
      productName: 'Algen-Ex Spezial Schaumfrei',
      amount: algaecideMl >= 1000 ? `${(algaecideMl / 1000).toFixed(2)} Liter` : `${algaecideMl} ml`,
      unit: algaecideMl >= 1000 ? 'l' : 'ml',
      purpose: 'Tötet Schwebealgen und Wandbeläge ab und verhindert schnellen Neubefall',
      applicationNote: 'Ca. 2 Stunden nach der Schockchlorung ringsum ins Becken gießen. Beckenwände mit einer Poolbürste mechanisch gründlich abbürsten.',
      urgent: true,
    });
    recommendedProductIds.add('algen-ex-spezial');
  }

  // Flockung / Klarmacher nach Filterart
  if (hasGreenWater || hasCloudyWater) {
    if (filterType === 'sand' || filterType === 'glass') {
      const cartridges = Math.max(1, Math.round(volume / 40));
      dosages.push({
        id: 'flocculant',
        productName: 'Flockmittel-Kartuschen (Skimmer)',
        amount: `${cartridges} Kartusche${cartridges > 1 ? 'n' : ''}`,
        unit: 'Stk',
        purpose: 'Schärft das Filterbett und filtert feinst suspendierte Trübstoffe heraus',
        applicationNote: 'Direkt in den Skimmerkorb legen (nach Filterrückspülung). Pumpe mindestens 48 Stunden durchlaufen lassen.',
        urgent: false,
      });
      recommendedProductIds.add('flockfix-kartuschen');
    } else {
      // Kartuschenfilter oder Filterbälle: KEIN Standard-Flockmittel!
      const klarMl = Math.round(50 * (volume / 10));
      dosages.push({
        id: 'superklar',
        productName: 'Klarmacher Spezial (Flüssig)',
        amount: `${klarMl} ml`,
        unit: 'ml',
        purpose: 'Bindet Schwebepartikel klumpenfrei ohne Kartuschenfilter zu verkleben',
        applicationNote: 'Speziell für Kartuschenfilter/Filterbälle geeignet. Vor die Einlaufdüse dosieren und Filter regelmäßig ausspülen.',
        urgent: false,
      });
      recommendedProductIds.add('superklar-kartusche');
    }
  }

  // Metall-Ex
  if (hasMetallic) {
    const metalMl = Math.round(40 * volume);
    dosages.push({
      id: 'metal-ex',
      productName: 'Metall-Ex Speziallöser',
      amount: metalMl >= 1000 ? `${(metalMl / 1000).toFixed(1)} Liter` : `${metalMl} ml`,
      unit: 'ml',
      purpose: 'Neutralisiert und bindet Eisen-, Mangan- und Kupfer-Ionen im Wasser',
      applicationNote: 'Bei laufender Filteranlage vor die Einlaufdüsen gießen. Nach 48 Stunden Filter rückspülen.',
      urgent: true,
    });
    recommendedProductIds.add('metall-ex');
  }

  // Kalk / Randreiniger (Kalk oder Fett/Sonnenmilch)
  if (hasScale || hasYellowWaterline) {
    const isAlkalineNeeded = hasYellowWaterline && !hasScale;
    dosages.push({
      id: 'scale-cleaner',
      productName: isAlkalineNeeded ? 'Beckenrandreiniger Intensiv (Fett- & Rußlöser)' : 'Beckenrandreiniger Sauer (Kalklöser)',
      amount: 'Bedarfsgerecht',
      unit: 'Sprühflasche',
      purpose: isAlkalineNeeded
        ? 'Löst organische Fett-, Ruß- und Sonnenmilch-Rückstände an der Wasserlinie'
        : 'Löst mineralische Verkrustungen und Kalkränder an der Wasserlinie',
      applicationNote: 'Mit Schwamm oder Bürste unverdünnt auf die trockene Wasserlinie auftragen, 5 Min. einwirken lassen und abwischen.',
      urgent: false,
    });
    recommendedProductIds.add('randreiniger-sauer');
  }

  // Salznachdosierung bei Salzelektrolyse
  if (disinfectionMethod === 'salt') {
    const targetSalt = 3.5; // 3,5 g/l
    const currentSalt = waterValues.saltLevel;
    if (currentSalt < 3.0) {
      const neededKg = Math.round((targetSalt - currentSalt) * volume);
      if (neededKg > 0) {
        dosages.push({
          id: 'pool-salt',
          productName: 'Reinstes Poolsiedesalz EN 16401',
          amount: `${neededKg} kg`,
          unit: 'kg',
          purpose: `Salzgehalt anheben von ${currentSalt} g/l auf Sollwert ${targetSalt} g/l`,
          applicationNote: 'Salzsäcke gleichmäßig im Becken verteilen. Salzanlage während des Auflösens für 24h ausschalten, Umwälzpumpe laufen lassen.',
          urgent: true,
        });
        recommendedProductIds.add('pool-spezialsalz');
      }
    }
  }

  // Dauerdesinfektion & Messgerät immer als Empfehlung
  if (disinfectionMethod === 'chlorine') {
    recommendedProductIds.add('chlor-langzeit-tabs');
  } else if (disinfectionMethod === 'oxygen') {
    recommendedProductIds.add('mypool-sauerstoff-aktivator');
    recommendedProductIds.add('cristal-aktivsauerstoff');
  }
  recommendedProductIds.add('elektronischer-pooltester');

  // Schritt-für-Schritt Handlungsplan generieren
  let stepCounter = 1;

  actionPlan.push({
    stepNumber: stepCounter++,
    title: 'Mechanische Vorreinigung & Filterrückspülung',
    timeframe: 'Tag 1 - Sofort (Dauer ca. 20 Minuten)',
    description: `Groben Schmutz, Laub und Äste mit dem Kescher entfernen. Eine gründliche Filterrückspülung (bei Sand/Glas mind. 2-3 Minuten, anschließend 30 Sek. Nachspülen) durchführen bzw. die Filterkartusche mit einem scharfen Wasserstrahl reinigen.`,
    importantHint: 'Ein sauberer Filter ist das Fundament für die Wirksamkeit aller chemischen Pflegemittel.',
  });

  if (currentPh < 7.0 || currentPh > 7.4) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: `pH-Wert exakt auf 7,0 - 7,2 einstellen`,
      timeframe: 'Tag 1 - Direkt nach der Vorreinigung',
      description: `Die berechnete Menge ${currentPh > 7.4 ? 'pH-Minus' : 'pH-Plus'} schrittweise zugeben. Bei falschem pH-Wert verliert Chlor bis zu 80% seiner Desinfektionswirkung!`,
      importantHint: 'Erst wenn der pH-Wert stabil zwischen 7,0 und 7,4 liegt, dürfen Schockmittel oder Algizide hinzugefügt werden.',
    });
  }

  if (needsShockChlorine) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Schockchlorung / Stoßdesinfektion durchführen',
      timeframe: 'Tag 1 - Am späten Nachmittag oder Abend',
      description: `Das Chlorgranulat vollständig in einem Eimer mit Wasser auflösen und gleichmäßig vor den Einlaufdüsen verteilen. Schockchlorungen immer abends durchführen, da UV-Licht der Sonne das freie Chlor sonst zu schnell zersetzt.`,
      importantHint: hasGreenWater 
        ? 'Bei starkem Algenbefall zusätzlich die Beckenwände und Ecken intensiv mit der Bürste abschrubben, um den Biofilm aufzubrechen.' 
        : undefined,
    });
  }

  if (hasGreenWater || hasSlippery) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Algenbekämpfung mit Breitband-Algizid',
      timeframe: 'Tag 1 - ca. 1-2 Stunden nach der Schockchlorung',
      description: `Das Algen-Ex Spezial ringsherum ins Poolwasser dosieren. Es verhindert die Zellteilung verbliebener Algen und sorgt für nachhaltigen Schutz.`,
      importantHint: 'Niemals Schockchlor und Algizid gleichzeitig im selben Eimer mischen!',
    });
  }

  if (hasGreenWater || hasCloudyWater) {
    const isSandOrGlass = filterType === 'sand' || filterType === 'glass';
    actionPlan.push({
      stepNumber: stepCounter++,
      title: isSandOrGlass ? 'Flockmittel für Kristallklarheit einsetzen' : 'Trübungsbeseitiger (Klarmacher) zugeben',
      timeframe: 'Tag 2 - Morgens',
      description: isSandOrGlass
        ? `Die empfohlene Flockmittel-Kartusche in den Skimmerkorb legen. Die Wirkstoffe bilden auf dem Filtersand/Glas eine mikrofeine Schutzschicht, die Trübstoffe bis zu 0,1 Mikrometer bindet.`
        : `Den Klarmacher direkt vor die Einlaufdüsen geben. Dieser ist speziell schonend für Kartuschenfilter und verklumpt die Lamellen nicht.`,
      importantHint: 'Die Filterpumpe ununterbrochen für mindestens 24 bis 48 Stunden durchlaufen lassen.',
    });
  }

  if (hasYellowWaterline) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Wasserlinie & Skimmerrand reinigen',
      timeframe: 'Tag 1 - Vor der Wasserdesinfektion',
      description: 'Wasserspiegel um 2-3 cm absenken und die fettigen Rückstände an der Wasserlinie mit Randreiniger und einem Reinigungspad abwaschen. Das verhindert dauerhaftes Einbrennen in die Poolfolie.',
      importantHint: 'Tipp: Ein Skimmer-Filterbeutel (Skimmer-Sock) fängt künftig Öle und Sonnenmilchreste ab, bevor sie die Wasserlinie verschmutzen.',
    });
  }

  if (hasCorrosion) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Korrosionsprüfung & pH-Pufferung',
      timeframe: 'Tag 1 - Sofort',
      description: 'Sicherstellen, dass der pH-Wert nicht unter 7,0 absinkt, da saures Wasser Metallteile massiv angreift. Bei Salzelektrolysebecken die Opferanoden überprüfen und rostige Schrauben/Teile durch V4A-Edelstahl ersetzen.',
      importantHint: 'Rostpartikel im Wasser können sich in der Poolfolie festsetzen und unschöne Rostflecken verursachen.',
    });
  }

  if (hasBleachedLiner) {
    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Folienentlastung & Chemiedosierung anpassen',
      timeframe: 'Laufender Betrieb',
      description: 'Ausgeblichene Stellen entstehen durch ungelöste Chlortabletten oder Granulat auf dem Boden. Chemikalien niemals direkt ins Becken werfen, sondern immer im Skimmer, Dosierschwimmer oder vorher im Wassereimer auflösen.',
      importantHint: 'Ein stabiler pH-Wert (7,0 - 7,2) und UV-Schutzabdeckungen schonen die Weichmacher der Folie nachhaltig.',
    });
  }

  const hasNoCover = (covers && covers.includes('none')) || (!covers && cover === 'none') || (covers && covers.length === 0);

  actionPlan.push({
    stepNumber: stepCounter++,
    title: 'Kontrollmessung & Übergang zur Dauerpflege',
    timeframe: 'Tag 3 - Nach 48 Stunden Dauerfiltration',
    description: `Mit dem Pooltester erneut den pH-Wert sowie den Gehalt an freiem Chlor kontrollieren. Nach erfolgreicher Klärung eine Langzeit-Chlortablette in den Dosierschwimmer oder Skimmer einsetzen bzw. die Salzelektrolyse wieder auf Normalbetrieb schalten.`,
    importantHint: hasNoCover 
      ? 'Tipp: Eine Solar- oder Abdeckplane schützt das Poolwasser vor neuem Schmutzeintrag und verringert den Chemikalienverbrauch um bis zu 40%.' 
      : undefined,
  });

  // Headline und Summary Text
  let headline = 'Guter Wasserzustand - Routinepflege empfohlen';
  let summaryText = 'Die gemessenen Parameter liegen im optimalen Idealbereich. Es liegen keine akuten Verunreinigungen vor.';

  if (isCritical) {
    headline = 'Akuter Handlungsbedarf: Wasserqualität beeinträchtigt!';
    summaryText = `Es wurden kritische Abweichungen der Wasserwerte oder akute Verunreinigungen festgestellt${hasGreenWater ? ' (akuter Algenbefall)' : currentPh > 7.6 ? ' (stark überhöhter pH-Wert)' : ''}. Die nachfolgenden Maßnahmen zeitnah durchführen, um ein Umkippen des Wassers zu stoppen und das biologische Gleichgewicht wiederherzustellen.`;
  } else if (isWarning) {
    headline = 'Korrekturmaßnahmen erforderlich';
    summaryText = 'Einige Wasserparameter weichen vom optimalen Idealbereich ab oder es liegen Trübungen bzw. Auffälligkeiten vor. Durch gezielte Dosiereinstellungen lässt sich das mikrobiologische Gleichgewicht in 24-48 Stunden wiederherstellen.';
  }

  // Urlaubs-Vorsorge: Berücksichtigung von Notizen ODER ausgewähltem Problem "vacation"
  const isVacation = isVacationContext(state.notes) || (selectedProblems && selectedProblems.includes('vacation'));
  const isSpring = selectedProblems && selectedProblems.includes('spring_opening');
  const isWinter = selectedProblems && selectedProblems.includes('winter_closing');

  if (isVacation) {
    recommendedProductIds.add('chlor-langzeit-tabs');
    recommendedProductIds.add('algen-ex-spezial');

    // Wenn Werte ideal sind:
    if (!isCritical && !isWarning) {
      headline = 'Wasserwerte optimal – Urlaubs- & Abwesenheits-Vorsorge beachten!';
      summaryText = 'Die Wasserwerte sind optimal im Gleichgewicht. Gezielte Vorkehrungen für Urlaubszeit bzw. längere Abwesenheit: Ohne regelmäßige Wasserpflege und Badebetrieb kann das Wasser bei Sommerhitze während der Abwesenheit schnell instabil werden.';

      // Urlaubs-Dosierungen hinzufügen
      const vacationTabsCount = Math.max(1, Math.round(volume / 25));
      dosages.push({
        id: 'vacation-tabs',
        productName: 'Langzeit-Chlortablette 200g (Urlaubs-Dauerpflege)',
        amount: `${vacationTabsCount} Tablette${vacationTabsCount > 1 ? 'n' : ''}`,
        unit: 'Stk',
        purpose: 'Sichert die kontinuierliche Grunddesinfektion über 1 bis 2 Wochen Urlaubszeit',
        applicationNote: 'In den Dosierschwimmer oder Skimmerkorb legen. Löst sich langsam und gleichmäßig auf, ohne dass ein ständiges Eingreifen erforderlich ist.',
        urgent: true,
      });

      const algaecideMl = Math.round(50 * (volume / 10));
      dosages.push({
        id: 'vacation-algaecide',
        productName: 'Algen-Ex Spezial Schaumfrei (Präventiv-Depot)',
        amount: algaecideMl >= 1000 ? `${(algaecideMl / 1000).toFixed(1)} Liter` : `${algaecideMl} ml`,
        unit: algaecideMl >= 1000 ? 'l' : 'ml',
        purpose: 'Vorbeugender Algenschutz vor der Abreise gegen Sporen- und Algenbildung während der Abwesenheit',
        applicationNote: 'Ca. 24 Stunden vor der Abreise bei laufender Pumpe direkt ins Beckenwasser gießen.',
        urgent: false,
      });

      // Handlungsplan für Urlaubs-Vorsorge strukturieren
      actionPlan.length = 0;
      let vacationStep = 1;

      actionPlan.push({
        stepNumber: vacationStep++,
        title: 'Vor Abreise: Gründliche Filterrückspülung & Skimmer leeren',
        timeframe: '1–2 Tage vor der Abreise',
        description: 'Die Filteranlage gründlich 3–4 Minuten lang rückspülen (bei Kartuschen: Filter gründlich mit Wasserstrahl reinigen). Den Skimmerkorb sowie den Vorfilter der Pumpe von Blättern und Schmutz leeren.',
        importantHint: 'Ein frisch gereinigter Filter garantiert ungehinderten Durchfluss und verhindert gefährliche Druckspitzen während der Abwesenheit.',
      });

      actionPlan.push({
        stepNumber: vacationStep++,
        title: 'Urlaubs-Depot einrichten (Langzeit-Chlortablette & Algizid)',
        timeframe: 'Am Tag vor der Abreise',
        description: `${vacationTabsCount} Langzeit-Chlortablette(n) (200g) in den Dosierschwimmer (Schlitze auf mittlere Öffnung stellen) oder Skimmer legen. Die empfohlene Vorbeugedosis Algen-Ex Spezial ringsherum ins Poolwasser geben.`,
        importantHint: 'Tabletten niemals direkt auf den Beckenboden werfen (Bleichflecken-Gefahr auf der Folie)!',
      });

      actionPlan.push({
        stepNumber: vacationStep++,
        title: 'Filterlaufzeiten per Zeitschaltuhr sichern (Pumpe NIEMALS ausschalten!)',
        timeframe: 'Täglich während der gesamten Abwesenheit',
        description: 'Die Umwälzpumpe während der Abwesenheit keinesfalls abschalten! Stehendes, warmes Wasser veralgt binnen weniger Tage. Die Zeitschaltuhr auf mindestens 8–10 Stunden tägliche Laufzeit einstellen (am besten aufgeteilt, z.B. 10:00–15:00 Uhr und 20:00–01:00 Uhr).',
        importantHint: 'Bei Salzelektrolyseanlagen die Leistung auf einen moderaten Urlaubsmodus (ca. 50–70%) herunterregeln, da kein Badegast-Schmutzeintrag erfolgt.',
      });

      actionPlan.push({
        stepNumber: vacationStep++,
        title: 'Wasserstand auffüllen & Becken lichtdicht abdecken',
        timeframe: 'Unmittelbar vor der Abreise',
        description: 'Den Wasserspiegel bis zur oberen Skimmermarkierung auffüllen, um Verdunstung durch Hitze abzufangen. Eine lichtundurchlässige Abdeckplane oder Solarfolie über das Becken ziehen.',
        importantHint: 'Dunkle Abdeckungen entziehen Algen das lebensnotwendige Sonnenlicht für die Photosynthese und verringern den Chlorabbau durch UV-Strahlung um bis zu 80%.',
      });

      actionPlan.push({
        stepNumber: vacationStep++,
        title: 'Nach Rückkehr: Kurze Kontrollmessung vor dem ersten Badespaß',
        timeframe: 'Am Tag der Rückkehr',
        description: 'Abdeckung entfernen, Skimmer prüfen und pH- sowie Chlorwert mit dem Testgerät kontrollieren. Liegen die Werte im Idealbereich (pH 7,0–7,4 / Chlor 0,3–0,6 mg/l), ist das Becken sofort uneingeschränkt badebereit.',
        importantHint: 'Falls nach 2–3 Wochen das freie Chlor leicht abgefallen ist, einfach kurz mit etwas Schnellchlorgranulat nachjustieren.',
      });
    } else {
      // Wasserwerte haben bereits Korrekturbedarf UND Kunde fährt in Urlaub:
      warnings.unshift(
        'Wichtiger Hinweis für die Urlaubszeit: Urlaub oder längere Abwesenheit ausgewählt. Die berechneten Korrekturmaßnahmen (pH-Einstellung, Schockchlorung etc.) zwingend VOR der Abreise durchführen! Stehendes Wasser kippt bei Sommerhitze innerhalb von 48 bis 72 Stunden um.'
      );

      actionPlan.push({
        stepNumber: stepCounter++,
        title: 'Urlaubs-Absicherung: Pumpe programmieren & Becken abdecken',
        timeframe: 'Direkt vor der Abreise (nach Abschluss der obigen Maßnahmen)',
        description: 'Sobald pH-Wert und Desinfektion stabilisiert sind: Langzeit-Chlortablette in den Dosierschwimmer legen, Filterlaufzeit auf mind. 8–10 Stunden täglich per Zeitschaltuhr sichern und Becken lichtdicht abdecken.',
        importantHint: 'Filterpumpe während der Abwesenheit niemals ganz ausschalten!',
      });
    }
  }

  // Saisonstart / Frühjahr (Auswinterung)
  if (isSpring) {
    recommendedProductIds.add('chlor-53-granulat');
    recommendedProductIds.add('algen-ex-spezial');
    recommendedProductIds.add('randreiniger-sauer');

    const springShockGrams = Math.round(200 * (volume / 10));
    dosages.push({
      id: 'spring-shock',
      productName: 'Chlor-Granulat SUPER PERLIERT (Saisonstart-Schockchlorung)',
      amount: springShockGrams >= 1000 ? `${(springShockGrams / 1000).toFixed(2)} kg` : `${springShockGrams} g`,
      unit: springShockGrams >= 1000 ? 'kg' : 'g',
      purpose: 'Befreit das Wasser nach der Winterpause sofort von organischen Rückständen und Keimen',
      applicationNote: 'Im Eimer vorlösen und bei laufender Filterpumpe gleichmäßig im Pool verteilen.',
      urgent: true,
    });

    const springAlgaeMl = Math.round(100 * (volume / 10));
    dosages.push({
      id: 'spring-algae',
      productName: 'Algen-Ex Spezial Schaumfrei (Frühjahrs-Grundschutz)',
      amount: springAlgaeMl >= 1000 ? `${(springAlgaeMl / 1000).toFixed(1)} Liter` : `${springAlgaeMl} ml`,
      unit: springAlgaeMl >= 1000 ? 'l' : 'ml',
      purpose: 'Verhindert die Algenvermehrung bei steigenden Frühlingstemperaturen und Sonnenschein',
      applicationNote: 'Nach der Schockchlorung bei laufender Filteranlage langsam vor den Einströmdüsen zugeben.',
      urgent: false,
    });

    if (!isCritical && !isWarning && !isVacation) {
      headline = 'Frühjahrs-Inbetriebnahme & Auswinterung';
      summaryText = 'Schritt-für-Schritt Fahrplan für den Saisonstart: Becken nach dem Winter gründlich reinigen, pH-Wert einstellen und mit einer initialen Schockchlorung in den Badesommer starten.';
    }

    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Frühjahrs-Inbetriebnahme: Beckenwände reinigen & Filtertechnik prüfen',
      timeframe: 'Saisonstart (April / Mai)',
      description: 'Winterabdeckung entfernen, Beckenwände und Wasserlinie mit saurem Randreiniger reinigen, Pumpe und Filteranlage anschließen und eine ausgiebige Rückspülung durchführen.',
      importantHint: 'Vor dem Start alle Dichtungen, O-Ringe und Manometer auf festen Sitz prüfen.',
    });
  }

  // Winterschutz / Herbst (Einwinterung)
  if (isWinter) {
    recommendedProductIds.add('winterschutz-konzentrat');
    recommendedProductIds.add('randreiniger-sauer');

    const winterDoseMl = Math.round(400 * (volume / 10));
    dosages.push({
      id: 'winter-protection',
      productName: 'Pool Total Winterschutzmittel Konzentrat',
      amount: winterDoseMl >= 1000 ? `${(winterDoseMl / 1000).toFixed(1)} Liter` : `${winterDoseMl} ml`,
      unit: winterDoseMl >= 1000 ? 'l' : 'ml',
      purpose: 'Verhindert harte Kalkkrusten und Algenwuchs im ruhenden Beckenwasser über den Winter',
      applicationNote: 'Nach dem Absenken des Wasserstands an mehreren Stellen gleichmäßig ins Poolwasser gießen.',
      urgent: true,
    });

    if (!isCritical && !isWarning && !isVacation && !isSpring) {
      headline = 'Einwinterungs-Leitfaden & optimaler Winterschutz';
      summaryText = 'Schwimmbecken vor Frostschäden, Kalkausfällungen und Algenbefall während der kalten Jahreszeit schützen. Mit dieser Einwinterungsroutine wird mühsames Scheuern im kommenden Frühjahr vermieden.';
    }

    actionPlan.push({
      stepNumber: stepCounter++,
      title: 'Einwinterung: Wasserstand absenken & Leitungen frostsicher entleeren',
      timeframe: 'Herbst (Oktober / November)',
      description: 'Wasserspiegel ca. 10–15 cm unter Skimmer und Einlaufdüsen absenken. Alle oberirdischen Rohrleitungen, Filterkessel und Pumpe restlos entleeren, um Frostrisse zu verhindern.',
      importantHint: 'Winterabdeckplane oder aufblasbare Schutzplane sturmfest und lichtdicht verspannen.',
    });
  }

  // Filter products list
  const recommendedProducts = POOL_PRODUCTS.filter(p => recommendedProductIds.has(p.id));
  // If fewer than 3 products, pad with essential care items
  if (recommendedProducts.length < 3) {
    const additional = POOL_PRODUCTS.filter(p => !recommendedProductIds.has(p.id)).slice(0, 3 - recommendedProducts.length);
    recommendedProducts.push(...additional);
  }

  return {
    status: isCritical ? 'critical' : isWarning ? 'warning' : 'good',
    headline,
    summaryText,
    dosages,
    actionPlan,
    recommendedProducts,
    warnings,
    isVacationCare: isVacation,
  };
}
