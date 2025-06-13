import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FINALIZE-REGISTRATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    logStep("Stripe credentials verified");

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

    const { session_id } = await req.json();
    if (!session_id) throw new Error("No session_id provided");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the checkout session to get subscription details
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription']
    });

    if (!checkoutSession.subscription) {
      throw new Error("No subscription found in checkout session");
    }

    const subscription = checkoutSession.subscription as Stripe.Subscription;
    logStep("Retrieved subscription from checkout", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      trialEnd: subscription.trial_end 
    });

    // Calculate trial end date
    const trialEndDate = subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    // Update user profile with subscription info
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status === 'trialing' ? 'trial' : subscription.status,
        trial_end_date: trialEndDate,
        has_paid: false, // Still false during trial
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    logStep("Updated user profile with subscription info", {
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEndDate
    });

    return new Response(JSON.stringify({
      success: true,
      subscription_id: subscription.id,
      trial_end: trialEndDate,
      status: subscription.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in finalize-registration", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});