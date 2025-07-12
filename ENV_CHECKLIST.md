# Environment Variables Checklist

Use this checklist to track your progress in setting up all required environment variables.

## 🔐 Security & Authentication
- [ ] **JWT_SECRET** - Generate with `npm run generate-env`
- [ ] **JWT_EXPIRES_IN** - Set to `7d` (or your preference)

## 🗄️ Database
- [ ] **DATABASE_URL** - PostgreSQL connection string
  - [ ] Vercel Postgres (recommended)
  - [ ] Supabase (free tier)
  - [ ] Neon (serverless)
  - [ ] AWS RDS

## 🤖 AI Video Generation
- [ ] **RUNWAYML_API_KEY** - From RunwayML dashboard
- [ ] **RUNWAYML_BASE_URL** - Default: `https://api.runwayml.com/v1`

## 📱 Instagram Integration
- [ ] **INSTAGRAM_APP_ID** - From Facebook Developers
- [ ] **INSTAGRAM_APP_SECRET** - From Facebook Developers
- [ ] **INSTAGRAM_REDIRECT_URI** - Your callback URL

## 🚀 Queue Management (Redis)
- [ ] **REDIS_HOST** - Redis server host
- [ ] **REDIS_PORT** - Default: `6379`
- [ ] **REDIS_PASSWORD** - If required
- [ ] **REDIS_URL** - Full connection string
  - [ ] Upstash (recommended for Vercel)
  - [ ] Redis Cloud
  - [ ] Local Redis

## ☁️ CDN & File Storage
- [ ] **CLOUDINARY_CLOUD_NAME** - From Cloudinary dashboard
- [ ] **CLOUDINARY_API_KEY** - From Cloudinary dashboard
- [ ] **CLOUDINARY_API_SECRET** - From Cloudinary dashboard

## 📊 Monitoring & Logging
- [ ] **SENTRY_DSN** - From Sentry project
- [ ] **LOG_LEVEL** - Set to `info`
- [ ] **DATADOG_API_KEY** - Optional

## 📧 Email (Optional)
- [ ] **SMTP_HOST** - Email server host
- [ ] **SMTP_PORT** - Email server port
- [ ] **SMTP_USER** - Email username
- [ ] **SMTP_PASS** - Email password/app password

## 🌐 Frontend Configuration
- [ ] **REACT_APP_API_URL** - Your API domain
- [ ] **REACT_APP_CDN_URL** - Cloudinary URL

## 🔒 Security Settings
- [ ] **CORS_ORIGIN** - Your frontend domain
- [ ] **RATE_LIMIT_WINDOW_MS** - Default: `900000`
- [ ] **RATE_LIMIT_MAX_REQUESTS** - Default: `100`

## 📈 Analytics (Optional)
- [ ] **GOOGLE_ANALYTICS_ID** - GA4 Measurement ID
- [ ] **MIXPANEL_TOKEN** - Mixpanel project token

## 🚀 Vercel Deployment
- [ ] **VERCEL_TOKEN** - From Vercel account settings
- [ ] **VERCEL_ORG_ID** - From Vercel team settings
- [ ] **VERCEL_PROJECT_ID** - From Vercel project settings

## 📝 Setup Steps
1. [ ] Run `npm run generate-env` to get JWT_SECRET
2. [ ] Copy `env.example` to `.env`
3. [ ] Fill in all variables above
4. [ ] Add variables to Vercel dashboard
5. [ ] Add secrets to GitHub Actions
6. [ ] Test database connection
7. [ ] Test API endpoints

## 🔗 Quick Access Links
- [RunwayML](https://runwayml.com)
- [Facebook Developers](https://developers.facebook.com)
- [Cloudinary](https://cloudinary.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Upstash](https://upstash.com)
- [Sentry](https://sentry.io)
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)

## ✅ Testing Checklist
- [ ] Database connection works
- [ ] RunwayML API responds
- [ ] Cloudinary uploads work
- [ ] Instagram OAuth flow works
- [ ] Redis queue connects
- [ ] Sentry error reporting works
- [ ] Frontend builds successfully
- [ ] All API endpoints respond

## 🚨 Important Notes
- Never commit `.env` files to git
- Use strong, unique passwords
- Enable 2FA on all accounts
- Rotate API keys regularly
- Test in development before production 