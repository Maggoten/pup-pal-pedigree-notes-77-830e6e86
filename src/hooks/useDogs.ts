
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useDogs as useDogsHook } from '@/context/dogs/DogsContext';

// Re-export the hook with the same name
export const useDogs = useDogsHook;
