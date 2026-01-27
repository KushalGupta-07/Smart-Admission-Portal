import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Sparkles, Minus, ChevronDown, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

const getChatUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("VITE_SUPABASE_URL is not set");
    return "";
  }
  // Ensure URL doesn't have trailing slash
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/functions/v1/ai-chat`;
};

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const quickActions = [{
  label: "📋 Required Documents",
  message: "What documents do I need for admission?"
}, {
  label: "📅 Application Deadline",
  message: "When is the application deadline?"
}, {
  label: "💰 Fee Structure",
  message: "What is the fee structure for courses?"
}, {
  label: "🎓 Courses Offered",
  message: "What courses are available for admission?"
}];

const initialMessage: Message = {
  role: "assistant",
  content: "👋 Hi! I'm SAM, your Student Admission Manager. How can I help you today? Feel free to ask about admissions, documents, deadlines, or anything else!"
};
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);
  const shouldPreserveState = useRef(false);
  const handleClearChat = useCallback(() => {
    setMessages([initialMessage]);
    setIsQuickActionsCollapsed(false);
  }, []);
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      const element = viewport || scrollAreaRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear chat history when reopening
  useEffect(() => {
    if (isOpen) {
      if (!shouldPreserveState.current) {
        handleClearChat();
      }
      shouldPreserveState.current = false;
    }
  }, [isOpen, handleClearChat]);
  const getAuthToken = async (): Promise<string> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
      // Fallback to anon key if no session
      return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    } catch (error) {
      console.warn("Failed to get session token, using anon key:", error);
      return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    }
  };

  const sendMessage = async (messageText: string, retryCount = 0): Promise<void> => {
    if (!messageText.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: "user",
      content: messageText.trim()
    };
    
    // Instantly render user message
    setIsQuickActionsCollapsed(true);
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder immediately for better UX
    let assistantMessageId = messages.length + 1;
    let assistantContent = "";
    let hasReceivedFirstChunk = false;

    const updateAssistant = (chunk: string) => {
      if (!hasReceivedFirstChunk && chunk) {
        hasReceivedFirstChunk = true;
      }
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.error) {
          return prev.map((m, i) => 
            i === prev.length - 1 
              ? { ...m, content: assistantContent }
              : m
          );
        }
        return [...prev, {
          role: "assistant",
          content: assistantContent
        }];
      });
    };

    const createTimeoutPromise = (): Promise<never> => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timeout. Please try again."));
        }, REQUEST_TIMEOUT);
      });
    };

    try {
      // Validate environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file."
        );
      }

      const chatUrl = getChatUrl();
      if (!chatUrl) {
        throw new Error("Failed to construct chat URL");
      }

      console.log("Calling AI chat function:", chatUrl);
      console.log("Request payload:", {
        messageCount: messages.length + 1,
        type: "chat"
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // Use Supabase's function invoke for better error handling, but we need streaming
      // So we'll use fetch but with better error handling
      const authToken = await getAuthToken();
      
      const requestPromise = fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "apikey": supabaseKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-10), // Keep last 10 messages for context
          type: "chat"
        })
      }).catch((fetchError) => {
        console.error("Fetch error details:", {
          message: fetchError.message,
          name: fetchError.name,
          cause: fetchError.cause
        });
        
        // Provide more specific error messages
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout. The server took too long to respond.");
        } else if (fetchError.message.includes("Failed to fetch") || fetchError.message.includes("NetworkError")) {
          throw new Error("Network error: Cannot connect to the server. The Edge Function may not be deployed. Run: supabase functions deploy ai-chat");
        } else {
          throw new Error(`Network error: ${fetchError.message}`);
        }
      });

      const resp = await Promise.race([requestPromise, createTimeoutPromise()]);
      clearTimeout(timeoutId);
      
      console.log("Response status:", resp.status, resp.statusText);
      
      if (!resp.ok) {
        // Try to get error details from response
        let errorDetails = "";
        let errorData: any = null;
        
        try {
          errorData = await resp.clone().json();
          errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
          console.error("Error response:", errorData);
        } catch {
          try {
            errorDetails = await resp.clone().text();
            console.error("Error response (text):", errorDetails);
          } catch {
            errorDetails = `${resp.status} ${resp.statusText}`;
          }
        }
        
        // Provide specific error messages based on status code
        if (resp.status === 404) {
          throw new Error("Edge Function not found (404). Deploy it with: supabase functions deploy ai-chat");
        } else if (resp.status === 503) {
          throw new Error(`AI service unavailable: ${errorDetails || "No AI provider configured. Set LOVABLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY"}`);
        } else if (resp.status === 401 || resp.status === 403) {
          throw new Error(`Authentication failed (${resp.status}). Check your Supabase credentials.`);
        } else {
          throw new Error(`Server error (${resp.status}): ${errorDetails || resp.statusText}`);
        }
        let errorMessage = "Failed to get response";
        try {
          const error = await resp.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          const text = await resp.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (!resp.ok) {
        let errorMessage = "Failed to get response";
        try {
          const errorData = await resp.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${resp.status} ${resp.statusText}`;
        }

        // Retry on certain errors
        if ((resp.status === 429 || resp.status >= 500) && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return sendMessage(messageText, retryCount + 1);
        }

        throw new Error(errorMessage);
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let isStreamComplete = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            isStreamComplete = true;
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            // Remove carriage return if present
            if (line.endsWith("\r")) {
              line = line.slice(0, -1);
            }
            
            // Skip empty lines and comments
            if (line.trim() === "" || line.startsWith(":")) {
              continue;
            }
            
            // Process SSE data lines
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              
              if (jsonStr === "[DONE]") {
                isStreamComplete = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(jsonStr);
                
                // Handle OpenAI-compatible format
                const content = parsed.choices?.[0]?.delta?.content || 
                               parsed.choices?.[0]?.message?.content ||
                               parsed.content;
                
                if (content) {
                  updateAssistant(content);
                }
              } catch (parseError) {
                // If JSON parsing fails, might be incomplete - keep in buffer
                console.warn("Failed to parse SSE data:", jsonStr);
              }
            }
          }
          
          if (isStreamComplete) {
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Ensure we have content even if stream ended early
      if (!hasReceivedFirstChunk && assistantContent === "") {
        throw new Error("No response received from AI service");
      }

    } catch (error) {
      console.error("Chat error:", error);
      
      // Remove the assistant message if it was created but has no content
      if (!hasReceivedFirstChunk) {
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[prev.length - 1]?.role !== "assistant"));
      }

      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";

      // Provide helpful error messages based on error type
      let userFriendlyMessage = "";
      
      if (errorMessage.includes("Missing Supabase configuration")) {
        userFriendlyMessage = "⚠️ Configuration error: Please check your environment variables.";
      } else if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
        userFriendlyMessage = "⏱️ The request took too long. Please try again with a shorter question.";
      } else if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
        userFriendlyMessage = "🌐 Network error. Please check your connection and try again. If the problem persists, the Edge Function may not be deployed.";
      } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        userFriendlyMessage = "🔧 Edge Function not found. Please ensure the 'ai-chat' function is deployed to Supabase.";
      } else if (errorMessage.includes("503") || errorMessage.includes("unavailable")) {
        userFriendlyMessage = "⚠️ AI service is temporarily unavailable. Please try again in a moment.";
      } else if (errorMessage.includes("No AI provider configured")) {
        userFriendlyMessage = "⚙️ AI service not configured. Please set up an AI provider API key in Supabase Edge Function secrets.";
      } else {
        // Show the actual error in development, user-friendly message in production
        const isDev = import.meta.env.DEV;
        userFriendlyMessage = isDev 
          ? `Error: ${errorMessage}. Check console for details.`
          : `Sorry, I'm having trouble right now. Please try again or contact our admission office directly. 📞`;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: userFriendlyMessage,
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  return <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && <motion.div initial={{
        scale: 0,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0,
        opacity: 0
      }} className="fixed bottom-6 right-6 z-50">
            <Button onClick={() => setIsOpen(true)} size="lg" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-110 transition-all duration-300" aria-label="Open AI Assistant">
              <MessageCircle className="h-8 w-8" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary items-center justify-center">
                  <Sparkles className="h-5 w-5 rounded-full transition-all bg-primary text-[#ff3300]" />
                </span>
              </span>
            </Button>
          </motion.div>}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} transition={{
        type: "spring",
        damping: 25,
        stiffness: 300
      }} className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]">
            <RemoveScroll forwardProps>
            <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 overflow-hidden rounded-2xl ring-1 ring-black/5">
              <CardHeader className="bg-primary text-primary-foreground py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">SAM Assistant</CardTitle>
                      <p className="text-xs opacity-80">AI-Powered Help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => {
                    shouldPreserveState.current = true;
                    setIsOpen(false);
                  }} aria-label="Minimize chat">
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={handleClearChat} aria-label="Clear chat history">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)} aria-label="Close chat">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[450px]">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        {message.role === "assistant" && <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-secondary" />
                          </div>}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : message.error ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                          {message.error && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Error</span>
                            </div>
                          )}
                          {message.content}
                        </div>
                        {message.role === "user" && <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>}
                      </motion.div>)}
                    {isLoading && messages[messages.length - 1]?.role === "user" && <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} className="flex gap-2 justify-start">
                        <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1 h-2 items-center">
                            <motion.div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                            <motion.div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                            <motion.div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                          </div>
                        </div>
                      </motion.div>}
                  </div>
                </ScrollArea>

                {/* Sticky Quick Actions */}
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 transition-all duration-300">
                  <div 
                    className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
                  >
                    <p className="text-xs font-medium text-muted-foreground">Quick actions</p>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${!isQuickActionsCollapsed ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence initial={false}>
                    {!isQuickActionsCollapsed && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-3 pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {quickActions.map((action, index) => <Button key={index} variant="secondary" size="sm" className="text-xs h-7 px-3 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border-0 transition-colors" onClick={() => sendMessage(action.message)} disabled={isLoading}>
                              {action.label}
                            </Button>)}
                        </div>
                      </div>
                    </motion.div>}
                  </AnimatePresence>
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t bg-background">
                  <div className="flex gap-2">
                    <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1" disabled={isLoading} aria-label="Chat message input" />
                    <Button type="submit" size="icon" disabled={!input.trim() || isLoading} aria-label="Send message">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </RemoveScroll>
          </motion.div>}
      </AnimatePresence>
    </>;
}