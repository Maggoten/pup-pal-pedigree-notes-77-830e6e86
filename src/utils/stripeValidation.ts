import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Validates the user's Stripe setup and subscription configuration
 */
export const validateStripeSetup = async (): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  
  try {
    // Check 1: User Authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      results.push({
        success: false,
        message: 'Authentication Required',
        details: { error: sessionError?.message || 'No active session' }
      });
      return results;
    }
    
    results.push({
      success: true,
      message: 'Authentication Valid',
      details: { userId: session.user.id, email: session.user.email }
    });

    // Check 2: User Profile Exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id, subscription_status, has_paid, friend')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      results.push({
        success: false,
        message: 'Profile Access Error',
        details: { error: profileError.message }
      });
      return results;
    }

    results.push({
      success: true,
      message: 'Profile Found',
      details: {
        hasStripeCustomerId: !!profile.stripe_customer_id,
        subscriptionStatus: profile.subscription_status,
        hasPaid: profile.has_paid,
        friend: profile.friend
      }
    });

    // Check 3: Stripe Customer ID Validation
    if (!profile.stripe_customer_id) {
      results.push({
        success: false,
        message: 'No Stripe Customer ID',
        details: { 
          explanation: 'User needs to complete subscription setup',
          action: 'Visit subscription page to activate'
        }
      });
    } else {
      results.push({
        success: true,
        message: 'Stripe Customer ID Present',
        details: { 
          customerId: profile.stripe_customer_id,
          length: profile.stripe_customer_id.length
        }
      });
    }

    // Check 4: Customer Portal Access Test
    if (profile.stripe_customer_id) {
      try {
        const { data, error } = await supabase.functions.invoke('customer-portal', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          results.push({
            success: false,
            message: 'Customer Portal Access Failed',
            details: { error: error.message }
          });
        } else if (data?.url) {
          results.push({
            success: true,
            message: 'Customer Portal Access Valid',
            details: { urlGenerated: true }
          });
        } else {
          results.push({
            success: false,
            message: 'Customer Portal Response Invalid',
            details: { data }
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: 'Customer Portal Test Error',
          details: { error: String(error) }
        });
      }
    }

    return results;

  } catch (error) {
    results.push({
      success: false,
      message: 'Validation Process Error',
      details: { error: String(error) }
    });
    return results;
  }
};

/**
 * Quick validation to check if user can manage subscriptions
 */
export const canManageSubscription = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    return !!profile?.stripe_customer_id;
  } catch {
    return false;
  }
};