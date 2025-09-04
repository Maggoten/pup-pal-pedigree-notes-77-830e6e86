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

interface EmailTemplates {
  sv: {
    subject: string;
    heading: string;
    body: string;
    buttonText: string;
    securityNotice: string;
    footer: string;
  };
  en: {
    subject: string;
    heading: string;
    body: string;
    buttonText: string;
    securityNotice: string;
    footer: string;
  };
}

const emailTemplates: EmailTemplates = {
  sv: {
    subject: 'Återställ ditt lösenord - Breeding Journey',
    heading: 'Återställ ditt lösenord',
    body: 'Vi fick en begäran att återställa lösenordet för ditt Breeding Journey-konto. Klicka på knappen nedan för att skapa ett nytt lösenord.',
    buttonText: 'Återställ lösenord',
    securityNotice: 'Om du inte begärde denna återställning kan du ignorera detta e-postmeddelande. Din kontosäkerhet påverkas inte.',
    footer: 'Med vänliga hälsningar,<br>Breeding Journey-teamet'
  },
  en: {
    subject: 'Reset your password - Breeding Journey',
    heading: 'Reset your password',
    body: 'We received a request to reset the password for your Breeding Journey account. Click the button below to create a new password.',
    buttonText: 'Reset Password',
    securityNotice: 'If you didn\'t request this reset, you can safely ignore this email. Your account security is not affected.',
    footer: 'Best regards,<br>The Breeding Journey Team'
  }
}

function generateEmailTemplate(resetUrl: string, language: 'sv' | 'en' = 'sv'): { subject: string; html: string } {
  const template = emailTemplates[language];
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 40px 20px; 
          }
          .email-card { 
            background: white; 
            border-radius: 12px; 
            padding: 40px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            text-align: center;
          }
          .logo { 
            margin-bottom: 30px; 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
          }
          h1 { 
            color: #1f2937; 
            margin-bottom: 20px; 
            font-size: 28px; 
          }
          .body-text { 
            color: #6b7280; 
            margin-bottom: 30px; 
            font-size: 16px; 
          }
          .reset-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #2563eb, #3b82f6); 
            color: white; 
            text-decoration: none; 
            padding: 16px 32px; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .reset-button:hover { 
            background: linear-gradient(135deg, #1d4ed8, #2563eb); 
            transform: translateY(-2px);
          }
          .security-notice { 
            background-color: #f3f4f6; 
            border-left: 4px solid #10b981; 
            padding: 15px; 
            margin: 30px 0; 
            border-radius: 0 8px 8px 0; 
            font-size: 14px; 
            color: #374151; 
          }
          .footer { 
            color: #9ca3af; 
            font-size: 14px; 
            margin-top: 30px; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="logo">Breeding Journey</div>
            <h1>${template.heading}</h1>
            <p class="body-text">${template.body}</p>
            
            <a href="${resetUrl}" class="reset-button">${template.buttonText}</a>
            
            <div class="security-notice">
              <strong>🔒 Säkerhetsmeddelande / Security Notice:</strong><br>
              ${template.securityNotice}
            </div>
            
            <div class="footer">
              ${template.footer}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject: template.subject, html };
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

      // Check if user exists in profiles table and get language preference
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, language')
        .eq('email', email)
        .single();
      
      if (profileError || !profileData) {
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
          user_id: profileData.id,
          email: email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        console.error('Error saving reset token:', tokenError);
        throw new Error('Kunde inte skapa återställningstoken');
      }

      // Create reset URL - get the app origin from referrer header or default to lovable app
      let appOrigin = 'https://your-app-url.lovable.app'; // Default fallback
      
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
      
      // Get user's language preference, default to Swedish
      const userLanguage = (profileData.language as 'sv' | 'en') || 'sv';
      
      // Generate email template in user's preferred language
      const { subject, html } = generateEmailTemplate(resetUrl, userLanguage);

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