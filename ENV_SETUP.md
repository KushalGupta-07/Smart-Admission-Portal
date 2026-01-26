# Environment Variables Setup Guide

This document describes the environment variables required for the Smart Admission Portal chatbot functionality.

## Frontend Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

## Backend Environment Variables (Supabase Edge Functions)

Set these in your Supabase project's Edge Function secrets:

### Option 1: Lovable AI Gateway (Primary - Recommended)

```bash
LOVABLE_API_KEY=your_lovable_api_key
```

**How to get:**
- Sign up at [Lovable.dev](https://lovable.dev)
- Get your API key from the dashboard

### Option 2: OpenAI (Fallback 1)

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```

**How to get:**
- Sign up at [OpenAI Platform](https://platform.openai.com)
- Go to **API Keys** section
- Create a new secret key

**Supported Models:**
- `gpt-3.5-turbo` (default, cost-effective)
- `gpt-4` (more capable, higher cost)
- `gpt-4-turbo-preview` (latest GPT-4)

### Option 3: Anthropic Claude (Fallback 2)

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-haiku-20240307  # Optional, defaults to claude-3-haiku-20240307
```

**How to get:**
- Sign up at [Anthropic Console](https://console.anthropic.com)
- Go to **API Keys** section
- Create a new API key

**Supported Models:**
- `claude-3-haiku-20240307` (default, fastest and most cost-effective)
- `claude-3-sonnet-20240229` (balanced)
- `claude-3-opus-20240229` (most capable)

## Setting Environment Variables in Supabase

### Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set LOVABLE_API_KEY=your_key_here
supabase secrets set OPENAI_API_KEY=your_key_here  # Optional
supabase secrets set ANTHROPIC_API_KEY=your_key_here  # Optional
```

### Using Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** → **Settings**
4. Add secrets in the **Secrets** section

## Provider Priority

The chatbot will try providers in this order:

1. **Lovable AI Gateway** (if `LOVABLE_API_KEY` is set)
2. **OpenAI** (if `OPENAI_API_KEY` is set)
3. **Anthropic Claude** (if `ANTHROPIC_API_KEY` is set)

If a provider fails (rate limit, error, etc.), it automatically falls back to the next available provider.

## Minimum Configuration

**At least one** AI provider must be configured. We recommend starting with:

- `LOVABLE_API_KEY` (easiest setup, good for development)
- Or `OPENAI_API_KEY` (widely used, reliable)

## Testing Your Configuration

After setting up environment variables:

1. Start your development server: `npm run dev`
2. Open the chatbot in your application
3. Send a test message
4. Check the browser console and Supabase Edge Function logs for any errors

## Troubleshooting

### "No AI provider configured" Error

- Ensure at least one of `LOVABLE_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` is set
- Verify secrets are set in Supabase Edge Functions (not just local `.env`)
- Redeploy Edge Functions after setting secrets: `supabase functions deploy ai-chat`

### "Authentication failed" Error

- Verify your API key is correct
- Check that the API key has proper permissions
- For OpenAI: Ensure you have credits/billing set up
- For Anthropic: Verify your account is active

### "Rate limited" Error

- The system will automatically retry with the next provider
- Consider adding multiple providers for better reliability
- Check your API usage limits

### Timeout Errors

- Default timeout is 30 seconds
- Try shorter, more specific questions
- Check your network connection

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use Supabase Secrets** for Edge Function environment variables (not `.env`)
3. **Rotate API keys** regularly
4. **Use separate keys** for development and production
5. **Monitor API usage** to prevent unexpected costs

## Cost Considerations

- **Lovable AI Gateway**: Check their pricing
- **OpenAI GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **OpenAI GPT-4**: ~$0.03 per 1K tokens (more expensive)
- **Anthropic Claude Haiku**: ~$0.25 per 1M tokens (very affordable)
- **Anthropic Claude Opus**: ~$15 per 1M tokens (premium)

For a student admission portal, GPT-3.5-turbo or Claude Haiku should be sufficient and cost-effective.
