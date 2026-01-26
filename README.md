# Smart Admission Portal

A modern, AI-powered student admission management system built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Your `.env` file should already exist with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:8080**

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Complete setup and running instructions
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration
- **[DEPLOY_CHATBOT.md](./DEPLOY_CHATBOT.md)** - AI Chatbot deployment guide
- **[CHATBOT_TROUBLESHOOTING.md](./CHATBOT_TROUBLESHOOTING.md)** - Chatbot troubleshooting

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** OpenAI / Anthropic Claude / Lovable AI Gateway
- **Routing:** React Router v6

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── integrations/  # Supabase client
└── lib/           # Utilities and helpers

supabase/
├── functions/     # Edge Functions (AI chatbot, email)
└── migrations/    # Database migrations
```

## 🔧 Features

- ✅ Student registration and application management
- ✅ Document upload and verification
- ✅ Real-time application status tracking
- ✅ Admin dashboard with analytics
- ✅ AI-powered chatbot assistant (SAM)
- ✅ Email notifications
- ✅ Responsive design with dark mode

## 🚢 Deployment

The project is configured for Vercel deployment. See `vercel.json` for configuration.

For Supabase Edge Functions:
```bash
supabase functions deploy ai-chat
supabase functions deploy send-status-email
```

## 📝 License

Hackathon project
