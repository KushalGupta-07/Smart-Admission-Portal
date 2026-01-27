import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface AIProvider {
  name: string;
  url: string;
  getHeaders: (apiKey: string) => Record<string, string>;
  getBody: (systemContent: string, messages: any[]) => any;
  transformResponse?: (response: Response) => Response;
}

// AI Provider configurations
const getProviders = (): AIProvider[] => {
  const providers: AIProvider[] = [];
  
  // Provider 1: Lovable AI Gateway (Primary)
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    providers.push({
      name: "lovable",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      getHeaders: (apiKey: string) => ({
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }),
      getBody: (systemContent: string, messages: any[]) => ({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });
  }
  
  // Provider 2: OpenAI (Fallback 1)
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (openaiKey) {
    providers.push({
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      getHeaders: (apiKey: string) => ({
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }),
      getBody: (systemContent: string, messages: any[]) => ({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });
  }
  
  // Provider 3: Anthropic Claude (Fallback 2)
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (anthropicKey) {
    providers.push({
      name: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      getHeaders: (apiKey: string) => ({
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      }),
      getBody: (systemContent: string, messages: any[]) => ({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-3-haiku-20240307",
        system: systemContent,
        messages: messages.filter(m => m.role !== "system"),
        max_tokens: 4096,
        stream: true,
      }),
      transformResponse: async (response: Response) => {
        // Transform Anthropic SSE format to OpenAI-compatible format
        if (!response.body) {
          return response;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
          async start(controller) {
            let buffer = "";
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      
                      // Transform Anthropic format to OpenAI format
                      if (data.type === "content_block_delta" && data.delta?.text) {
                        const openaiFormat = {
                          choices: [{
                            delta: {
                              content: data.delta.text
                            }
                          }]
                        };
                        controller.enqueue(
                          encoder.encode(`data: ${JSON.stringify(openaiFormat)}\n\n`)
                        );
                      } else if (data.type === "message_stop") {
                        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
                  }
                }
              }
              
              if (buffer) {
                // Process remaining buffer
                if (buffer.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(buffer.slice(6));
                    if (data.type === "content_block_delta" && data.delta?.text) {
                      const openaiFormat = {
                        choices: [{
                          delta: {
                            content: data.delta.text
                          }
                        }]
                      };
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(openaiFormat)}\n\n`)
                      );
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
              
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          }
        });
        
        return new Response(stream, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            "Content-Type": "text/event-stream",
          },
        });
      },
    });
  }
  
  return providers;
};

const callAIProvider = async (
  provider: AIProvider,
  systemContent: string,
  messages: any[]
): Promise<Response> => {
  const apiKey = Deno.env.get(
    provider.name === "lovable" ? "LOVABLE_API_KEY" :
    provider.name === "openai" ? "OPENAI_API_KEY" :
    "ANTHROPIC_API_KEY"
  ) || "";
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: provider.getHeaders(apiKey),
      body: JSON.stringify(provider.getBody(systemContent, messages)),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (provider.transformResponse) {
      return provider.transformResponse(response);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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

  // Health check endpoint
  if (req.method === "GET") {
    const providers = getProviders();
    return new Response(
      JSON.stringify({ 
        status: "ok",
        providers: providers.map(p => p.name),
        configured: providers.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, type = "chat" } = requestBody;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const providers = getProviders();
    
    if (providers.length === 0) {
      console.error("No AI providers configured. Available env vars:", {
        hasLovable: !!Deno.env.get("LOVABLE_API_KEY"),
        hasOpenAI: !!Deno.env.get("OPENAI_API_KEY"),
        hasAnthropic: !!Deno.env.get("ANTHROPIC_API_KEY"),
      });
      
      return new Response(
        JSON.stringify({ 
          error: "No AI provider configured. Please set LOVABLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in Supabase Edge Function secrets.",
          hint: "Use 'supabase secrets set LOVABLE_API_KEY=your_key' to configure"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Try each provider in order until one succeeds
    let lastError: Error | null = null;
    
    for (const provider of providers) {
      try {
        console.log(`Attempting to use ${provider.name} provider`);
        
        const response = await callAIProvider(provider, systemContent, messages);
        
        if (response.ok) {
          console.log(`Successfully using ${provider.name} provider`);
          return new Response(response.body, {
            headers: { 
              ...corsHeaders, 
              "Content-Type": "text/event-stream",
              "X-AI-Provider": provider.name,
            },
          });
        }
        
        // Handle specific error statuses
        if (response.status === 429) {
          console.warn(`${provider.name} rate limited, trying next provider`);
          lastError = new Error("Rate limited");
          continue;
        }
        
        if (response.status === 401 || response.status === 403) {
          console.error(`${provider.name} authentication failed`);
          lastError = new Error("Authentication failed");
          continue;
        }
        
        // For other errors, try next provider
        const errorText = await response.text().catch(() => "Unknown error");
        console.warn(`${provider.name} failed with status ${response.status}: ${errorText}`);
        lastError = new Error(`Provider error: ${response.status}`);
        continue;
        
      } catch (error) {
        console.error(`${provider.name} provider error:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next provider
        continue;
      }
    }
    
    // All providers failed
    const errorMessage = lastError 
      ? `All AI providers failed. Last error: ${lastError.message}`
      : "All AI providers failed. Please try again later.";
    
    console.error("All AI providers exhausted:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: "AI service is currently unavailable. Please try again in a moment or contact support.",
        details: process.env.DENO_ENV === "development" ? errorMessage : undefined
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("AI chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred. Please try again.",
        details: process.env.DENO_ENV === "development" ? errorMessage : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
