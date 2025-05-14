
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
  };
}
