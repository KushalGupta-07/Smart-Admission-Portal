import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
      } 
    });
  }

  try {
    const { messages = [], type = "chat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not set in Supabase secrets");
      return new Response(JSON.stringify({ 
        error: "LOVABLE_API_KEY is not configured in Supabase secrets. Please run 'supabase secrets set LOVABLE_API_KEY=your_key'." 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
          "Content-Type": "application/json" 
        },
      });
    }

    // Context-aware system prompts based on type
    const systemPrompts: Record<string, string> = {
      chat: `You are SAM (Student Admission Manager), a friendly and knowledgeable AI assistant for the Student Admission Portal. 
You help students with:
- Application process questions (documents needed, deadlines, eligibility)
- Admission requirements and courses offered
- Fee structure and scholarship information
- Document verification guidance
- Status checking and next steps

Be concise, helpful, and empathetic. Use emojis sparingly to keep the tone friendly. 
If you don't know something specific, guide them to contact the admission office.
Current academic year: 2025-26.

Important info:
- Required documents: Photo, ID Proof (Aadhar/PAN), 10th Marksheet, 12th Marksheet
- Courses: B.Tech (CS, ECE, ME, CE), BBA, BCA, MBA, MCA, B.Com, BA
- Application fee: ₹500 (non-refundable)
- Deadline: Usually end of June`,

      insights: `You are an AI analyst providing insights on student applications. 
Analyze the provided application data and give actionable insights about:
- Application completion rates
- Common issues or bottlenecks
- Suggestions for improving the admission process
- Trends and patterns
Be data-driven and provide specific, actionable recommendations.`,

      verify: `You are a document verification assistant. 
Help verify if uploaded documents meet requirements:
- Photo: Clear passport-size photo, proper lighting
- ID Proof: Valid Aadhar Card or PAN Card, clearly visible
- Marksheets: Official documents with school/board seal
Provide helpful feedback on what needs improvement.`
    };

    const systemContent = systemPrompts[type] || systemPrompts.chat;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText };
      }

      return new Response(JSON.stringify({ 
        error: errorJson.error || `AI service returned ${response.status}` 
      }), {
        status: response.status === 401 ? 500 : response.status, // Don't pass through 401s as they confuse the client
        headers: { 
          ...corsHeaders, 
          "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
          "Content-Type": "application/json" 
        },
      });
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
        "Content-Type": "text/event-stream" 
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
        "Content-Type": "application/json" 
      },
    });
  }
});
