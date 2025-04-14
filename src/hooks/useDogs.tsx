
// This is a re-export file that points to the correct useDogs hook
// This hook uses Supabase to store and retrieve dog data

// Import directly from the context file to avoid circular dependencies
import { useSupabaseDogs } from '@/context/dogs/SupabaseDogContext';

// Re-export the Supabase hook as useDogs (main hook name)
export const useDogs = useSupabaseDogs;

// Also export the original name for backward compatibility
export { useSupabaseDogs };
