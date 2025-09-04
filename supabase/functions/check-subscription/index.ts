import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Timeout wrapper for Stripe API calls
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

// Retry wrapper for Stripe API calls
const withRetry = async <T>(operation: () => Promise<T>, maxRetries: number = 2): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logStep(`Attempt ${attempt} failed`, { error: lastError.message });
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    // If authentication fails, we still need to check friend status
    if (userError || !userData.user?.email) {
      logStep("JWT authentication failed, checking for friend status as fallback", { 
        error: userError?.message 
      });
      
      // Try to extract user ID from token for friend check (if possible)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;
        
        if (userId) {
          logStep("Extracted user ID from token for friend check", { userId });
          
          const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('friend, subscription_status, has_paid, trial_end_date')
            .eq('id', userId)
            .single();

          if (profileData?.friend) {
            logStep("User is friend - granting access despite auth failure");
            return new Response(JSON.stringify({
              has_access: true,
              subscription_status: 'active',
              is_friend: true,
              has_paid: profileData.has_paid || false,
              trial_end_date: profileData.trial_end_date,
              current_period_end: null
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      } catch (tokenError) {
        logStep("Could not extract user ID from token", { tokenError });
      }
      
      // Return 401 to trigger fallback logic in client
      return new Response(JSON.stringify({ 
        error: "Authentication required",
        auth_failed: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get current profile data for fallback
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, subscription_status, has_paid, trial_end_date, friend')
      .eq('id', user.id)
      .single();

    logStep("Profile data retrieved", { 
      hasStripeCustomer: !!profileData?.stripe_customer_id,
      subscriptionStatus: profileData?.subscription_status,
      hasPaid: profileData?.has_paid,
      friend: profileData?.friend
    });

    // If user is marked as friend, grant immediate access
    if (profileData?.friend) {
      logStep("User is marked as friend, granting access");
      return new Response(JSON.stringify({
        has_access: true,
        subscription_status: 'active',
        is_friend: true,
        has_paid: profileData.has_paid || false,
        trial_end_date: profileData.trial_end_date,
        current_period_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Use fallback data if Stripe API fails
    let hasActiveSub = false;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let currentPeriodEnd = null;
    let hasPaid = profileData?.has_paid || false;
    let customerId = profileData?.stripe_customer_id || null;
    let subscriptions = null; // Declare at proper scope

    try {
      // Get customer with timeout and retry
      const customers = await withRetry(async () => {
        return withTimeout(
          stripe.customers.list({ email: user.email, limit: 1 }),
          10000 // 10 second timeout
        );
      });
      
      if (customers.data.length === 0) {
        logStep("No customer found, updating unsubscribed state");
        await supabaseClient.from("profiles").upsert({
          id: user.id,
          email: user.email,
          stripe_customer_id: null,
          subscription_status: 'inactive',
          has_paid: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        
        return new Response(JSON.stringify({ 
          has_access: false,
          subscription_status: 'inactive',
          is_friend: false,
          has_paid: false,
          trial_end_date: profileData?.trial_end_date,
          current_period_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Get subscriptions with timeout and retry
      subscriptions = await withRetry(async () => {
        return withTimeout(
          stripe.subscriptions.list({
            customer: customerId!,
            limit: 10,
          }),
          10000 // 10 second timeout
        );
      });

      // Process subscription data with improved selection logic
      const activeSubscriptions = subscriptions.data.filter(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      );
      
      // Sort by updated/created date descending and prioritize active/trialing over past_due
      activeSubscriptions.sort((a, b) => {
        // First priority: status order (active/trialing > past_due)
        const statusPriority = (status: string) => {
          if (status === 'active') return 3;
          if (status === 'trialing') return 2;
          if (status === 'past_due') return 1;
          return 0;
        };
        
        const priorityDiff = statusPriority(b.status) - statusPriority(a.status);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Second priority: most recently updated/created
        return (b.updated || b.created) - (a.updated || a.created);
      });
      
      logStep("Sorted subscriptions by priority", { 
        totalFound: subscriptions.data.length,
        activeCount: activeSubscriptions.length,
        topSubscription: activeSubscriptions[0] ? {
          id: activeSubscriptions[0].id,
          status: activeSubscriptions[0].status,
          updated: activeSubscriptions[0].updated,
          created: activeSubscriptions[0].created
        } : null
      });
      
      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0];
        hasActiveSub = subscription.status === 'active' || subscription.status === 'trialing';
        currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        if (subscription.status === 'trialing') {
          subscriptionEnd = new Date(subscription.trial_end! * 1000).toISOString();
        } else {
          subscriptionEnd = currentPeriodEnd;
        }
        
        // Determine subscription tier from price
        const priceId = subscription.items.data[0].price.id;
        const price = await withRetry(async () => {
          return withTimeout(stripe.prices.retrieve(priceId), 5000);
        });
        
        const amount = price.unit_amount || 0;
        if (amount <= 999) {
          subscriptionTier = "Basic";
        } else if (amount <= 1999) {
          subscriptionTier = "Premium";
        } else {
          subscriptionTier = "Enterprise";
        }
        
        hasPaid = subscription.status === 'active' || subscription.status === 'past_due';
        logStep("Selected subscription found", { 
          chosenSubId: subscription.id,
          status: subscription.status,
          endDate: subscriptionEnd,
          subscriptionTier,
          hasActiveSub,
          hasPaid
        });
      } else {
        // Check if user had any previous subscriptions (has paid before)
        const allSubscriptions = subscriptions.data;
        hasPaid = allSubscriptions.some(sub => 
          ['active', 'canceled', 'past_due', 'unpaid'].includes(sub.status)
        );
        logStep("No active subscription found", { hadPreviousSubscriptions: hasPaid });
      }

    } catch (stripeError) {
      logStep("Stripe API error, using fallback data", { 
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
        fallbackData: {
          customerId,
          subscriptionStatus: profileData?.subscription_status,
          hasPaid: profileData?.has_paid
        }
      });
      
      // Use cached data from profile
      hasActiveSub = ['active', 'trialing'].includes(profileData?.subscription_status || '');
      hasPaid = profileData?.has_paid || false;
      subscriptionEnd = profileData?.trial_end_date;
    }

    // Determine subscription status (preserve original Stripe status when applicable)
    let subscriptionStatus = 'inactive';
    let selectedSubscription = null;
    
    // Only try to find selected subscription if we have subscriptions data
    if (hasActiveSub && subscriptions) {
      selectedSubscription = subscriptions.data.find(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      );
      // Preserve 'trialing' status instead of mapping to 'active'
      subscriptionStatus = selectedSubscription?.status || 'active';
    } else if (hasActiveSub) {
      // Fallback case when using profile data
      subscriptionStatus = profileData?.subscription_status || 'active';
    } else if (hasPaid) {
      subscriptionStatus = 'canceled';
    }

    // Calculate access
    const hasAccess = hasActiveSub || profileData?.friend || false;

    // Update profile with latest data
    await supabaseClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatus,
      has_paid: hasPaid,
      trial_end_date: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Enhanced detailed logging for debugging access decisions
    logStep("Final access decision", { 
      customerId,
      chosenSubId: selectedSubscription?.id || 'none',
      status: subscriptionStatus,
      decidedAccess: hasAccess,
      hasActiveSub,
      subscriptionTier,
      hasPaid,
      isFriend: profileData?.friend || false
    });
    
    return new Response(JSON.stringify({
      has_access: hasAccess,
      subscription_status: subscriptionStatus,
      is_friend: profileData?.friend || false,
      has_paid: hasPaid,
      trial_end_date: subscriptionEnd,
      current_period_end: currentPeriodEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});