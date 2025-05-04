
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useDogs as useDogsHook } from './dogs';
import { useDogs as useDogsContext } from '@/context/dogs/useDogs';

// Export the context hook by default to maintain backward compatibility
export { useDogsContext as useDogs };

// Also export the hook-based implementation under a different name if needed
export const useDogsFunctions = useDogsHook;
