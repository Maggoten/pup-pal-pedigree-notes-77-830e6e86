import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-REGISTRATION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Check environment variables with detailed logging
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const priceId = Deno.env.get("STRIPE_PRICE_ID");
    
    logStep("Environment check", { 
      hasStripeKey: !!stripeKey, 
      hasPriceId: !!priceId,
      priceIdValue: priceId ? `${priceId.substring(0, 8)}...` : 'undefined'
    });
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is missing");
      throw new Error("STRIPE_SECRET_KEY is not configured in Supabase secrets");
    }
    if (!priceId) {
      logStep("ERROR: STRIPE_PRICE_ID is missing");
      throw new Error("STRIPE_PRICE_ID is not configured in Supabase secrets");
    }
    
    logStep("Stripe credentials verified", { priceId: `${priceId.substring(0, 12)}...` });

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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create Stripe Checkout session for subscription with trial
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Prepare line items with both monthly and yearly options
    const lineItems = [
      {
        price: priceId, // Monthly plan
        quantity: 1,
      }
    ];
    
    // Add yearly option if available
    const yearlyPriceId = Deno.env.get("STRIPE_YEARLY_PRICE_ID");
    if (yearlyPriceId) {
      lineItems.push({
        price: yearlyPriceId,
        quantity: 1,
      });
      logStep("Added yearly pricing option", { yearlyPriceId: `${yearlyPriceId.substring(0, 12)}...` });
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          supabase_user_id: user.id
        }
      },
      success_url: `${origin}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/login?registration_cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        name: 'auto',
        address: 'auto'
      }
    });

    logStep("Created checkout session", { 
      sessionId: session.id, 
      url: session.url 
    });

    // Update user profile with customer ID
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    logStep("Updated user profile with customer ID");

    return new Response(JSON.stringify({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      customer_id: customerId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-registration-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});