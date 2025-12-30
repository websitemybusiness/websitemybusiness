import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// HTML escape function to prevent XSS in email content
function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Email validation regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation - allows digits, spaces, dashes, parentheses, and plus sign
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactEmailRequest = await req.json();

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      console.error("Invalid name input");
      return new Response(
        JSON.stringify({ error: "Invalid name. Must be 1-100 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email) || email.length > 255) {
      console.error("Invalid email input");
      return new Response(
        JSON.stringify({ error: "Invalid email address." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!phone || typeof phone !== "string" || !isValidPhone(phone)) {
      console.error("Invalid phone input");
      return new Response(
        JSON.stringify({ error: "Invalid phone number." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (message && (typeof message !== "string" || message.length > 2000)) {
      console.error("Invalid message input");
      return new Response(
        JSON.stringify({ error: "Message must be less than 2000 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting check using Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check for recent submissions from the same email (max 3 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recentSubmissions, error: rateLimitError } = await supabaseClient
      .from("contact_submissions")
      .select("created_at")
      .eq("email", email.toLowerCase().trim())
      .gte("created_at", oneHourAgo);

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (recentSubmissions && recentSubmissions.length >= 3) {
      console.warn("Rate limit exceeded for email:", email);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending contact notification email for:", escapeHtml(name), escapeHtml(email));

    // Escape all user input for HTML email
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeMessage = escapeHtml(message?.trim() || "No message provided");

    // Send notification email to business
    const notificationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["hello@websitemybusiness.com"],
        subject: `New Contact Form Submission from ${safeName}`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      }),
    });

    if (!notificationRes.ok) {
      const error = await notificationRes.text();
      console.error("Resend API error (notification):", error);
      throw new Error("Failed to send notification email");
    }

    const notificationData = await notificationRes.json();
    console.log("Notification email sent successfully:", notificationData);

    // Send confirmation email to submitter with branded design
    const confirmationRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Website My Business <onboarding@resend.dev>",
        to: [email.trim()],
        subject: "Thank you for contacting Website My Business!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with brand color -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); padding: 40px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Website My Business</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Professional Web Design & SEO Services</p>
                      </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Thank You, ${safeName}!</h2>
                        
                        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          We've received your message and truly appreciate you reaching out to us. Your inquiry is important to us, and our team is already on it.
                        </p>
                        
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          You can expect to hear back from us within <strong style="color: #7C3AED;">24-48 hours</strong>.
                        </p>
                        
                        <!-- Message box -->
                        <div style="background-color: #faf5ff; border-left: 4px solid #7C3AED; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                          <h3 style="margin: 0 0 12px 0; color: #7C3AED; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</h3>
                          <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${safeMessage}</p>
                        </div>
                        
                        <!-- Contact info box -->
                        <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-top: 24px;">
                          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Need immediate assistance?</h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #7C3AED; font-size: 18px;">📞</span>
                                <span style="color: #4b5563; font-size: 14px; margin-left: 12px;">Call us: <a href="tel:+2348032655092" style="color: #7C3AED; text-decoration: none; font-weight: 500;">+234 803 265 5092</a></span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #7C3AED; font-size: 18px;">💬</span>
                                <span style="color: #4b5563; font-size: 14px; margin-left: 12px;">WhatsApp: <a href="https://wa.me/2348027441364" style="color: #7C3AED; text-decoration: none; font-weight: 500;">+234 802 744 1364</a></span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #7C3AED; font-size: 18px;">✉️</span>
                                <span style="color: #4b5563; font-size: 14px; margin-left: 12px;">Email: <a href="mailto:hello@websitemybusiness.com" style="color: #7C3AED; text-decoration: none; font-weight: 500;">hello@websitemybusiness.com</a></span>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">Website My Business</p>
                        <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">Transforming your digital presence</p>
                        <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 Website My Business. All rights reserved.</p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    if (!confirmationRes.ok) {
      const error = await confirmationRes.text();
      console.error("Resend API error (confirmation):", error);
      // Don't throw - notification was sent, just log the error
    } else {
      const confirmationData = await confirmationRes.json();
      console.log("Confirmation email sent successfully:", confirmationData);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
