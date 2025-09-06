/**
 * Safe Heat Calculator with Migration Support
 * Phase 1: Wrapper that can use either legacy or unified methods safely
 */

import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeats, calculateUpcomingHeatsUnified } from './heatCalculator';
import { validateHeatCalculations } from './heatValidation';
import { shouldUseUnified, logMigration, getMigrationConfig } from '@/config/heatMigration';

export type ServiceName = 'upcomingHeats' | 'plannedLitters' | 'reminderSync' | 'dogServices';

/**
 * Safe wrapper for heat calculations that can gradually migrate to unified method
 * Includes validation, fallback, and monitoring
 */
export const calculateUpcomingHeatsSafe = async (
  dogs: Dog[], 
  serviceName: ServiceName = 'upcomingHeats'
): Promise<UpcomingHeat[]> => {
  const config = getMigrationConfig();
  const useUnified = shouldUseUnified(serviceName);
  
  logMigration(`Calculating heats for ${serviceName}`, { 
    dogCount: dogs.length, 
    useUnified,
    serviceName 
  });

  try {
    if (useUnified) {
      // Use unified method with fallback
      return await calculateUnifiedWithFallback(dogs, serviceName);
    } else {
      // Use legacy method with optional validation
      return await calculateLegacyWithValidation(dogs, serviceName);
    }
  } catch (error) {
    logMigration(`Critical error in calculateUpcomingHeatsSafe for ${serviceName}:`, error);
    
    // Ultimate fallback to legacy method
    try {
      const fallbackResult = calculateUpcomingHeats(dogs);
      logMigration(`Fallback to legacy successful for ${serviceName}`, { count: fallbackResult.length });
      return fallbackResult;
    } catch (fallbackError) {
      logMigration(`Even fallback failed for ${serviceName}:`, fallbackError);
      return []; // Return empty array rather than crash
    }
  }
};

/**
 * Calculate using unified method with automatic fallback to legacy
 */
const calculateUnifiedWithFallback = async (
  dogs: Dog[], 
  serviceName: ServiceName
): Promise<UpcomingHeat[]> => {
  const config = getMigrationConfig();
  
  try {
    logMigration(`Attempting unified calculation for ${serviceName}`);
    
    // Try unified calculation with timeout
    const unifiedResult = await Promise.race([
      calculateUpcomingHeatsUnified(dogs),
      new Promise<UpcomingHeat[]>((_, reject) => 
        setTimeout(() => reject(new Error('Unified calculation timeout')), config.VALIDATION_TIMEOUT_MS)
      )
    ]);

    logMigration(`Unified calculation successful for ${serviceName}`, { count: unifiedResult.length });

    // Optionally validate against legacy if validation is enabled
    if (config.VALIDATE_CALCULATIONS) {
      validateInBackground(dogs, serviceName, unifiedResult);
    }

    return unifiedResult;

  } catch (error) {
    logMigration(`Unified calculation failed for ${serviceName}, falling back to legacy:`, error);
    
    // Fallback to legacy
    const legacyResult = calculateUpcomingHeats(dogs);
    logMigration(`Fallback to legacy successful for ${serviceName}`, { count: legacyResult.length });
    
    return legacyResult;
  }
};

/**
 * Calculate using legacy method with optional validation
 */
const calculateLegacyWithValidation = async (
  dogs: Dog[], 
  serviceName: ServiceName
): Promise<UpcomingHeat[]> => {
  const config = getMigrationConfig();
  
  logMigration(`Using legacy calculation for ${serviceName}`);
  
  const legacyResult = calculateUpcomingHeats(dogs);
  
  // Optionally validate against unified method
  if (config.VALIDATE_CALCULATIONS) {
    validateInBackground(dogs, serviceName, legacyResult);
  }

  return legacyResult;
};

/**
 * Perform validation in background without blocking the main calculation
 */
const validateInBackground = (
  dogs: Dog[], 
  serviceName: ServiceName, 
  expectedResult: UpcomingHeat[]
) => {
  // Run validation asynchronously without blocking
  setTimeout(async () => {
    try {
      const validation = await validateHeatCalculations(dogs, serviceName);
      
      if (!validation.matches) {
        logMigration(`Background validation failed for ${serviceName}`, {
          errors: validation.errors,
          warnings: validation.warnings,
          expectedCount: expectedResult.length,
          legacyCount: validation.legacyCount,
          unifiedCount: validation.unifiedCount
        });
      }
    } catch (error) {
      logMigration(`Background validation error for ${serviceName}:`, error);
    }
  }, 100); // Small delay to not block main thread
};

/**
 * Test function to manually compare methods for a specific service
 * Useful for debugging and manual testing during migration
 */
export const testHeatCalculationMethods = async (
  dogs: Dog[], 
  serviceName: ServiceName
): Promise<{
  legacy: UpcomingHeat[];
  unified: UpcomingHeat[];
  validation: Awaited<ReturnType<typeof validateHeatCalculations>>;
}> => {
  logMigration(`Manual test started for ${serviceName} with ${dogs.length} dogs`);

  const legacy = calculateUpcomingHeats(dogs);
  const unified = await calculateUpcomingHeatsUnified(dogs);
  const validation = await validateHeatCalculations(dogs, `test-${serviceName}`);

  logMigration(`Manual test completed for ${serviceName}`, {
    legacyCount: legacy.length,
    unifiedCount: unified.length,
    matches: validation.matches
  });

  return { legacy, unified, validation };
};

/**
 * Migration status checker - reports on system readiness
 */
export const checkMigrationReadiness = async (dogs: Dog[]): Promise<{
  ready: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test basic functionality
    const testResult = await testHeatCalculationMethods(dogs, 'upcomingHeats');
    
    if (!testResult.validation.matches) {
      issues.push('Legacy and unified methods produce different results');
      recommendations.push('Review heat history data for inconsistencies');
      recommendations.push('Check dogs with missing or invalid heat intervals');
    }

    if (testResult.validation.errors.length > 0) {
      issues.push(`Validation errors: ${testResult.validation.errors.join(', ')}`);
    }

    // Check for potential data issues
    const femaleDogs = dogs.filter(d => d.gender === 'female');
    const dogsWithoutHistory = femaleDogs.filter(d => !d.heatHistory || d.heatHistory.length === 0);
    
    if (dogsWithoutHistory.length > 0) {
      recommendations.push(`${dogsWithoutHistory.length} female dogs have no heat history`);
    }

    const dogsWithFutureHeats = femaleDogs.filter(d => 
      d.heatHistory?.some(h => new Date(h.date) > new Date())
    );
    
    if (dogsWithFutureHeats.length > 0) {
      issues.push(`${dogsWithFutureHeats.length} dogs have future heat dates`);
      recommendations.push('Clean up invalid future heat dates before migration');
    }

  } catch (error) {
    issues.push(`Migration readiness check failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const ready = issues.length === 0;
  
  logMigration('Migration readiness check completed', { ready, issueCount: issues.length });

  return { ready, issues, recommendations };
};