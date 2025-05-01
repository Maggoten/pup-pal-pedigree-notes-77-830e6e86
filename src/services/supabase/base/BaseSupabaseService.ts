
import { toast } from '@/components/ui/use-toast';

export class BaseSupabaseService {
  /**
   * Helper to handle and log errors consistently
   */
  protected handleError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
    toast({
      title: `Error in ${context}`,
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive'
    });
  }
  
  /**
   * Format a date for storage or display
   */
  protected formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }
}
