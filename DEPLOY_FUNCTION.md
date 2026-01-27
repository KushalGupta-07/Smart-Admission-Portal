# Deploy Edge Function - Quick Guide

The chatbot error shows the Edge Function is not deployed. Here are **3 ways** to fix it:

## Option 1: Using Supabase Dashboard (Easiest - No CLI needed)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `xwduwxvywpkulumpvalr`
3. Go to **Edge Functions** in the left sidebar
4. Click **Create a new function**
5. Name it: `ai-chat`
6. Copy the contents of `supabase/functions/ai-chat/index.ts`
7. Paste it into the function editor
8. Click **Deploy**

**Then set the API key:**
1. Go to **Edge Functions** → **Settings** → **Secrets**
2. Add a new secret:
   - Key: `LOVABLE_API_KEY`
   - Value: Your API key (get from https://lovable.dev)
3. Or use OpenAI:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Option 2: Install Supabase CLI (Recommended)

### On macOS:

```bash
# Update Command Line Tools first (if needed)
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# Then install Supabase CLI
brew install supabase/tap/supabase
```

### Or use npx (no installation needed):

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref xwduwxvywpkulumpvalr

# Deploy function
npx supabase functions deploy ai-chat

# Set API key
npx supabase secrets set LOVABLE_API_KEY=your_key_here

# Redeploy
npx supabase functions deploy ai-chat
```

## Option 3: Manual Deployment via API

If you have an access token, you can deploy via the Supabase Management API.

## Quick Test After Deployment

Test if the function is working:

```bash
curl -X GET "https://xwduwxvywpkulumpvalr.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

Should return: `{"status":"ok","providers":["lovable"],"configured":true}`

## Getting API Keys

### Lovable AI (Easiest):
1. Sign up at https://lovable.dev
2. Get API key from dashboard
3. Free tier available

### OpenAI:
1. Sign up at https://platform.openai.com
2. Add billing (required)
3. Create API key at https://platform.openai.com/api-keys

### Anthropic:
1. Sign up at https://console.anthropic.com
2. Create API key

## After Deployment

1. Refresh your browser
2. Try the chatbot again
3. Check browser console (F12) if there are still errors
