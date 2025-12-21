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
