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

function generateEmailTemplate(resetUrl: string): { subject: string; html: string } {
  const subject = 'Reset your password - Breeding Journey';
  const heading = 'Reset your password';
  const body = 'We received a request to reset the password for your Breeding Journey account. Click the button below to create a new password.';
  const buttonText = 'Reset Password';
  const securityNotice = 'If you didn\'t request this reset, you can safely ignore this email. Your account security is not affected.';
  const footer = 'Best regards,<br>The Breeding Journey Team';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: hsl(28, 12%, 23%); 
            margin: 0; 
            padding: 0; 
            background-color: hsl(30, 15%, 94%);
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 40px 20px; 
          }
          .email-card { 
            background: white; 
            border-radius: 16px; 
            padding: 48px; 
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); 
            text-align: center;
          }
          .logo { 
            margin-bottom: 32px; 
            font-size: 28px; 
            font-weight: bold; 
            color: hsl(118, 45%, 21%);
            font-family: 'Playfair Display', serif;
          }
          h1 { 
            color: hsl(28, 12%, 23%); 
            margin-bottom: 24px; 
            font-size: 32px;
            font-family: 'Playfair Display', serif;
            font-weight: 600;
          }
          .body-text { 
            color: hsl(28, 12%, 36%); 
            margin-bottom: 32px; 
            font-size: 16px;
            line-height: 1.7;
          }
          .reset-button { 
            display: inline-block; 
            background: hsl(118, 45%, 21%); 
            color: white; 
            text-decoration: none; 
            padding: 18px 36px; 
            border-radius: 12px; 
            font-weight: 600; 
            margin: 24px 0; 
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px hsla(118, 45%, 21%, 0.3);
          }
          .reset-button:hover { 
            background: hsl(118, 45%, 25%); 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px hsla(118, 45%, 21%, 0.4);
          }
          .security-notice { 
            background-color: hsl(33, 15%, 91%); 
            border-left: 4px solid hsl(18, 48%, 44%); 
            padding: 20px; 
            margin: 32px 0; 
            border-radius: 0 12px 12px 0; 
            font-size: 14px; 
            color: hsl(28, 12%, 23%);
            text-align: left;
          }
          .footer { 
            color: hsl(28, 12%, 50%); 
            font-size: 14px; 
            margin-top: 32px; 
            border-top: 1px solid hsl(33, 15%, 86%); 
            padding-top: 24px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="logo">Breeding Journey</div>
            <h1>${heading}</h1>
            <p class="body-text">${body}</p>
            
            <a href="${resetUrl}" class="reset-button">${buttonText}</a>
            
            <div class="security-notice">
              <strong>🔒 Security Notice:</strong><br>
              ${securityNotice}
            </div>
            
            <div class="footer">
              ${footer}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
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
          error: 'Invalid or expired reset link' 
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
          error: 'Could not update password' 
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
        message: 'Password has been updated successfully' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
      
    } else if (requestBody.email) {
      // Handle password reset email sending
      const { email }: PasswordResetRequest = requestBody;
      console.log('Sending password reset for email:', email);

      // Check if user exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();
      
      if (profileError || !profileData) {
        console.log('User not found for email:', email);
        // Return success even if user doesn't exist (security best practice)
        return new Response(JSON.stringify({ success: true, message: 'If the email address exists in our system, a password reset email has been sent.' }), {
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
          user_id: profileData.id,
          email: email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        console.error('Error saving reset token:', tokenError);
        throw new Error('Could not create reset token');
      }

      // Create reset URL - get the app origin from referrer header or default to breedingjourney.com
      let appOrigin = 'https://breedingjourney.com'; // Default fallback
      
      // Try to get the origin from the Referer header (when called from the frontend)
      const refererHeader = req.headers.get('referer');
      if (refererHeader) {
        try {
          const refererUrl = new URL(refererHeader);
          appOrigin = refererUrl.origin;
        } catch (e) {
          console.log('Could not parse referer header:', refererHeader);
        }
      }
      
      const resetUrl = `${appOrigin}/reset-password?token=${resetToken}`;
      
      // Generate email template
      const { subject, html } = generateEmailTemplate(resetUrl);

      // Send email with Resend
      const emailResponse = await resend.emails.send({
        from: "Breeding Journey <noreply@breedingjourney.com>",
        to: [email],
        subject: subject,
        html: html,
      });

      console.log("Password reset email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'If the email address exists in our system, a password reset email has been sent.' 
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
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);