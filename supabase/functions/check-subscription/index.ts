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

    // Get user profile
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
      currentStatus: profile.subscription_status 
    });

    // If user is marked as friend, they have access regardless of Stripe
    if (profile.friend) {
      logStep("User is marked as friend - has access");
      return new Response(JSON.stringify({
        has_access: true,
        subscription_status: 'friend',
        is_friend: true,
        has_paid: profile.has_paid,
        trial_end_date: profile.trial_end_date
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If no Stripe customer ID, user doesn't have subscription
    if (!profile.stripe_customer_id) {
      logStep("No Stripe customer found");
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

    // Get active subscriptions for the customer
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
        trialEnd: subscription.trial_end 
      });

      subscriptionStatus = subscription.status;
      
      // Check if subscription gives access
      if (subscription.status === 'active') {
        hasAccess = true;
        hasPaid = !subscription.trial_end || subscription.trial_end * 1000 < Date.now();
      } else if (subscription.status === 'trialing') {
        hasAccess = true;
        hasPaid = false;
        subscriptionStatus = 'trial';
      }

      // Update trial end date if available
      if (subscription.trial_end) {
        trialEndDate = new Date(subscription.trial_end * 1000).toISOString();
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

      logStep("Updated profile with latest subscription info");
    }

    return new Response(JSON.stringify({
      has_access: hasAccess,
      subscription_status: subscriptionStatus,
      is_friend: false,
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