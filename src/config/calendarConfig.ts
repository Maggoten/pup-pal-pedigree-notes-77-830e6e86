/**
 * Calendar event retention configuration
 * Based on industry best practices for breeding management software
 */
export const CALENDAR_CONFIG = {
  /**
   * PERMANENT EVENTS - Never auto-delete
   * These represent actual historical events that form the breeding record
   */
  PERMANENT_EVENT_TYPES: [
    'mating',           // Actual mating dates (critical breeding history)
    'due-date',         // Birth/due dates (production records)
    'birthday',         // Dog birthdays (fundamental identity data)
    'heat-active',      // Actual heat cycles (medical history)
    'vaccination',      // Actual vaccinations (often legally required)
  ] as const,

  /**
   * MEDIUM RETENTION (12 months) - Predictions and reminders
   * These are forecasts that may or may not materialize
   */
  MEDIUM_RETENTION: {
    types: [
      'heat',                    // Predicted heat cycles (not yet confirmed)
      'ovulation-predicted',     // Predicted ovulation
      'fertility-window',        // Predicted fertility windows
      'birthday-reminder',       // Reminders (no longer needed after date)
      'vaccination-reminder',    // Reminders (no longer needed after date)
    ] as const,
    months: 12
  },

  /**
   * SHORT RETENTION (6 months) - Custom user events
   */
  SHORT_RETENTION: {
    types: [
      'custom',     // User-created custom events
      'reminder',   // Generic reminders
      'vet-visit',  // Vet visits (unless made permanent)
    ] as const,
    months: 6
  },

  /**
   * How many months ahead to create future events
   * (birthdays, predicted heats, etc.)
   */
  FUTURE_EVENT_HORIZON_MONTHS: 18,

  /**
   * Grace period for recent events
   * Events within this period are always shown, even if they "should" be next year
   */
  RECENT_EVENT_GRACE_DAYS: 3,
};

/**
 * Type guards and helper functions
 */
export const CalendarConfigHelpers = {
  /**
   * Check if an event type should be stored permanently
   */
  isPermanentEvent(eventType: string): boolean {
    return CALENDAR_CONFIG.PERMANENT_EVENT_TYPES.includes(eventType as any);
  },

  /**
   * Get retention period for an event type
   * @returns Number of months to retain, or null for permanent
   */
  getRetentionMonths(eventType: string): number | null {
    if (this.isPermanentEvent(eventType)) {
      return null; // Permanent
    }
    
    if (CALENDAR_CONFIG.MEDIUM_RETENTION.types.includes(eventType as any)) {
      return CALENDAR_CONFIG.MEDIUM_RETENTION.months;
    }
    
    if (CALENDAR_CONFIG.SHORT_RETENTION.types.includes(eventType as any)) {
      return CALENDAR_CONFIG.SHORT_RETENTION.months;
    }
    
    return CALENDAR_CONFIG.MEDIUM_RETENTION.months; // Default
  },

  /**
   * Calculate cutoff date for event type
   * @returns Date before which events should be deleted, or null for permanent
   */
  getCutoffDate(eventType: string): Date | null {
    const months = this.getRetentionMonths(eventType);
    
    if (months === null) {
      return null; // Permanent - no cutoff
    }
    
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return cutoff;
  }
};
