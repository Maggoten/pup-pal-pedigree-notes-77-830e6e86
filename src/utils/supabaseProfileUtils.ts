
import { ProfileData, SharedUser } from '@/types/settings';
import { isSupabaseError } from '@/utils/supabaseTypeUtils';

// Convert Supabase profile data to ProfileData type
export function convertToProfileData(data: any): ProfileData | null {
  if (!data) return null;
  
  try {
    return {
      address: data.address || '',
      created_at: data.created_at || '',
      email: data.email || '',
      first_name: data.first_name || '',
      id: data.id || '',
      kennel_name: data.kennel_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      subscription_status: data.subscription_status || 'active',
      updated_at: data.updated_at || ''
    };
  } catch (error) {
    console.error('Error converting profile data:', error);
    return null;
  }
}

// Process shared users data from Supabase
export function processSharedUsers(data: any[]): SharedUser[] {
  if (!data || !Array.isArray(data)) return [];
  
  try {
    return data.map(item => ({
      id: item.id || '',
      owner_id: item.owner_id || '',
      shared_with_id: item.shared_with_id || '',
      role: item.role || 'viewer',
      status: item.status || 'pending',
      created_at: item.created_at || '',
      updated_at: item.updated_at || ''
    }));
  } catch (error) {
    console.error('Error processing shared users:', error);
    return [];
  }
}

// Handle Supabase errors safely
export function handleSupabaseError(error: any): string {
  if (isSupabaseError(error)) {
    return `Database error: ${error.message || 'Unknown database error'}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
