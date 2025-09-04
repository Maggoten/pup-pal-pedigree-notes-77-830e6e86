import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Parse request body for additional parameters
    let requestBody: any = {};
    try {
      const body = await req.text();
      if (body) {
        requestBody = JSON.parse(body);
      }
    } catch (e) {
      // Body is optional, continue with empty object
    }

    const { checkPaymentMethod, returnUrl } = requestBody;

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

    // Get user profile to find Stripe customer ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logStep("Profile query error", { error: profileError, userId: user.id });
      throw new Error(`Unable to retrieve user profile: ${profileError.message}`);
    }

    if (!profile) {
      logStep("No profile found", { userId: user.id, email: user.email });
      throw new Error("User profile not found. Please contact support.");
    }

    if (!profile.stripe_customer_id) {
      logStep("No Stripe customer ID found", { 
        userId: user.id, 
        email: user.email,
        profileEmail: profile.email 
      });
      throw new Error("No subscription found. Please activate a subscription first by visiting the subscription page.");
    }

    logStep("Found Stripe customer", { customerId: profile.stripe_customer_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Validate that the Stripe customer still exists and get full customer data
    let customer;
    try {
      customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      if (customer.deleted) {
        logStep("Stripe customer was deleted", { customerId: profile.stripe_customer_id });
        throw new Error("Your subscription account is no longer active. Please contact support.");
      }
      logStep("Validated Stripe customer", { 
        customerId: profile.stripe_customer_id,
        customerEmail: customer.email 
      });
    } catch (stripeError) {
      logStep("Stripe customer validation failed", { 
        customerId: profile.stripe_customer_id,
        error: stripeError 
      });
      throw new Error("Unable to access your subscription account. Please contact support.");
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const finalReturnUrl = returnUrl || `${origin}/settings`;

    // Check if we need to handle payment method routing for trialing customers
    if (checkPaymentMethod) {
      const hasDefaultPaymentMethod = customer.invoice_settings?.default_payment_method || customer.default_source;
      
      logStep("Checking payment method for smart routing", { 
        customerId: profile.stripe_customer_id,
        hasDefaultPaymentMethod: !!hasDefaultPaymentMethod,
        defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
        defaultSource: customer.default_source
      });

      // Get current subscription to check status
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 1
      });

      const currentSub = subscriptions.data[0];
      const isTrialingOrActive = currentSub?.status === 'trialing' || currentSub?.status === 'active';

      logStep("Subscription check for routing", {
        hasSubscription: !!currentSub,
        subscriptionStatus: currentSub?.status,
        isTrialingOrActive
      });

      // If trialing/active but no default payment method, use special routing
      if (isTrialingOrActive && !hasDefaultPaymentMethod) {
        logStep("Trialing/active customer without payment method, trying payment method update flow");
        
        try {
          // Try payment method update flow first
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            flow_data: {
              type: 'payment_method_update'
            },
            return_url: `${finalReturnUrl}?payment=updated`,
          });

          logStep("Created payment method update portal session", { 
            sessionId: portalSession.id,
            flowType: 'payment_method_update'
          });

          return new Response(JSON.stringify({ 
            url: portalSession.url,
            flowType: 'payment_method_update'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });

        } catch (flowError) {
          logStep("Payment method update flow failed, falling back to setup mode", { error: flowError });
          
          // Fallback to setup mode checkout
          const setupSession = await stripe.checkout.sessions.create({
            mode: 'setup',
            customer: profile.stripe_customer_id,
            payment_method_types: ['card'],
            success_url: `${finalReturnUrl}?setup=success`,
            cancel_url: `${finalReturnUrl}?setup=cancel`
          });

          logStep("Created setup mode checkout session", { 
            sessionId: setupSession.id,
            flowType: 'setup_mode'
          });

          return new Response(JSON.stringify({ 
            url: setupSession.url,
            flowType: 'setup_mode'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // Standard customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: finalReturnUrl,
    });

    logStep("Created standard customer portal session", { 
      sessionId: portalSession.id,
      flowType: 'standard_portal'
    });

    return new Response(JSON.stringify({ 
      url: portalSession.url,
      flowType: 'standard_portal'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof Error && 'code' in error ? error.code : 'UNKNOWN_ERROR';
    
    logStep("ERROR in customer-portal", { 
      message: errorMessage, 
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    // Provide user-friendly error messages
    let userFriendlyMessage = errorMessage;
    if (errorMessage.includes('Authentication error')) {
      userFriendlyMessage = "Authentication failed. Please sign out and sign in again.";
    } else if (errorMessage.includes('No subscription found') || errorMessage.includes('No Stripe customer found')) {
      userFriendlyMessage = "No subscription found. Please activate a subscription first.";
    } else if (errorMessage.includes('subscription account is no longer active')) {
      userFriendlyMessage = "Your subscription account needs to be restored. Please contact support.";
    } else if (!errorMessage.includes('Please')) {
      userFriendlyMessage = `Subscription management is temporarily unavailable: ${errorMessage}`;
    }
    
    return new Response(JSON.stringify({ 
      error: userFriendlyMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});