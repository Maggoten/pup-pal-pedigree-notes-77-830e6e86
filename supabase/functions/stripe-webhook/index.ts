import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("Stripe Secret Key");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("Stripe Secret Key is not set");
    
    // Initialize Supabase with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Verify webhook signature if secret is provided
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // Parse event without verification (for testing)
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification");
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabaseClient, subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabaseClient, subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handlePaymentSucceeded(supabaseClient, invoice);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handlePaymentFailed(supabaseClient, invoice);
        }
        break;
      }
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionChange(supabaseClient: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription change", { 
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer 
  });

  const subscriptionStatus = subscription.status;
  const hasPaid = subscription.status === 'active' && (!subscription.trial_end || subscription.trial_end * 1000 < Date.now());
  const trialEndDate = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

  const { error } = await supabaseClient
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscriptionStatus,
      has_paid: hasPaid,
      trial_end_date: trialEndDate,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    logStep("Error updating subscription", { error });
    throw error;
  }

  logStep("Successfully updated subscription status");
}

async function handleSubscriptionDeleted(supabaseClient: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription deletion", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer 
  });

  const { error } = await supabaseClient
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      has_paid: false,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    logStep("Error updating deleted subscription", { error });
    throw error;
  }

  logStep("Successfully updated deleted subscription status");
}

async function handlePaymentSucceeded(supabaseClient: any, invoice: Stripe.Invoice) {
  logStep("Handling payment success", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    customerId: invoice.customer 
  });

  // For successful payments, mark user as paid
  const { error } = await supabaseClient
    .from('profiles')
    .update({
      has_paid: true,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (error) {
    logStep("Error updating payment success", { error });
    throw error;
  }

  logStep("Successfully updated payment success status");
}

async function handlePaymentFailed(supabaseClient: any, invoice: Stripe.Invoice) {
  logStep("Handling payment failure", { 
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    customerId: invoice.customer 
  });

  const { error } = await supabaseClient
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (error) {
    logStep("Error updating payment failure", { error });
    throw error;
  }

  logStep("Successfully updated payment failure status");
}