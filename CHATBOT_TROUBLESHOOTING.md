# Chatbot Troubleshooting Guide

If the chatbot is showing an error message, follow these steps to diagnose and fix the issue.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. Look for error messages when you try to send a message
4. Common errors you might see:
   - `VITE_SUPABASE_URL is not set` - Missing environment variable
   - `404 Not Found` - Edge Function not deployed
   - `503 Service Unavailable` - No AI provider configured
   - `Network error` - Connection issue

### Step 2: Check Network Tab
1. In Developer Tools, go to the **Network** tab
2. Try sending a message
3. Look for a request to `/functions/v1/ai-chat`
4. Check the response status:
   - **200**: Function is working, check response body
   - **404**: Function not deployed
   - **503**: No AI provider configured
   - **500**: Function error (check Supabase logs)

### Step 3: Test Edge Function Directly

Test if the function is accessible:

```bash
# Replace with your Supabase URL and anon key
curl -X GET "https://your-project.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

Expected response:
```json
{
  "status": "ok",
  "providers": ["lovable"],
  "configured": true
}
```

If you get `"configured": false`, you need to set up an AI provider.

## Common Issues and Solutions

### Issue 1: "Missing Supabase configuration"

**Problem**: Frontend environment variables are not set.

**Solution**:
1. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
2. Restart your development server (`npm run dev`)

### Issue 2: "Edge Function not found" (404)

**Problem**: The Edge Function is not deployed to Supabase.

**Solution**:
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy ai-chat
```

### Issue 3: "No AI provider configured" (503)

**Problem**: No AI API keys are set in Supabase Edge Function secrets.

**Solution**:

**Option A: Using Supabase CLI**
```bash
# Set Lovable API key (recommended for quick start)
supabase secrets set LOVABLE_API_KEY=your_lovable_key

# OR set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_openai_key

# OR set Anthropic API key
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key
```

**Option B: Using Supabase Dashboard**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** → **Settings**
4. Add secrets:
   - Key: `LOVABLE_API_KEY`
   - Value: Your API key
5. Click **Save**

**After setting secrets, redeploy the function:**
```bash
supabase functions deploy ai-chat
```

### Issue 4: "Network error" or "Failed to fetch"

**Possible causes**:
1. **CORS issue**: Should be handled automatically, but check if you're using the correct Supabase URL
2. **Function not deployed**: Deploy the function (see Issue 2)
3. **Wrong URL**: Check that `VITE_SUPABASE_URL` is correct and doesn't have a trailing slash

**Solution**:
1. Verify your `.env` file has the correct Supabase URL
2. Make sure the URL format is: `https://xxxxx.supabase.co` (no trailing slash)
3. Redeploy the Edge Function

### Issue 5: "Authentication failed" (401/403)

**Problem**: The API key is invalid or expired.

**Solution**:
1. Verify your API key is correct
2. For OpenAI: Check your [OpenAI API keys](https://platform.openai.com/api-keys)
3. For Anthropic: Check your [Anthropic API keys](https://console.anthropic.com/)
4. For Lovable: Check your Lovable dashboard
5. Regenerate the key if needed and update it in Supabase secrets

### Issue 6: "Rate limited" (429)

**Problem**: You've exceeded the API rate limit.

**Solution**:
- The system will automatically try the next provider
- Wait a few minutes and try again
- Consider upgrading your API plan
- Add multiple providers for better reliability

### Issue 7: "Request timeout"

**Problem**: The AI service is taking too long to respond.

**Solution**:
- Try a shorter, more specific question
- Check your internet connection
- The system will retry automatically

## Testing the Setup

### Test 1: Check Environment Variables
```bash
# In your project root, check if .env exists
cat .env

# Should show:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Test 2: Check Edge Function Health
```bash
curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

### Test 3: Test with a Simple Message
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "type": "chat"
  }'
```

## Getting API Keys

### Lovable AI Gateway
1. Sign up at [lovable.dev](https://lovable.dev)
2. Get your API key from the dashboard

### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys** section
3. Create a new secret key
4. **Important**: Add billing information to use the API

### Anthropic Claude
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to **API Keys** section
3. Create a new API key

## Still Not Working?

1. **Check Supabase Function Logs**:
   ```bash
   supabase functions logs ai-chat
   ```

2. **Check Browser Console**: Look for detailed error messages

3. **Verify All Steps**:
   - ✅ `.env` file exists with correct values
   - ✅ Edge Function is deployed
   - ✅ At least one AI provider secret is set
   - ✅ Development server restarted after `.env` changes

4. **Common Mistakes**:
   - Forgetting to restart dev server after changing `.env`
   - Using service role key instead of anon key in frontend
   - Not deploying function after setting secrets
   - Wrong Supabase project URL

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Check Supabase function logs: `supabase functions logs ai-chat`
3. Verify your setup matches the steps above
4. Check the `ENV_SETUP.md` file for detailed configuration instructions
