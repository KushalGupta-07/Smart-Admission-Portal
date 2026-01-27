# Fix Chatbot Error - Step by Step

The error message is clear: **"The Edge Function may not be deployed"**

## Quick Fix (Using npx - No Installation Needed)

Run these commands one by one:

### Step 1: Login to Supabase
```bash
cd /Users/atharvpokale/Desktop/Smart-Admission-Portal
npx supabase login
```
This will open a browser window for you to login.

### Step 2: Link Your Project
```bash
npx supabase link --project-ref xwduwxvywpkulumpvalr
```

### Step 3: Deploy the Function
```bash
npx supabase functions deploy ai-chat
```

### Step 4: Set Up an AI Provider

You need at least ONE API key. Choose the easiest:

**Option A: Lovable (Easiest - Free tier available)**
```bash
# Get key from https://lovable.dev, then:
npx supabase secrets set LOVABLE_API_KEY=your_key_here
```

**Option B: OpenAI**
```bash
# Get key from https://platform.openai.com/api-keys, then:
npx supabase secrets set OPENAI_API_KEY=your_key_here
```

### Step 5: Redeploy After Setting Secret
```bash
npx supabase functions deploy ai-chat
```

### Step 6: Test
1. Refresh your browser (http://localhost:8080)
2. Try the chatbot again
3. It should work now!

## Alternative: Use Supabase Dashboard

If the CLI doesn't work, use the web dashboard:

1. Go to https://app.supabase.com
2. Select project: `xwduwxvywpkulumpvalr`
3. Go to **Edge Functions** → **Create function**
4. Name: `ai-chat`
5. Copy code from `supabase/functions/ai-chat/index.ts`
6. Paste and click **Deploy**
7. Go to **Settings** → **Secrets** → Add `LOVABLE_API_KEY`

See `DEPLOY_FUNCTION.md` for more details.
