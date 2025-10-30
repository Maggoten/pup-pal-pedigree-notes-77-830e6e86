import { supabase } from '@/integrations/supabase/client';
import { CALENDAR_CONFIG, CalendarConfigHelpers } from '@/config/calendarConfig';

/**
 * Service for periodic cleanup of old calendar events
 * Runs during user sessions to keep calendar database optimized
 */
export class CalendarCleanupService {
  /**
   * Run cleanup for current user
   * Safe to call frequently - only processes temporary events
   */
  static async runCleanup(): Promise<boolean> {
    try {
      console.log('🧹 Starting periodic calendar cleanup...');
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        return false;
      }
      
      const userId = authData.user.id;
      let totalCleaned = 0;
      
      // Clean up medium retention events (12 months)
      for (const eventType of CALENDAR_CONFIG.MEDIUM_RETENTION.types) {
        const cutoffDate = CalendarConfigHelpers.getCutoffDate(eventType);
        
        if (cutoffDate) {
          const { count } = await supabase
            .from('calendar_events')
            .delete()
            .eq('user_id', userId)
            .eq('type', eventType)
            .lt('date', cutoffDate.toISOString())
            .select();
          
          if (count && count > 0) {
            totalCleaned += count;
            console.log(`✅ Cleaned ${count} old ${eventType} event(s)`);
          }
        }
      }
      
      // Clean up short retention events (6 months)
      for (const eventType of CALENDAR_CONFIG.SHORT_RETENTION.types) {
        const cutoffDate = CalendarConfigHelpers.getCutoffDate(eventType);
        
        if (cutoffDate) {
          const { count } = await supabase
            .from('calendar_events')
            .delete()
            .eq('user_id', userId)
            .eq('type', eventType)
            .lt('date', cutoffDate.toISOString())
            .select();
          
          if (count && count > 0) {
            totalCleaned += count;
            console.log(`✅ Cleaned ${count} old ${eventType} event(s)`);
          }
        }
      }
      
      if (totalCleaned > 0) {
        console.log(`🎯 Periodic cleanup complete: Removed ${totalCleaned} old event(s)`);
      } else {
        console.log(`✅ Periodic cleanup complete: Calendar is clean`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in periodic cleanup:', error);
      return false;
    }
  }
}
