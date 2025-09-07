/**
 * Configuration for Heat Calculation Migration
 * Phase 1: Safety and Feature Flag System
 */

// Feature flags for gradual migration
export const HEAT_MIGRATION_CONFIG = {
  // Enable unified heat calculation (default: false for safety)
  USE_UNIFIED_CALCULATION: true,
  
  // Enable validation comparing legacy vs unified (default: true)
  VALIDATE_CALCULATIONS: true,
  
  // Enable detailed logging for debugging
  ENABLE_MIGRATION_LOGGING: true,
  
  // Services that should use unified calculation (gradual rollout)
  SERVICES_USING_UNIFIED: {
    upcomingHeats: true,       // useUpcomingHeats hook
    plannedLitters: true,      // usePlannedLitterQueries  
    reminderSync: false,       // ReminderCalendarSyncService
    dogServices: false,        // addDog.ts, updateDog.ts
  },
  
  // Safety timeouts and limits
  VALIDATION_TIMEOUT_MS: 5000,
  MAX_VALIDATION_RETRIES: 3,
};

// Environment-based overrides (can be set via env vars if needed)
export const getMigrationConfig = () => {
  return {
    ...HEAT_MIGRATION_CONFIG,
    // Future: Add environment variable overrides here if needed
  };
};

// Helper to check if a specific service should use unified calculation
export const shouldUseUnified = (serviceName: keyof typeof HEAT_MIGRATION_CONFIG.SERVICES_USING_UNIFIED): boolean => {
  const config = getMigrationConfig();
  return config.USE_UNIFIED_CALCULATION && config.SERVICES_USING_UNIFIED[serviceName];
};

// Helper for logging during migration
export const logMigration = (message: string, data?: any) => {
  const config = getMigrationConfig();
  if (config.ENABLE_MIGRATION_LOGGING) {
    console.log(`[HEAT-MIGRATION] ${message}`, data || '');
  }
};

// Helper for logging validation results
export const logValidation = (serviceName: string, legacyCount: number, unifiedCount: number, matches: boolean) => {
  const config = getMigrationConfig();
  if (config.ENABLE_MIGRATION_LOGGING) {
    const status = matches ? '✅ MATCH' : '❌ MISMATCH';
    console.log(`[HEAT-VALIDATION] ${serviceName}: ${status} (Legacy: ${legacyCount}, Unified: ${unifiedCount})`);
  }
};