# Quick Start Guide - Smart Admission Portal

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **bun** (package manager)
- **Supabase account** (for database and Edge Functions)

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /Users/atharvpokale/Desktop/Smart-Admission-Portal

# Install dependencies (choose one)
npm install
# OR
yarn install
# OR
bun install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the project root (if it doesn't exist):

```bash
# Copy your existing .env or create a new one
# The .env file should contain:
VITE_SUPABASE_URL=https://xwduwxvywpkulumpvalr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=xwduwxvywpkulumpvalr
```

**Note:** Your `.env` file already exists with these values, so you can skip this step if it's already configured.

## Step 3: Run the Development Server

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:8080
# Open your browser and navigate to that URL
```

## Step 4: (Optional) Set Up Chatbot

If you want the AI chatbot to work:

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Deploy the Edge Function:**
   ```bash
   supabase login
   supabase link --project-ref xwduwxvywpkulumpvalr
   supabase functions deploy ai-chat
   ```

3. **Set up an AI provider:**
   ```bash
   # Choose one:
   supabase secrets set LOVABLE_API_KEY=your_key
   # OR
   supabase secrets set OPENAI_API_KEY=your_key
   # OR
   supabase secrets set ANTHROPIC_API_KEY=your_key
   
   # Then redeploy
   supabase functions deploy ai-chat
   ```

See `DEPLOY_CHATBOT.md` for detailed chatbot setup instructions.

## Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
Smart-Admission-Portal/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase integration
│   └── lib/              # Utility functions
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── .env                 # Environment variables (not in git)
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  port: 3000, // Change to any available port
}
```

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

1. Make sure `.env` file exists in the project root
2. Restart the development server after changing `.env`
3. Variables must start with `VITE_` to be accessible in the frontend

### Supabase Connection Issues

1. Verify your `.env` file has correct Supabase URL and key
2. Check that your Supabase project is active
3. Ensure your Supabase project has the required tables (run migrations if needed)

## Building for Production

```bash
# Build the project
npm run build

# The built files will be in the 'dist' directory
# You can deploy this to Vercel, Netlify, or any static hosting service
```

## Next Steps

- **Set up the database:** Run Supabase migrations if needed
- **Configure chatbot:** See `DEPLOY_CHATBOT.md`
- **Deploy:** See `vercel.json` for Vercel deployment configuration

## Need Help?

- Check `ENV_SETUP.md` for environment variable details
- Check `CHATBOT_TROUBLESHOOTING.md` for chatbot issues
- Check `DEPLOY_CHATBOT.md` for chatbot deployment
