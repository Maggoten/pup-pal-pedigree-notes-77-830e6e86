import type { Database } from '@/integrations/supabase/types';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

export interface OptimalMatingWindow {
  startDate: Date | null;
  endDate: Date | null;
  confidence: 'high' | 'medium' | 'low' | 'insufficient_data';
  lhSurgeDetected: boolean;
  peakProgesteroneValue: number | null;
  recommendations: string[];
}

/**
 * Calculates optimal mating days based on progesterone values
 * The algorithm looks for LH surge (rapid rise from <2 to >5 ng/ml)
 * Optimal mating is typically 24-48 hours after LH surge detection
 */
export function calculateOptimalMatingDays(heatLogs: HeatLog[]): OptimalMatingWindow {
  // Filter progesterone tests and sort by date
  const progesteroneTests = heatLogs
    .filter(log => log.test_type === 'progesterone' && log.progesterone_value !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (progesteroneTests.length < 2) {
    return {
      startDate: null,
      endDate: null,
      confidence: 'insufficient_data',
      lhSurgeDetected: false,
      peakProgesteroneValue: null,
      recommendations: ['Need at least 2 progesterone tests to calculate optimal mating window']
    };
  }

  // Find LH surge pattern
  let lhSurgeDate: Date | null = null;
  let peakProgesteroneValue = 0;
  const recommendations: string[] = [];

  for (let i = 1; i < progesteroneTests.length; i++) {
    const currentTest = progesteroneTests[i];
    const previousTest = progesteroneTests[i - 1];
    
    const currentValue = currentTest.progesterone_value!;
    const previousValue = previousTest.progesterone_value!;
    
    peakProgesteroneValue = Math.max(peakProgesteroneValue, currentValue);

    // LH surge detection: Rise from <2 to >5 ng/ml within a reasonable timeframe
    if (previousValue < 2 && currentValue > 5) {
      lhSurgeDate = new Date(currentTest.date);
      break;
    }
    
    // Alternative detection: Significant rise (>3x increase) crossing 5 ng/ml threshold
    if (previousValue < 5 && currentValue >= 5 && currentValue >= previousValue * 2) {
      lhSurgeDate = new Date(currentTest.date);
      break;
    }
  }

  // Calculate optimal mating window
  if (lhSurgeDate) {
    // Optimal mating: 24-48 hours after LH surge
    const startDate = new Date(lhSurgeDate);
    startDate.setHours(startDate.getHours() + 24); // 24 hours after LH surge
    
    const endDate = new Date(lhSurgeDate);
    endDate.setHours(endDate.getHours() + 48); // 48 hours after LH surge

    const confidence = peakProgesteroneValue > 10 ? 'high' : peakProgesteroneValue > 5 ? 'medium' : 'low';

    recommendations.push(
      'LH surge detected - optimal mating window identified',
      'Monitor for behavioral signs (receptivity, flagging)',
      'Consider multiple matings within the window for best success rate'
    );

    if (peakProgesteroneValue > 15) {
      recommendations.push('Very high progesterone levels - peak fertility period');
    }

    return {
      startDate,
      endDate,
      confidence,
      lhSurgeDetected: true,
      peakProgesteroneValue,
      recommendations
    };
  }

  // No clear LH surge detected - provide guidance based on current levels
  const latestTest = progesteroneTests[progesteroneTests.length - 1];
  const latestValue = latestTest.progesterone_value!;

  if (latestValue < 1) {
    recommendations.push(
      'Progesterone levels still very low',
      'Continue testing every 1-2 days',
      'LH surge has not occurred yet'
    );
  } else if (latestValue < 2) {
    recommendations.push(
      'Progesterone levels rising but still low',
      'Test daily - LH surge may occur soon',
      'Watch for behavioral changes'
    );
  } else if (latestValue < 5) {
    recommendations.push(
      'Progesterone levels moderate - approaching surge range',
      'Test every 12-24 hours',
      'LH surge may be imminent'
    );
  } else {
    recommendations.push(
      'Progesterone elevated - may have missed LH surge',
      'Consider mating now if not already done',
      'Continue monitoring but window may be closing'
    );
  }

  return {
    startDate: null,
    endDate: null,
    confidence: 'insufficient_data',
    lhSurgeDetected: false,
    peakProgesteroneValue,
    recommendations
  };
}

/**
 * Determines if more progesterone testing is needed
 */
export function shouldContinueTesting(window: OptimalMatingWindow, lastTestDate: Date): boolean {
  if (window.lhSurgeDetected && window.endDate && new Date() > window.endDate) {
    return false; // Window has passed
  }

  const daysSinceLastTest = (new Date().getTime() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (window.confidence === 'insufficient_data' || window.confidence === 'low') {
    return daysSinceLastTest >= 1; // Test daily when data is insufficient
  }

  return false; // Stop testing after high confidence window
}

/**
 * Gets next recommended test date
 */
export function getNextTestRecommendation(window: OptimalMatingWindow, lastTestDate: Date): Date | null {
  if (!shouldContinueTesting(window, lastTestDate)) {
    return null;
  }

  const nextTest = new Date(lastTestDate);
  
  if (window.confidence === 'insufficient_data') {
    nextTest.setDate(nextTest.getDate() + 1); // Daily testing
  } else if (window.confidence === 'low') {
    nextTest.setHours(nextTest.getHours() + 12); // Every 12 hours
  }

  return nextTest;
}