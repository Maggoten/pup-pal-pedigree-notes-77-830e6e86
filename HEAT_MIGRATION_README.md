# Heat Calculation Migration Plan

## Overview
This document outlines the safe migration from legacy heat calculation methods to a unified system that leverages both `heatHistory` and `heat_cycles` data.

## 🎯 Goals
1. **Unify Data Sources**: Combine legacy `heatHistory` with new `heat_cycles` system
2. **Remove UI Duplication**: Eliminate confusing duplicate heat input options
3. **Improve User Experience**: Guide users to the comprehensive Heat Journal
4. **Ensure Data Integrity**: Zero data loss during migration

## 📋 Migration Status

### ✅ Phase 1: Safety Infrastructure (COMPLETED)
- [x] Feature flag system (`src/config/heatMigration.ts`)
- [x] Validation utilities (`src/utils/heatValidation.ts`)
- [x] Safe wrapper (`src/utils/heatCalculatorSafe.ts`)
- [x] Testing utilities (`src/utils/migrationTestUtils.ts`)
- [x] Updated `useUpcomingHeats` hook to use safe wrapper

### 🔄 Phase 2: Service Migration (IN PROGRESS)
- [ ] Migrate `usePlannedLitterQueries`
- [ ] Migrate `ReminderCalendarSyncService`
- [ ] Migrate dog services (`addDog.ts`, `updateDog.ts`)

### ⏳ Phase 3: UI Cleanup (PENDING)
- [ ] Add migration notice to `HeatRecordsField`
- [ ] Remove heat input from `AddDogDialog`
- [ ] Remove heat input from `DogEditForm`
- [ ] Keep read-only display for legacy data

### ⏳ Phase 4: Data Optimization (PENDING)
- [ ] Batch migration of legacy heat history
- [ ] Performance optimization
- [ ] Data cleanup

### ⏳ Phase 5: Testing & Documentation (PENDING)
- [ ] Comprehensive testing
- [ ] User guidance updates
- [ ] Migration documentation

## 🔧 Configuration

### Current Settings (`src/config/heatMigration.ts`)
```typescript
USE_UNIFIED_CALCULATION: false      // Main toggle
VALIDATE_CALCULATIONS: true         // Compare methods
ENABLE_MIGRATION_LOGGING: true      // Debug logging

SERVICES_USING_UNIFIED: {
  upcomingHeats: false,              // ✅ Ready for testing
  plannedLitters: false,             // 🔄 Being migrated
  reminderSync: false,               // ⏳ Pending
  dogServices: false,                // ⏳ Pending
}
```

## 🧪 Testing

### Development Console Testing
```javascript
// Available globally in browser console
window.testHeatMigration.showCurrentConfig()
window.testHeatMigration.instructions()
```

### Component Testing
```typescript
import { useMigrationTesting } from '@/utils/migrationTestUtils';

// In your component
const { runTests, testSpecificService } = useMigrationTesting();

// Run full test suite
const results = await runTests();

// Test specific service
const result = await testSpecificService('upcomingHeats');
```

### Manual Testing Steps
1. **Enable logging**: Check console for `[HEAT-MIGRATION]` messages
2. **Compare calculations**: Look for `[HEAT-VALIDATION]` results
3. **Test with real data**: Use actual dogs data from your account
4. **Check edge cases**: Dogs without heat history, invalid dates, etc.

## 🔄 How to Enable Unified Calculation

### For Testing (Gradual Rollout)
1. Edit `src/config/heatMigration.ts`
2. Set specific service to `true`:
   ```typescript
   SERVICES_USING_UNIFIED: {
     upcomingHeats: true,  // Enable for this service only
     // ... others remain false
   }
   ```

### For Full Migration
1. Set `USE_UNIFIED_CALCULATION: true`
2. Monitor console logs for issues
3. Check validation results
4. Rollback if problems detected

## 🚨 Safety Features

### Automatic Fallback
- If unified calculation fails, automatically falls back to legacy
- Graceful error handling prevents crashes
- Detailed logging for debugging

### Validation
- Compares legacy vs unified results automatically
- Warns about discrepancies
- Runs in background without blocking UI

### Feature Flags
- Can enable/disable per service
- Easy rollback if issues found
- Gradual rollout capabilities

## 📊 Monitoring

### Key Metrics to Watch
- **Calculation matches**: `[HEAT-VALIDATION]` logs should show `✅ MATCH`
- **Performance**: No significant slowdowns in heat calculations
- **Error rates**: Monitor for any new errors in console
- **User experience**: No broken functionality

### Log Messages to Monitor
```
[HEAT-MIGRATION] Calculating heats for [service]
[HEAT-VALIDATION] [service]: ✅ MATCH (Legacy: X, Unified: Y)
[HEAT-MIGRATION] Background validation failed - investigate!
```

## 🔧 Troubleshooting

### Common Issues
1. **Validation Mismatches**: Check for data inconsistencies
2. **Performance Issues**: Increase timeout or optimize queries
3. **Missing Heat Data**: Ensure migration ran successfully

### Debug Commands
```typescript
// Check migration readiness
import { checkMigrationReadiness } from '@/utils/heatCalculatorSafe';
const status = await checkMigrationReadiness(dogs);

// Compare methods manually
import { testHeatCalculationMethods } from '@/utils/heatCalculatorSafe';
const comparison = await testHeatCalculationMethods(dogs, 'upcomingHeats');

// Full system validation
import { performSystemValidation } from '@/utils/heatValidation';
const validation = await performSystemValidation(dogs);
```

## 📝 Next Steps

1. **Complete Phase 2**: Migrate remaining services
2. **Test thoroughly**: Run validation on production data
3. **Monitor performance**: Ensure no regressions
4. **Plan UI cleanup**: Remove duplicate heat input options
5. **User communication**: Notify about Heat Journal improvements

## 🔒 Rollback Plan

If issues are discovered:
1. Set `USE_UNIFIED_CALCULATION: false`
2. Set all services in `SERVICES_USING_UNIFIED` to `false`
3. System automatically reverts to legacy methods
4. No data loss - all legacy data remains intact
5. Investigate issues and fix before re-enabling

---

**Status**: Phase 1 Complete ✅ | Currently implementing Phase 2 🔄
