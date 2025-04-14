
import { useSupabaseDogs } from '@/context/dogs';

// Re-export the Supabase hook as useDogs (main hook name)
export const useDogs = useSupabaseDogs;

// Also export the original name for backward compatibility
export { useSupabaseDogs };
