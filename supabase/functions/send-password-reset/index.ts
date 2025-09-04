import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

interface ValidateTokenRequest {
  token: string;
  newPassword: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Generate secure random token
const generateResetToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Password reset request received:', req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Check if this is a token validation request (has token and newPassword)
    if (requestBody.token && requestBody.newPassword) {
      // Handle token validation and password update
      const { token, newPassword }: ValidateTokenRequest = requestBody;
      console.log('Validating reset token and updating password');

      // Validate token
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        console.log('Invalid or expired token:', token);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Ogiltig eller utgången återställningslänk' 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Update user password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tokenData.user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Kunde inte uppdatera lösenordet' 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      console.log('Password updated successfully for user:', tokenData.user_id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Lösenordet har uppdaterats framgångsrikt' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
      
    } else if (requestBody.email) {
      // Handle password reset email sending
      const { email }: PasswordResetRequest = requestBody;
      console.log('Sending password reset for email:', email);

      // Check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError || !userData.user) {
        console.log('User not found for email:', email);
        // Return success even if user doesn't exist (security best practice)
        return new Response(JSON.stringify({ success: true, message: 'Om emailadressen finns i vårt system har ett återställningsmejl skickats.' }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Save reset token to database
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: userData.user.id,
          email: email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        console.error('Error saving reset token:', tokenError);
        throw new Error('Kunde inte skapa återställningstoken');
      }

      // Create reset URL - use the request origin
      const url = new URL(req.url);
      const resetUrl = `${url.origin}/reset-password?token=${resetToken}`;

      // Send email with Resend
      const emailResponse = await resend.emails.send({
        from: "Breeding Journey <noreply@breedingjourney.com>",
        to: [email],
        subject: "Återställ ditt lösenord - Breeding Journey",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 1.5rem;">Breeding Journey</h1>
            </div>
            
            <div style="background: white; padding: 2rem; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin-bottom: 1rem;">Återställ ditt lösenord</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 1.5rem;">
                Vi har mottagit en begäran om att återställa lösenordet för ditt konto. 
                Klicka på knappen nedan för att skapa ett nytt lösenord.
              </p>
              
              <div style="text-align: center; margin: 2rem 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: 500;">
                  Återställ lösenord
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
                Om du inte kan klicka på knappen, kopiera och klistra in följande länk i din webbläsare:<br>
                <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <div style="background: #f9fafb; padding: 1rem; border-radius: 6px; margin-top: 1.5rem;">
                <p style="color: #6b7280; font-size: 0.875rem; margin: 0;">
                  <strong>Viktig information:</strong><br>
                  • Denna länk är giltig i 1 timme<br>
                  • Om du inte begärde denna återställning kan du ignorera detta mejl<br>
                  • Ditt nuvarande lösenord förblir oförändrat tills du skapar ett nytt
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 1rem; color: #9ca3af; font-size: 0.75rem;">
              © 2024 Breeding Journey. Alla rättigheter förbehållna.
            </div>
          </div>
        `,
      });

      console.log("Password reset email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Om emailadressen finns i vårt system har ett återställningsmejl skickats.' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
      
    } else {
      // Invalid request
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid request. Either email or token+newPassword required.' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in password reset function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Ett oväntat fel uppstod' 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);