import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StatusEmailRequest {
  studentEmail: string;
  studentName: string;
  applicationNumber: string;
  courseName: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  admitCardNumber?: string;
  remarks?: string;
}

const getStatusDetails = (status: string) => {
  switch (status) {
    case "submitted":
      return {
        subject: "Application Submitted Successfully",
        title: "Your Application Has Been Submitted",
        message: "Thank you for submitting your application. Our team will review it shortly.",
        color: "#3b82f6",
      };
    case "under_review":
      return {
        subject: "Application Under Review",
        title: "Your Application is Under Review",
        message: "Your application is currently being reviewed by our admissions team. We will notify you once a decision has been made.",
        color: "#f59e0b",
      };
    case "approved":
      return {
        subject: "Congratulations! Application Approved",
        title: "Your Application Has Been Approved!",
        message: "We are pleased to inform you that your application has been approved. Your admit card has been generated and is available for download in your dashboard.",
        color: "#10b981",
      };
    case "rejected":
      return {
        subject: "Application Status Update",
        title: "Application Decision",
        message: "After careful review, we regret to inform you that your application has not been approved at this time.",
        color: "#ef4444",
      };
    default:
      return {
        subject: "Application Status Update",
        title: "Application Status Update",
        message: "Your application status has been updated.",
        color: "#6b7280",
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check RESEND_API_KEY first
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has admin role
    const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError) {
      console.error("Role check error:", roleError.message);
      return new Response(JSON.stringify({ error: "Failed to verify admin role" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    const {
      studentEmail,
      studentName,
      applicationNumber,
      courseName,
      status,
      admitCardNumber,
      remarks,
    }: StatusEmailRequest = body;

    console.log(`Processing ${status} email for application ${applicationNumber} to ${studentEmail}`);
    console.log("Request body:", JSON.stringify(body));

    // Validate required fields
    if (!studentEmail) {
      console.error("Missing studentEmail in request");
      return new Response(JSON.stringify({ error: "Student email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!applicationNumber || !courseName || !status) {
      console.error("Missing required fields:", { applicationNumber, courseName, status });
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const statusDetails = getStatusDetails(status);
    const currentDateTime = new Date().toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background-color: ${statusDetails.color}; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${statusDetails.title}</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Dear <strong>${studentName || "Student"}</strong>,
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  ${statusDetails.message}
                </p>
                
                <!-- Application Details -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Application Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Application Number:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${applicationNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Course Applied:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${courseName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
                      <td style="padding: 8px 0;">
                        <span style="background-color: ${statusDetails.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                          ${status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time:</td>
                      <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${currentDateTime}</td>
                    </tr>
                    ${
                      admitCardNumber
                        ? `<tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Admit Card Number:</td>
                            <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 700;">${admitCardNumber}</td>
                          </tr>`
                        : ""
                    }
                  </table>
                </div>
                
                ${
                  remarks
                    ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Remarks from Admin:</h4>
                        <p style="color: #78350f; margin: 0; font-size: 14px;">${remarks}</p>
                      </div>`
                    : ""
                }
                
                ${
                  status === "approved"
                    ? `<div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                        <p style="color: #065f46; font-size: 16px; margin: 0;">
                          🎉 Please login to your dashboard to download your admit card.
                        </p>
                      </div>`
                    : ""
                }
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                  If you have any questions, please don't hesitate to contact our admissions office.
                </p>
                
                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br>
                  <strong>Admissions Office</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This is an automated email. Please do not reply directly to this message.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`Sending email to ${studentEmail} with subject: ${statusDetails.subject}`);

    const emailPayload = {
      from: "Admissions <noreply@contact.xeroxify.xyz>",
      to: [studentEmail],
      subject: statusDetails.subject,
      html: emailHtml,
    };
    
    console.log("Email payload:", JSON.stringify({ ...emailPayload, html: "[HTML content]" }));

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResult = await emailResponse.json();
    console.log(`Resend API response (${emailResponse.status}):`, JSON.stringify(emailResult));
    
    if (!emailResponse.ok) {
      console.error(`Email send failed: ${JSON.stringify(emailResult)}`);
      // Return more specific error message
      const errorMsg = emailResult.message || emailResult.error?.message || "Unknown error";
      return new Response(JSON.stringify({ 
        error: `Failed to send email: ${errorMsg}`,
        details: emailResult 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Email sent successfully for application ${applicationNumber}, ID: ${emailResult.id}`);

    return new Response(JSON.stringify({ success: true, id: emailResult.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Email function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
