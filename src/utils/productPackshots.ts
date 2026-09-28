import { ProductItem } from '../types';

export interface PackshotConfig {
  containerType: 'bucket' | 'canister' | 'bottle' | 'spray' | 'box' | 'sack' | 'tester';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  labelBg: string;
  title: string;
  subtitle: string;
  brand: string;
  size: string;
  badge?: string;
}

export const PRODUCT_PACKSHOT_CONFIGS: Record<string, PackshotConfig> = {
  'ph-minus-granulat': {
    containerType: 'bucket',
    primaryColor: '#b91c1c', // Rot / Coral für pH-Minus
    secondaryColor: '#ef4444',
    accentColor: '#fca5a5',
    labelBg: '#ffffff',
    title: 'pH-Minus Granulat',
    subtitle: 'Premium Wasserpflege • Senkt den pH-Wert',
    brand: 'POOL TOTAL',
    size: '5,0 kg Eimer',
    badge: 'Bestseller',
  },
  'ph-plus-granulat': {
    containerType: 'bucket',
    primaryColor: '#1d4ed8', // Blau für pH-Plus
    secondaryColor: '#3b82f6',
    accentColor: '#93c5fd',
    labelBg: '#ffffff',
    title: 'pH-Plus Granulat',
    subtitle: 'Premium Wasserpflege • Hebt den pH-Wert',
    brand: 'POOL TOTAL',
    size: '5,0 kg Eimer',
    badge: 'Qualität',
  },
  'chlor-53-granulat': {
    containerType: 'canister',
    primaryColor: '#1d1f3e', // Navy & Cyan für Schnellchlor
    secondaryColor: '#1aabbb',
    accentColor: '#5eead4',
    labelBg: '#ffffff',
    title: 'Chlor Granulat',
    subtitle: 'SUPER PERLIERT • 56% Aktivchlor • Schockung',
    brand: 'myPOOL',
    size: '1,0 kg Dose',
    badge: 'Schnelllöslich',
  },
  'chlor-langzeit-tabs': {
    containerType: 'bucket',
    primaryColor: '#0f172a', // Dunkelblau / Navy
    secondaryColor: '#0284c7',
    accentColor: '#38bdf8',
    labelBg: '#ffffff',
    title: 'Langzeit-Chlor 200g',
    subtitle: 'Großtabletten • Kontinuierliche Dauerchlorung',
    brand: 'POOL TOTAL',
    size: '5,0 kg Eimer',
    badge: 'Langzeit',
  },
  'mypool-sauerstoff-aktivator': {
    containerType: 'bottle',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    accentColor: '#c7d2fe',
    labelBg: '#ffffff',
    title: 'Sauerstoff Aktivator',
    subtitle: 'Aktiviert Sauerstoff & hemmt Algenwuchs',
    brand: 'myPOOL',
    size: '1,0 l Flasche',
  },
  'cristal-aktivsauerstoff': {
    containerType: 'bottle',
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4',
    accentColor: '#67e8f9',
    labelBg: '#ffffff',
    title: 'Aktivsauerstoff Aktivator',
    subtitle: 'Chlorfreie Desinfektion & Algenvermeidung',
    brand: 'CRISTAL',
    size: '1,0 l Flasche',
  },
  'algen-ex-spezial': {
    containerType: 'bottle',
    primaryColor: '#047857', // Grün für Algen
    secondaryColor: '#10b981',
    accentColor: '#a7f3d0',
    labelBg: '#ffffff',
    title: 'Algen-Ex Spezial',
    subtitle: 'Schaumfrei • Hochkonzentriert mit Depotwirkung',
    brand: 'POOL TOTAL',
    size: '1,0 l Flasche',
    badge: 'Schaumfrei',
  },
  'flockfix-kartuschen': {
    containerType: 'box',
    primaryColor: '#d97706', // Bernstein/Orange für Trübungsbeseitigung
    secondaryColor: '#f59e0b',
    accentColor: '#fde68a',
    labelBg: '#ffffff',
    title: 'Flockmittel-Kartuschen',
    subtitle: '8 Kissen • Kristallklares Wasser für Sand & Glas',
    brand: 'POOL TOTAL',
    size: '1,0 kg (8 Stk.)',
    badge: 'Kristallklar',
  },
  'superklar-kartusche': {
    containerType: 'bottle',
    primaryColor: '#0d9488', // Türkis
    secondaryColor: '#14b8a6',
    accentColor: '#99f6e4',
    labelBg: '#ffffff',
    title: 'Klarmacher Spezial',
    subtitle: 'Konzentrat • Für Filterbälle & Kartuschenfilter',
    brand: 'POOL TOTAL',
    size: '1,0 l Flasche',
    badge: 'Filter-Schonend',
  },
  'metall-ex': {
    containerType: 'bottle',
    primaryColor: '#78350f', // Bronze / Braun
    secondaryColor: '#b45309',
    accentColor: '#fcd34d',
    labelBg: '#ffffff',
    title: 'Metall-Ex Speziallöser',
    subtitle: 'Entfernt Eisen, Kupfer & Brunnenwasser-Verfärbung',
    brand: 'POOL TOTAL',
    size: '1,0 l Flasche',
  },
  'randreiniger-sauer': {
    containerType: 'spray',
    primaryColor: '#e11d48', // Sauer / Kalklöser
    secondaryColor: '#f43f5e',
    accentColor: '#fecdd3',
    labelBg: '#ffffff',
    title: 'Beckenrandreiniger Sauer',
    subtitle: 'Starker Kalklöser für Folie, Fliesen & Beckenrand',
    brand: 'POOL TOTAL',
    size: '1,0 l Sprühflasche',
  },
  'pool-spezialsalz': {
    containerType: 'sack',
    primaryColor: '#1d1f3e', // Weiß / Navy / Cyan für Siedesalz
    secondaryColor: '#1aabbb',
    accentColor: '#e0f2fe',
    labelBg: '#ffffff',
    title: 'Reinstes Poolsiedesalz',
    subtitle: 'EN 16401 Typ A • Hochrein für Salzelektrolyse',
    brand: 'POOL TOTAL',
    size: '25,0 kg Sack',
    badge: 'EN 16401',
  },
  'elektronischer-pooltester': {
    containerType: 'tester',
    primaryColor: '#0f172a', // Hightech Photometer
    secondaryColor: '#1aabbb',
    accentColor: '#38bdf8',
    labelBg: '#ffffff',
    title: 'Electronic Pooltester',
    subtitle: 'Digitales Photometer für pH, Chlor, Cya & TA',
    brand: 'POOL TOTAL',
    size: 'Koffer-Set mit Reagenzien',
    badge: 'Digital',
  }
};

/**
 * Generates an SVG Data URI that accurately visualizes the product container
 * and prominently shows the article designation on the product label.
 */
export function getProductPackshotSvg(productId: string): string {
  const cfg = PRODUCT_PACKSHOT_CONFIGS[productId] || {
    containerType: 'bucket',
    primaryColor: '#1d1f3e',
    secondaryColor: '#1aabbb',
    accentColor: '#93c5fd',
    labelBg: '#ffffff',
    title: 'Pool Pflegeprodukt',
    subtitle: 'Geprüfte Wasserpflege',
    brand: 'POOL TOTAL',
    size: 'Originalgebinde',
  };

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="40%" stop-color="#ffffff"/>
      <stop offset="85%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="brandBarGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cfg.primaryColor}"/>
      <stop offset="100%" stop-color="${cfg.secondaryColor}"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.16" flood-color="#0f172a"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="400" height="420" rx="16" fill="url(#bgGrad)"/>
  
  <!-- Subtle circular backdrop glow -->
  <circle cx="200" cy="210" r="150" fill="${cfg.secondaryColor}" opacity="0.10" />

  <!-- Packaging Shape Based on Container Type -->
  ${renderPackagingGeometry(cfg)}

  <!-- Brand & Size Badge -->
  ${cfg.badge ? `
  <g transform="translate(24, 24)">
    <rect width="90" height="24" rx="6" fill="${cfg.primaryColor}" />
    <text x="45" y="16" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">${cfg.badge}</text>
  </g>` : ''}
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

function renderPackagingGeometry(cfg: PackshotConfig): string {
  if (cfg.containerType === 'bucket') {
    // Eimer / Bucket
    return `
    <g filter="url(#dropShadow)">
      <!-- Bucket Lid Handle -->
      <path d="M 120 70 Q 200 40 280 70" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linecap="round" />
      
      <!-- Bucket Lid -->
      <ellipse cx="200" cy="85" rx="110" ry="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <ellipse cx="200" cy="83" rx="104" ry="14" fill="${cfg.primaryColor}"/>
      
      <!-- Bucket Body -->
      <path d="M 96 86 L 125 340 Q 200 365 275 340 L 304 86 Z" fill="url(#bodyGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <ellipse cx="200" cy="340" rx="75" ry="12" fill="#94a3b8" opacity="0.3"/>

      <!-- Label Area -->
      <path d="M 106 130 L 120 290 Q 200 310 280 290 L 294 130 Q 200 145 106 130 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      
      <!-- Label Colored Header Bar -->
      <path d="M 106 130 L 110 185 Q 200 200 290 185 L 294 130 Q 200 145 106 130 Z" fill="url(#brandBarGrad)"/>
      
      <!-- Brand Logo on Label -->
      <text x="200" y="160" fill="#ffffff" font-size="14" font-weight="900" font-family="'Outfit', sans-serif" text-anchor="middle" letter-spacing="1">
        ${cfg.brand}
      </text>

      <!-- Exact Article Designation on Label Body -->
      <text x="200" y="222" fill="#0f172a" font-size="17" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>
      
      <!-- Subtitle Description -->
      <text x="200" y="245" fill="#64748b" font-size="9.5" font-weight="600" font-family="sans-serif" text-anchor="middle">
        ${cfg.subtitle}
      </text>

      <!-- Weight Badge -->
      <rect x="155" y="262" width="90" height="22" rx="11" fill="${cfg.primaryColor}" opacity="0.12"/>
      <text x="200" y="277" fill="${cfg.primaryColor}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">
        ${cfg.size}
      </text>
    </g>`;
  } else if (cfg.containerType === 'bottle' || cfg.containerType === 'spray') {
    // Flasche / Bottle
    return `
    <g filter="url(#dropShadow)">
      <!-- Bottle Cap -->
      <rect x="180" y="45" width="40" height="26" rx="4" fill="${cfg.primaryColor}" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="184" y1="52" x2="216" y2="52" stroke="#ffffff" stroke-width="1.5" opacity="0.5"/>
      <line x1="184" y1="59" x2="216" y2="59" stroke="#ffffff" stroke-width="1.5" opacity="0.5"/>

      <!-- Bottle Neck & Shoulders -->
      <path d="M 185 71 L 185 95 Q 185 125 135 155 L 135 340 Q 135 365 200 365 Q 265 365 265 340 L 265 155 Q 215 125 215 95 L 215 71 Z" fill="url(#bodyGrad)" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Label Wrap -->
      <rect x="142" y="170" width="116" height="155" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      
      <!-- Label Header Banner -->
      <path d="M 142 170 h 116 v 44 h -116 z" fill="url(#brandBarGrad)"/>
      <text x="200" y="196" fill="#ffffff" font-size="13" font-weight="900" font-family="'Outfit', sans-serif" text-anchor="middle" letter-spacing="1">
        ${cfg.brand}
      </text>

      <!-- Exact Article Designation -->
      <text x="200" y="240" fill="#0f172a" font-size="14.5" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>

      <!-- Subtitle -->
      <text x="200" y="260" fill="#64748b" font-size="8.5" font-weight="600" font-family="sans-serif" text-anchor="middle">
        ${cfg.subtitle}
      </text>

      <!-- Capacity pill -->
      <rect x="160" y="285" width="80" height="20" rx="10" fill="${cfg.primaryColor}" opacity="0.12"/>
      <text x="200" y="299" fill="${cfg.primaryColor}" font-size="10" font-weight="800" font-family="sans-serif" text-anchor="middle">
        ${cfg.size}
      </text>
    </g>`;
  } else if (cfg.containerType === 'canister') {
    // Dose / Canister (1kg Chlor Granulat)
    return `
    <g filter="url(#dropShadow)">
      <!-- Canister Cap -->
      <rect x="175" y="55" width="50" height="20" rx="3" fill="${cfg.primaryColor}"/>
      <ellipse cx="200" cy="55" rx="25" ry="6" fill="#ffffff" opacity="0.3"/>

      <!-- Canister Body -->
      <rect x="130" y="75" width="140" height="270" rx="18" fill="url(#bodyGrad)" stroke="#cbd5e1" stroke-width="2"/>
      
      <!-- Large Label -->
      <rect x="136" y="115" width="128" height="195" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="136" y="115" width="128" height="52" fill="url(#brandBarGrad)"/>

      <text x="200" y="146" fill="#ffffff" font-size="15" font-weight="900" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.brand}
      </text>

      <!-- Article Title -->
      <text x="200" y="196" fill="#0f172a" font-size="15" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>

      <text x="200" y="222" fill="#64748b" font-size="9" font-weight="600" font-family="sans-serif" text-anchor="middle">
        ${cfg.subtitle}
      </text>

      <rect x="155" y="260" width="90" height="22" rx="11" fill="${cfg.secondaryColor}" opacity="0.15"/>
      <text x="200" y="275" fill="${cfg.primaryColor}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">
        ${cfg.size}
      </text>
    </g>`;
  } else if (cfg.containerType === 'box') {
    // Kartuschen-Schachtel / Box
    return `
    <g filter="url(#dropShadow)">
      <!-- Box Perspective -->
      <path d="M 110 110 L 250 80 L 310 120 L 170 150 Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M 250 80 L 310 120 L 310 320 L 250 280 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M 110 110 L 170 150 L 170 350 L 110 310 Z" fill="url(#bodyGrad)" stroke="#cbd5e1" stroke-width="1.5"/>

      <!-- Front Face of Box (Main display) -->
      <rect x="130" y="120" width="150" height="220" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="130" y="120" width="150" height="60" fill="url(#brandBarGrad)"/>

      <text x="205" y="156" fill="#ffffff" font-size="15" font-weight="900" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.brand}
      </text>

      <text x="205" y="212" fill="#0f172a" font-size="14.5" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>

      <text x="205" y="238" fill="#64748b" font-size="9" font-weight="600" font-family="sans-serif" text-anchor="middle">
        ${cfg.subtitle}
      </text>

      <rect x="160" y="275" width="90" height="22" rx="11" fill="${cfg.primaryColor}" opacity="0.15"/>
      <text x="205" y="290" fill="${cfg.primaryColor}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">
        ${cfg.size}
      </text>
    </g>`;
  } else if (cfg.containerType === 'sack') {
    // 25kg Salz-Sack
    return `
    <g filter="url(#dropShadow)">
      <!-- Sack Shape -->
      <path d="M 120 90 Q 200 70 280 90 Q 295 190 285 330 Q 200 360 115 330 Q 105 190 120 90 Z" fill="url(#bodyGrad)" stroke="#cbd5e1" stroke-width="2"/>
      
      <!-- Top stitched seal -->
      <line x1="120" y1="90" x2="280" y2="90" stroke="${cfg.primaryColor}" stroke-width="4" stroke-dasharray="5 3"/>

      <!-- Label Area on Sack -->
      <rect x="135" y="125" width="130" height="185" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="135" y="125" width="130" height="50" fill="url(#brandBarGrad)"/>

      <text x="200" y="155" fill="#ffffff" font-size="14" font-weight="900" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.brand}
      </text>

      <text x="200" y="202" fill="#0f172a" font-size="14" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>

      <text x="200" y="226" fill="#64748b" font-size="9" font-weight="600" font-family="sans-serif" text-anchor="middle">
        ${cfg.subtitle}
      </text>

      <rect x="155" y="260" width="90" height="24" rx="12" fill="${cfg.secondaryColor}" opacity="0.15"/>
      <text x="200" y="276" fill="${cfg.primaryColor}" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">
        ${cfg.size}
      </text>
    </g>`;
  } else {
    // Tester / Photometer
    return `
    <g filter="url(#dropShadow)">
      <!-- Tester Case -->
      <rect x="120" y="100" width="160" height="240" rx="20" fill="#1e293b" stroke="#334155" stroke-width="3"/>
      
      <!-- Screen Display -->
      <rect x="140" y="130" width="120" height="70" rx="8" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <text x="200" y="160" fill="#ffffff" font-size="13" font-family="monospace" font-weight="bold" text-anchor="middle">pH 7.20</text>
      <text x="200" y="180" fill="#e0f2fe" font-size="11" font-family="monospace" text-anchor="middle">Cl 0.80 mg/l</text>

      <!-- Keypad Buttons -->
      <circle cx="160" cy="230" r="14" fill="#3b82f6"/>
      <circle cx="200" cy="230" r="14" fill="#1aabbb"/>
      <circle cx="240" cy="230" r="14" fill="#3b82f6"/>

      <!-- Device Label -->
      <rect x="140" y="265" width="120" height="50" rx="6" fill="#ffffff"/>
      <text x="200" y="285" fill="#0f172a" font-size="11" font-weight="800" font-family="'Outfit', sans-serif" text-anchor="middle">
        ${cfg.title}
      </text>
      <text x="200" y="302" fill="${cfg.secondaryColor}" font-size="9" font-weight="bold" font-family="sans-serif" text-anchor="middle">
        ${cfg.brand}
      </text>
    </g>`;
  }
}
