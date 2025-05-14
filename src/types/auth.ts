export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}
