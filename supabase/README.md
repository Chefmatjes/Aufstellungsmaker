# Supabase Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

## 2. Run the Schema

1. Go to the SQL Editor in your Supabase Dashboard
2. Copy the contents of `schema.sql`
3. Run the SQL script

## 3. Configure Authentication

### Enable OAuth Providers

1. Go to **Authentication** → **Providers**
2. Enable **Google**:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Set the redirect URL to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Enter your Client ID and Secret in Supabase

3. Enable **Apple** (optional):
   - Create an App ID and Service ID in [Apple Developer](https://developer.apple.com)
   - Configure Sign in with Apple
   - Enter the credentials in Supabase

### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`

## 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values to your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key

## 5. Test the Setup

```bash
npm run dev
```

Navigate to `/login` and try signing in with Google.
