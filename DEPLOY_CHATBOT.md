# Quick Chatbot Deployment Guide

## Step 1: Deploy the Edge Function

```bash
# Make sure you're in the project directory
cd /Users/atharvpokale/Desktop/Smart-Admission-Portal

# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase (if not already logged in)
supabase login

# Link your project (use your project ref from .env)
supabase link --project-ref xwduwxvywpkulumpvalr

# Deploy the ai-chat function
supabase functions deploy ai-chat
```

## Step 2: Set Up an AI Provider

You need at least ONE of these API keys. Choose the easiest option:

### Option A: Lovable AI (Easiest - Recommended for Testing)

1. Sign up at https://lovable.dev (free tier available)
2. Get your API key from the dashboard
3. Set it:

```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_key_here
```

### Option B: OpenAI (Most Common)

1. Sign up at https://platform.openai.com
2. Add billing (required for API access)
3. Create an API key at https://platform.openai.com/api-keys
4. Set it:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_key_here
```

### Option C: Anthropic Claude

1. Sign up at https://console.anthropic.com
2. Create an API key
3. Set it:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Step 3: Redeploy After Setting Secrets

```bash
supabase functions deploy ai-chat
```

## Step 4: Test the Function

```bash
# Test if function is accessible
curl -X GET "https://xwduwxvywpkulumpvalr.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"

# Should return:
# {"status":"ok","providers":["lovable"],"configured":true}
```

## Step 5: Test in Browser

1. Start your dev server: `npm run dev`
2. Open the chatbot
3. Send a test message
4. Check browser console (F12) for detailed error messages

## Troubleshooting

### "Edge Function not found (404)"
- The function is not deployed
- Run: `supabase functions deploy ai-chat`

### "AI service unavailable: No AI provider configured"
- No API keys are set
- Set at least one: `supabase secrets set LOVABLE_API_KEY=your_key`
- Then redeploy: `supabase functions deploy ai-chat`

### "Network error: Cannot connect to the server"
- Function might not be deployed
- Check your Supabase URL in `.env`
- Make sure the URL is correct (no trailing slash)

### Function deployed but still not working
1. Check function logs:
   ```bash
   supabase functions logs ai-chat
   ```
2. Check browser console for specific errors
3. Verify secrets are set:
   ```bash
   supabase secrets list
   ```

## Quick Commands Reference

```bash
# Deploy function
supabase functions deploy ai-chat

# View logs
supabase functions logs ai-chat

# List secrets
supabase secrets list

# Set secret
supabase secrets set LOVABLE_API_KEY=your_key

# Test function health
curl -X GET "https://xwduwxvywpkulumpvalr.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```
