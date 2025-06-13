import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Initialize Supabase with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user profile - ALWAYS check friend status first
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    logStep("Retrieved user profile", { 
      hasStripeCustomer: !!profile.stripe_customer_id,
      currentStatus: profile.subscription_status,
      isFriend: profile.friend
    });

    // CRITICAL: If user is marked as friend, they have access regardless of Stripe
    if (profile.friend) {
      logStep("User is marked as friend - granting full access");
      return new Response(JSON.stringify({
        has_access: true,
        subscription_status: 'friend',
        is_friend: true,
        has_paid: profile.has_paid || false,
        trial_end_date: profile.trial_end_date
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If no Stripe customer ID, user doesn't have subscription
    if (!profile.stripe_customer_id) {
      logStep("No Stripe customer found - user not subscribed");
      return new Response(JSON.stringify({
        has_access: false,
        subscription_status: 'inactive',
        is_friend: false,
        has_paid: false,
        trial_end_date: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get active subscriptions for the customer (including cancelled ones)
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 10,
    });

    let hasAccess = false;
    let subscriptionStatus = 'inactive';
    let hasPaid = profile.has_paid;
    let trialEndDate = profile.trial_end_date;

    if (subscriptions.data.length > 0) {
      // Get the most recent subscription
      const subscription = subscriptions.data[0];
      logStep("Found subscription", { 
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: subscription.current_period_end
      });

      subscriptionStatus = subscription.status;
      
      // Update trial end date if available
      if (subscription.trial_end) {
        trialEndDate = new Date(subscription.trial_end * 1000).toISOString();
      }

      const now = Date.now();
      const trialEndTime = subscription.trial_end ? subscription.trial_end * 1000 : 0;
      const isTrialActive = trialEndTime > now;

      // Determine access based on subscription status and trial period
      if (subscription.status === 'active') {
        hasAccess = true;
        hasPaid = !subscription.trial_end || trialEndTime < now;
        logStep("Active subscription - granting access", { hasPaid });
      } else if (subscription.status === 'trialing') {
        hasAccess = true;
        hasPaid = false;
        subscriptionStatus = 'trial';
        logStep("Trialing subscription - granting trial access");
      } else if (subscription.status === 'canceled' && isTrialActive) {
        // CRITICAL: Cancelled subscription but trial is still active
        hasAccess = true;
        hasPaid = false;
        subscriptionStatus = 'canceled_trial';
        logStep("Cancelled subscription with active trial - granting trial access", {
          trialEndTime: new Date(trialEndTime).toISOString(),
          remainingTrialDays: Math.ceil((trialEndTime - now) / (1000 * 60 * 60 * 24))
        });
      } else if (subscription.status === 'canceled' && !isTrialActive) {
        // Cancelled subscription and trial has ended
        hasAccess = false;
        subscriptionStatus = 'canceled';
        logStep("Cancelled subscription with expired trial - no access");
      } else if (subscription.status === 'past_due') {
        // Past due subscriptions - check if trial is still active
        if (isTrialActive) {
          hasAccess = true;
          hasPaid = false;
          subscriptionStatus = 'trial';
          logStep("Past due subscription with active trial - granting trial access");
        } else {
          hasAccess = false;
          subscriptionStatus = 'past_due';
          logStep("Past due subscription - no access");
        }
      } else {
        // Other statuses (incomplete, incomplete_expired, unpaid)
        hasAccess = false;
        logStep("Subscription in non-active status", { status: subscription.status });
      }

      // Update profile with latest info
      await supabaseClient
        .from('profiles')
        .update({
          subscription_status: subscriptionStatus,
          has_paid: hasPaid,
          trial_end_date: trialEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      logStep("Updated profile with latest subscription info", { 
        subscriptionStatus, 
        hasAccess, 
        hasPaid,
        trialEndDate 
      });
    }

    logStep("Final response", {
      hasAccess,
      subscriptionStatus,
      isFriend: profile.friend,
      hasPaid,
      trialEndDate
    });

    return new Response(JSON.stringify({
      has_access: hasAccess,
      subscription_status: subscriptionStatus,
      is_friend: profile.friend, // FIXED: Return actual friend status from profile
      has_paid: hasPaid,
      trial_end_date: trialEndDate
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