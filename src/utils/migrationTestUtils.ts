/**
 * Migration Testing Utilities
 * Phase 1: Tools for testing and monitoring the heat migration
 */

import { useDogs } from '@/context/DogsContext';
import { testHeatCalculationMethods, checkMigrationReadiness } from './heatCalculatorSafe';
import { performSystemValidation } from './heatValidation';
import { logMigration } from '@/config/heatMigration';

/**
 * Development utility for testing migration in console
 * Usage: window.testHeatMigration()
 */
export const createMigrationTestUtils = () => {
  const testUtils = {
    async testCurrentData() {
      try {
        console.log('🧪 Testing Heat Migration with Current Data...');
        
        // This would need to be called from a component context where dogs are available
        // For now, we'll show how to structure the test
        console.log('⚠️  To test: Call this from a component with access to dogs data');
        console.log('Example: testHeatCalculationMethods(dogs, "upcomingHeats")');
        
        return { success: false, message: 'Call from component context with dogs data' };
      } catch (error) {
        console.error('❌ Migration test failed:', error);
        return { success: false, error };
      }
    },

    async checkReadiness() {
      console.log('🔍 Checking Migration Readiness...');
      console.log('⚠️  To test: Call this from a component with access to dogs data');
      console.log('Example: checkMigrationReadiness(dogs)');
      return { success: false, message: 'Call from component context with dogs data' };
    },

    async performFullValidation() {
      console.log('🔬 Performing Full System Validation...');
      console.log('⚠️  To test: Call this from a component with access to dogs data');
      console.log('Example: performSystemValidation(dogs)');
      return { success: false, message: 'Call from component context with dogs data' };
    },

    showCurrentConfig() {
      const { getMigrationConfig } = require('@/config/heatMigration');
      const config = getMigrationConfig();
      
      console.log('⚙️  Current Migration Configuration:');
      console.table({
        'Use Unified Calculation': config.USE_UNIFIED_CALCULATION,
        'Validate Calculations': config.VALIDATE_CALCULATIONS,
        'Enable Logging': config.ENABLE_MIGRATION_LOGGING,
      });
      
      console.log('🎯 Service Status:');
      console.table(config.SERVICES_USING_UNIFIED);
      
      return config;
    },

    instructions() {
      console.log(`
🚀 Heat Migration Testing Instructions

1. From a component with dogs data, test calculations:
   import { testHeatCalculationMethods } from '@/utils/heatCalculatorSafe';
   const result = await testHeatCalculationMethods(dogs, 'upcomingHeats');
   console.log(result);

2. Check system readiness:
   import { checkMigrationReadiness } from '@/utils/heatCalculatorSafe'; 
   const status = await checkMigrationReadiness(dogs);
   console.log(status);

3. Perform full validation:
   import { performSystemValidation } from '@/utils/heatValidation';
   const validation = await performSystemValidation(dogs);
   console.log(validation);

4. Enable unified calculation for testing:
   - Edit src/config/heatMigration.ts
   - Set USE_UNIFIED_CALCULATION: true
   - Set specific services to true for gradual testing

5. Monitor logs in console for migration activity
      `);
    }
  };

  // Make available globally for development
  if (typeof window !== 'undefined') {
    (window as any).testHeatMigration = testUtils;
  }

  return testUtils;
};

/**
 * React hook for testing migration within components
 */
export const useMigrationTesting = () => {
  const { dogs } = useDogs();
  
  const runTests = async () => {
    if (!dogs || dogs.length === 0) {
      logMigration('No dogs data available for testing');
      return { success: false, message: 'No dogs data available' };
    }

    try {
      console.log('🧪 Running Migration Tests...');
      
      // Test calculations
      const calculationTest = await testHeatCalculationMethods(dogs, 'upcomingHeats');
      console.log('📊 Calculation Test Results:', calculationTest);
      
      // Check readiness
      const readinessCheck = await checkMigrationReadiness(dogs);
      console.log('🔍 Readiness Check:', readinessCheck);
      
      // Full validation
      const fullValidation = await performSystemValidation(dogs);
      console.log('🔬 Full Validation:', fullValidation);
      
      return {
        success: true,
        calculationTest,
        readinessCheck,
        fullValidation
      };
      
    } catch (error) {
      console.error('❌ Migration testing failed:', error);
      return { success: false, error };
    }
  };

  const testSpecificService = async (serviceName: 'upcomingHeats' | 'plannedLitters' | 'reminderSync' | 'dogServices') => {
    if (!dogs || dogs.length === 0) {
      return { success: false, message: 'No dogs data available' };
    }

    try {
      const result = await testHeatCalculationMethods(dogs, serviceName);
      console.log(`🎯 Testing ${serviceName}:`, result);
      return { success: true, result };
    } catch (error) {
      console.error(`❌ Testing ${serviceName} failed:`, error);
      return { success: false, error };
    }
  };

  return {
    runTests,
    testSpecificService,
    dogsCount: dogs?.length || 0,
    hasDogs: dogs && dogs.length > 0
  };
};

// Initialize development utilities
createMigrationTestUtils();