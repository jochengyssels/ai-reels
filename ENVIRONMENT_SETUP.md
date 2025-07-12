# Environment Variables Setup Guide

This guide will help you collect all the required environment variables for the AI Instagram Reels Generator app.

## 1. Database Configuration

### DATABASE_URL
**Format:** `postgresql://username:password@host:port/database_name`

**Options:**
- **Vercel Postgres** (Recommended for Vercel deployment):
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
  2. Create a new project or select existing
  3. Go to Storage → Create Database → Postgres
  4. Copy the connection string

- **Supabase** (Free tier available):
  1. Go to [Supabase](https://supabase.com)
  2. Create new project
  3. Go to Settings → Database
  4. Copy the connection string

- **Neon** (Serverless Postgres):
  1. Go to [Neon](https://neon.tech)
  2. Create account and project
  3. Copy the connection string from dashboard

## 2. JWT Configuration

### JWT_SECRET
**Generate a secure random string:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/64
```

### JWT_EXPIRES_IN
**Default:** `7d` (7 days)
**Other options:** `1h`, `24h`, `30d`, `1y`

## 3. Server Configuration

### PORT
**Default:** `5000` (Vercel will override this)

### NODE_ENV
**Production:** `production`
**Development:** `development`

## 4. RunwayML API Configuration

### RUNWAYML_API_KEY
1. Go to [RunwayML](https://runwayml.com)
2. Create account or sign in
3. Go to Account Settings → API Keys
4. Generate a new API key
5. Copy the key

### RUNWAYML_BASE_URL
**Default:** `https://api.runwayml.com/v1`

## 5. Instagram Graph API Configuration

### INSTAGRAM_APP_ID
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app or select existing
3. Go to Settings → Basic
4. Copy the App ID

### INSTAGRAM_APP_SECRET
1. In the same Facebook app
2. Go to Settings → Basic
3. Click "Show" next to App Secret
4. Copy the secret

### INSTAGRAM_REDIRECT_URI
**Format:** `https://your-domain.com/api/instagram/callback`
**For development:** `http://localhost:5000/api/instagram/callback`

**Facebook App Setup:**
1. Go to Facebook App → Instagram Basic Display
2. Add Instagram Basic Display product
3. Configure Valid OAuth Redirect URIs
4. Add your redirect URI

## 6. Redis Configuration (for Queue Management)

### REDIS_HOST
**Default:** `localhost`
**For production:** Use Redis service (Upstash, Redis Cloud, etc.)

### REDIS_PORT
**Default:** `6379`

### REDIS_PASSWORD
**Default:** Empty
**For production:** Set if your Redis service requires authentication

### REDIS_URL
**Format:** `redis://username:password@host:port`
**Examples:**
- Local: `redis://localhost:6379`
- Upstash: `redis://username:password@host:port`

**Redis Services:**
- **Upstash** (Recommended for Vercel):
  1. Go to [Upstash](https://upstash.com)
  2. Create account and Redis database
  3. Copy the connection string

- **Redis Cloud:**
  1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
  2. Create account and database
  3. Copy the connection string

## 7. File Upload Configuration

### UPLOAD_DIR
**Default:** `./uploads`

### MAX_FILE_SIZE
**Default:** `10485760` (10MB in bytes)

## 8. CDN Configuration (Cloudinary)

### CLOUDINARY_CLOUD_NAME
1. Go to [Cloudinary](https://cloudinary.com)
2. Create account or sign in
3. Go to Dashboard
4. Copy the Cloud Name

### CLOUDINARY_API_KEY
1. In Cloudinary Dashboard
2. Go to Settings → Access Keys
3. Copy the API Key

### CLOUDINARY_API_SECRET
1. In the same Cloudinary settings
2. Copy the API Secret

## 9. Monitoring and Logging

### LOG_LEVEL
**Options:** `error`, `warn`, `info`, `debug`
**Default:** `info`

### SENTRY_DSN
1. Go to [Sentry](https://sentry.io)
2. Create account or sign in
3. Create new project (Node.js)
4. Copy the DSN (Data Source Name)

### DATADOG_API_KEY (Optional)
1. Go to [Datadog](https://datadoghq.com)
2. Create account
3. Go to Organization Settings → API Keys
4. Copy the API key

## 10. Email Configuration (Optional)

### SMTP_HOST
**Gmail:** `smtp.gmail.com`
**Outlook:** `smtp-mail.outlook.com`

### SMTP_PORT
**Gmail:** `587`
**Outlook:** `587`

### SMTP_USER
Your email address

### SMTP_PASS
**Gmail:** App password (not regular password)
1. Go to Google Account Settings
2. Security → 2-Step Verification → App passwords
3. Generate new app password

## 11. Frontend Configuration

### REACT_APP_API_URL
**Production:** `https://your-api-domain.com`
**Development:** `http://localhost:5000`

### REACT_APP_CDN_URL
**Format:** `https://res.cloudinary.com/your-cloud-name`

## 12. Security

### CORS_ORIGIN
**Production:** `https://your-frontend-domain.com`
**Development:** `http://localhost:3000`

### RATE_LIMIT_WINDOW_MS
**Default:** `900000` (15 minutes in milliseconds)

### RATE_LIMIT_MAX_REQUESTS
**Default:** `100` (requests per window)

## 13. Analytics (Optional)

### GOOGLE_ANALYTICS_ID
1. Go to [Google Analytics](https://analytics.google.com)
2. Create account and property
3. Copy the Measurement ID (G-XXXXXXXXXX)

### MIXPANEL_TOKEN (Optional)
1. Go to [Mixpanel](https://mixpanel.com)
2. Create account and project
3. Copy the project token

## 14. Vercel Deployment Secrets

### VERCEL_TOKEN
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create new token
3. Copy the token

### VERCEL_ORG_ID
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your team/organization
3. Go to Settings → General
4. Copy the Team ID

### VERCEL_PROJECT_ID
1. In your Vercel project
2. Go to Settings → General
3. Copy the Project ID

## Environment File Setup

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Fill in all the values you collected above

3. For Vercel deployment, add all variables in the Vercel dashboard:
   - Go to your project settings
   - Environment Variables section
   - Add each variable with appropriate environment (Production/Preview)

4. For GitHub Actions, add secrets:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add each secret

## Testing Your Setup

1. Test database connection:
```bash
cd server
npx prisma db push
```

2. Test RunwayML API:
```bash
curl -H "Authorization: Bearer YOUR_RUNWAYML_API_KEY" \
     https://api.runwayml.com/v1/models
```

3. Test Cloudinary:
```bash
curl -X GET \
     "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/sample.jpg"
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Rotate API keys regularly
- Use environment-specific configurations
- Enable 2FA on all accounts where possible 