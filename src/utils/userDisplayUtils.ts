
import { User } from '@/types/auth';

export const getDisplayUsername = (user: User | null): string => {
  if (user?.firstName) {
    // Use first name if available (preferred)
    return user.firstName;
  } else if (user?.email) {
    // Fallback to email prefix
    return user.email.split('@')[0];
  }
  // Ultimate fallback
  return 'Breeder';
};
