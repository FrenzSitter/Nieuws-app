# Vercel Environment Variables Configuration

## 🔧 Environment Variables to Add in Vercel Dashboard

Ga naar https://vercel.com/FrenzSitter/nieuws-app/settings/environment-variables en voeg de volgende variabelen toe:

### Production Environment Variables

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lstcnbrikiqbjbhdnqor.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzdg...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzdg...` | Production, Preview |
| `DATABASE_URL` | `postgresql://postgres:NieuwsApp2025!SecureDB#@db.lstcnbrikiqbjbhdnqor.supabase.co:5432/postgres` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://nieuws-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://nieuws-app-git-main-frenzsitter.vercel.app` | Preview |
| `NODE_ENV` | `production` | Production |
| `RSS_FETCH_INTERVAL` | `3600000` | Production, Preview, Development |
| `MAX_ARTICLES_PER_FETCH` | `50` | Production, Preview, Development |

### Development Environment Variables

Voor development (lokaal):
| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |
| `NODE_ENV` | `development` | Development |

## 🚀 After Setting Environment Variables

1. **Trigger New Deployment**:
   - Go to https://vercel.com/FrenzSitter/nieuws-app
   - Click "Redeploy" to use the new environment variables

2. **Verify Deployment**:
   - Check https://nieuws-app.vercel.app
   - Ensure no build errors
   - Test basic functionality

## 🔒 Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe for client-side
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- ⚠️ `DATABASE_URL` contains password - keep secure
- 🔐 All sensitive keys are already configured in your Supabase project

## 📱 Alternative: Vercel CLI

If you prefer using CLI after authentication:

```bash
# Login first
npx vercel login

# Link project
npx vercel link

# Add environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add DATABASE_URL
npx vercel env add RSS_FETCH_INTERVAL
npx vercel env add MAX_ARTICLES_PER_FETCH

# Deploy
npx vercel --prod
```