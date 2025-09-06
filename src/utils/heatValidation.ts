/**
 * Heat Calculation Validation Utilities
 * Phase 1: Validates that legacy and unified methods produce same results
 */

import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeats, calculateUpcomingHeatsUnified } from './heatCalculator';
import { logValidation, logMigration, getMigrationConfig } from '@/config/heatMigration';

export interface ValidationResult {
  matches: boolean;
  legacyCount: number;
  unifiedCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that legacy and unified heat calculations produce equivalent results
 */
export const validateHeatCalculations = async (
  dogs: Dog[], 
  serviceName: string = 'unknown'
): Promise<ValidationResult> => {
  const config = getMigrationConfig();
  const result: ValidationResult = {
    matches: false,
    legacyCount: 0,
    unifiedCount: 0,
    errors: [],
    warnings: []
  };

  try {
    logMigration(`Starting validation for ${serviceName} with ${dogs.length} dogs`);

    // Run legacy calculation
    const legacyHeats = calculateUpcomingHeats(dogs);
    result.legacyCount = legacyHeats.length;

    // Run unified calculation with timeout
    const unifiedHeats = await Promise.race([
      calculateUpcomingHeatsUnified(dogs),
      new Promise<UpcomingHeat[]>((_, reject) => 
        setTimeout(() => reject(new Error('Unified calculation timeout')), config.VALIDATION_TIMEOUT_MS)
      )
    ]);
    result.unifiedCount = unifiedHeats.length;

    // Compare results
    const comparison = compareHeatResults(legacyHeats, unifiedHeats);
    result.matches = comparison.matches;
    result.errors = comparison.errors;
    result.warnings = comparison.warnings;

    // Log results
    logValidation(serviceName, result.legacyCount, result.unifiedCount, result.matches);

    if (!result.matches) {
      logMigration(`Validation failed for ${serviceName}`, {
        legacy: legacyHeats.map(h => ({ dogId: h.dogId, date: h.date.toISOString() })),
        unified: unifiedHeats.map(h => ({ dogId: h.dogId, date: h.date.toISOString() })),
        errors: result.errors
      });
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    logMigration(`Validation error for ${serviceName}:`, error);
  }

  return result;
};

/**
 * Compares two arrays of upcoming heats for equivalence
 */
export const compareHeatResults = (
  legacyHeats: UpcomingHeat[], 
  unifiedHeats: UpcomingHeat[]
): { matches: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check count match
  if (legacyHeats.length !== unifiedHeats.length) {
    errors.push(`Count mismatch: legacy ${legacyHeats.length} vs unified ${unifiedHeats.length}`);
  }

  // Create maps for easier comparison
  const legacyMap = new Map(legacyHeats.map(h => [`${h.dogId}-${h.date.toISOString()}`, h]));
  const unifiedMap = new Map(unifiedHeats.map(h => [`${h.dogId}-${h.date.toISOString()}`, h]));

  // Check for heats in legacy but not unified
  for (const [key, legacyHeat] of legacyMap) {
    if (!unifiedMap.has(key)) {
      errors.push(`Heat missing in unified: ${legacyHeat.dogName} on ${legacyHeat.date.toISOString()}`);
    }
  }

  // Check for heats in unified but not legacy
  for (const [key, unifiedHeat] of unifiedMap) {
    if (!legacyMap.has(key)) {
      errors.push(`Extra heat in unified: ${unifiedHeat.dogName} on ${unifiedHeat.date.toISOString()}`);
    }
  }

  // Check for date differences within same dog (minor tolerance for calculation differences)
  const legacyByDog = new Map<string, UpcomingHeat[]>();
  const unifiedByDog = new Map<string, UpcomingHeat[]>();

  legacyHeats.forEach(h => {
    if (!legacyByDog.has(h.dogId)) legacyByDog.set(h.dogId, []);
    legacyByDog.get(h.dogId)!.push(h);
  });

  unifiedHeats.forEach(h => {
    if (!unifiedByDog.has(h.dogId)) unifiedByDog.set(h.dogId, []);
    unifiedByDog.get(h.dogId)!.push(h);
  });

  // Check each dog's heats for close matches (same day, different times)
  for (const [dogId, legacyDogHeats] of legacyByDog) {
    const unifiedDogHeats = unifiedByDog.get(dogId) || [];
    
    if (legacyDogHeats.length !== unifiedDogHeats.length) {
      continue; // Already reported above
    }

    for (let i = 0; i < legacyDogHeats.length; i++) {
      const legacyHeat = legacyDogHeats[i];
      const unifiedHeat = unifiedDogHeats[i];
      
      if (legacyHeat && unifiedHeat) {
        const timeDiff = Math.abs(legacyHeat.date.getTime() - unifiedHeat.date.getTime());
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 24) { // More than 1 day difference
          warnings.push(`Date difference for ${legacyHeat.dogName}: ${hoursDiff.toFixed(1)} hours`);
        }
      }
    }
  }

  return {
    matches: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Performs a comprehensive system validation
 * Tests unified system with current production data
 */
export const performSystemValidation = async (dogs: Dog[]): Promise<{
  overallHealth: 'good' | 'warning' | 'error';
  results: ValidationResult[];
  summary: string;
}> => {
  const results: ValidationResult[] = [];
  
  // Test the main calculation
  results.push(await validateHeatCalculations(dogs, 'system-validation'));
  
  // Test with subsets to identify problematic dogs
  const femaleDogs = dogs.filter(d => d.gender === 'female');
  if (femaleDogs.length !== dogs.length) {
    results.push(await validateHeatCalculations(femaleDogs, 'female-dogs-only'));
  }

  // Test with dogs that have heat history
  const dogsWithHistory = dogs.filter(d => d.heatHistory && d.heatHistory.length > 0);
  if (dogsWithHistory.length > 0) {
    results.push(await validateHeatCalculations(dogsWithHistory, 'dogs-with-history'));
  }

  // Determine overall health
  const hasErrors = results.some(r => r.errors.length > 0);
  const hasWarnings = results.some(r => r.warnings.length > 0);
  
  let overallHealth: 'good' | 'warning' | 'error' = 'good';
  if (hasErrors) overallHealth = 'error';
  else if (hasWarnings) overallHealth = 'warning';

  // Create summary
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const matchingTests = results.filter(r => r.matches).length;
  
  const summary = `Validation complete: ${matchingTests}/${results.length} tests passed. ` +
    `${totalErrors} errors, ${totalWarnings} warnings found.`;

  logMigration('System validation completed', { overallHealth, summary });

  return {
    overallHealth,
    results,
    summary
  };
};