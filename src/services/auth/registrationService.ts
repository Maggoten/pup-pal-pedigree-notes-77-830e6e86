
import { supabase } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Handle registration functionality
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    // Register the user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Since address was removed from RegisterData, use empty string
          address: '',
          newsletter_consent: userData.subscribeToNewsletter || false
        }
      }
    });
    
    if (error) {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        toast({
          title: "Email already in use",
          description: "This email address is already registered. Please try to log in instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
      }
      
      return null;
    }
    
    if (!data.user) {
      console.error("Registration error: No user returned from Supabase");
      return null;
    }
    
    // The profile is created automatically via database trigger
    return {
      id: data.user.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: '' // Use empty string since address field was removed
    };
  } catch (error) {
    console.error("Registration error:", error);
    toast({
      title: "Registration failed",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
