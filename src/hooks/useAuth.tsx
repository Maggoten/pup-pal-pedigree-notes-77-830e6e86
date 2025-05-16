
// Re-export the Auth context and provider from the correct location
// This ensures we have a single source of truth for auth
export { useAuth } from '@/providers/AuthProvider';
export { AuthProvider } from '@/providers/AuthProvider';
