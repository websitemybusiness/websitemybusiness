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

    // Send notification email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["your-email@example.com"], // Replace with your email
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

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error("Failed to send email");
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

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
