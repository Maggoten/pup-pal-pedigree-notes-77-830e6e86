/**
 * Progesterone unit conversion utilities
 * 
 * Supports ng/ml and nmol/L units.
 * All values are stored in the database as ng/ml.
 * Conversion factor: 1 ng/ml = 3.18 nmol/L
 */

export type ProgesteroneUnit = 'ng' | 'nmol';

const CONVERSION_FACTOR = 3.18;

const STORAGE_KEY = 'progesterone_unit_preference';

/**
 * Thresholds for progesterone levels in both units
 */
export const PROGESTERONE_THRESHOLDS = {
  ng: {
    baseline: 2,
    lhSurge: 5,
    optimal: { min: 5, max: 20 },
    maxValidation: 50
  },
  nmol: {
    baseline: 6.4, // 2 * 3.18
    lhSurge: 15.9, // 5 * 3.18
    optimal: { min: 15.9, max: 63.6 },
    maxValidation: 159 // 50 * 3.18
  }
} as const;

/**
 * Clinical progesterone level definitions based on veterinary guidelines
 * Each level includes: range, ovulation status, mating recommendation, and retest interval
 */
export type ProgesteroneLevelKey = 'baseline' | 'rising' | 'ovulation' | 'fertile' | 'optimal' | 'urgent';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ProgesteroneLevelConfig {
  range: { min: number; max: number };
  level: ProgesteroneLevelKey;
  retestDays: number | null; // null means no retest needed
  urgency: UrgencyLevel;
}

export const PROGESTERONE_LEVELS: { ng: ProgesteroneLevelConfig[]; nmol: ProgesteroneLevelConfig[] } = {
  ng: [
    { range: { min: 0, max: 1 }, level: 'baseline', retestDays: 3, urgency: 'low' },
    { range: { min: 1, max: 4 }, level: 'rising', retestDays: 2, urgency: 'low' },
    { range: { min: 4, max: 7 }, level: 'ovulation', retestDays: 1, urgency: 'medium' },
    { range: { min: 7, max: 11 }, level: 'fertile', retestDays: null, urgency: 'high' },
    { range: { min: 11, max: 19 }, level: 'optimal', retestDays: null, urgency: 'high' },
    { range: { min: 19, max: Infinity }, level: 'urgent', retestDays: null, urgency: 'critical' }
  ],
  nmol: [
    { range: { min: 0, max: 3.2 }, level: 'baseline', retestDays: 3, urgency: 'low' },
    { range: { min: 3.2, max: 12.7 }, level: 'rising', retestDays: 2, urgency: 'low' },
    { range: { min: 12.7, max: 22.3 }, level: 'ovulation', retestDays: 1, urgency: 'medium' },
    { range: { min: 22.3, max: 35 }, level: 'fertile', retestDays: null, urgency: 'high' },
    { range: { min: 35, max: 60.4 }, level: 'optimal', retestDays: null, urgency: 'high' },
    { range: { min: 60.4, max: Infinity }, level: 'urgent', retestDays: null, urgency: 'critical' }
  ]
};

export interface ProgesteroneStatus {
  level: ProgesteroneLevelKey;
  config: ProgesteroneLevelConfig;
  valueInNg: number;
  displayValue: number;
  unit: ProgesteroneUnit;
}

/**
 * Get the progesterone status based on value in ng/ml
 */
export function getProgesteroneStatus(valueInNg: number, unit: ProgesteroneUnit = 'ng'): ProgesteroneStatus {
  const levels = PROGESTERONE_LEVELS.ng;
  const config = levels.find(l => valueInNg >= l.range.min && valueInNg < l.range.max) || levels[levels.length - 1];
  
  return {
    level: config.level,
    config,
    valueInNg,
    displayValue: unit === 'nmol' ? ngToNmol(valueInNg) : valueInNg,
    unit
  };
}

/**
 * Get next recommended test date based on progesterone level
 */
export function getNextTestDate(status: ProgesteroneStatus, lastTestDate: Date): Date | null {
  if (status.config.retestDays === null) return null;
  
  const nextDate = new Date(lastTestDate);
  nextDate.setDate(nextDate.getDate() + status.config.retestDays);
  return nextDate;
}

/**
 * Convert ng/ml to nmol/L
 */
export function ngToNmol(value: number): number {
  return Math.round(value * CONVERSION_FACTOR * 10) / 10;
}

/**
 * Convert nmol/L to ng/ml
 */
export function nmolToNg(value: number): number {
  return Math.round((value / CONVERSION_FACTOR) * 10) / 10;
}

/**
 * Get the stored unit preference from localStorage
 */
export function getStoredUnit(): ProgesteroneUnit {
  if (typeof window === 'undefined') return 'ng';
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored === 'ng' || stored === 'nmol') ? stored : 'ng';
}

/**
 * Save the unit preference to localStorage
 */
export function setStoredUnit(unit: ProgesteroneUnit): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, unit);
}

/**
 * Format a progesterone value with its unit label
 */
export function formatProgesteroneValue(valueInNg: number, unit: ProgesteroneUnit): string {
  const displayValue = unit === 'nmol' ? ngToNmol(valueInNg) : valueInNg;
  const unitLabel = unit === 'nmol' ? 'nmol/L' : 'ng/ml';
  return `${displayValue.toFixed(1)} ${unitLabel}`;
}

/**
 * Get the unit display label
 */
export function getUnitLabel(unit: ProgesteroneUnit): string {
  return unit === 'nmol' ? 'nmol/L' : 'ng/ml';
}

/**
 * Convert a user-entered value to ng/ml for storage
 */
export function convertToNgForStorage(value: number, unit: ProgesteroneUnit): number {
  return unit === 'nmol' ? nmolToNg(value) : value;
}

/**
 * Convert a stored ng/ml value to the display unit
 */
export function convertFromNgForDisplay(valueInNg: number, unit: ProgesteroneUnit): number {
  return unit === 'nmol' ? ngToNmol(valueInNg) : valueInNg;
}

/**
 * Get validation range for the current unit
 */
export function getValidationRange(unit: ProgesteroneUnit): { min: number; max: number } {
  return {
    min: 0,
    max: unit === 'nmol' ? PROGESTERONE_THRESHOLDS.nmol.maxValidation : PROGESTERONE_THRESHOLDS.ng.maxValidation
  };
}
