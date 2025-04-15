
// This file is kept for backward compatibility
// It re-exports the new modular hook structure
import { useDogs as useDogsHook } from './dogs';
export { useDogs };

// Re-export the hook with the same name
const useDogs = useDogsHook;
