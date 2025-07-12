# Deployment Guide: AI Instagram Reels Generator

## 1. Vercel Setup
- Connect your GitHub repo to Vercel (https://vercel.com/import).
- Set the root as the project root (where `vercel.json` is located).
- Vercel will auto-detect the build settings from `vercel.json`.

## 2. Environment Variables
- Copy `env.example` to `.env` and fill in all required values.
- In Vercel dashboard, add all variables from `.env` to the Environment Variables section for your project.
- Make sure secrets (API keys, DB, etc.) are set for both Production and Preview.

## 3. Database (PostgreSQL)
- Provision a PostgreSQL database (e.g., Vercel Postgres, Supabase, Neon, or AWS RDS).
- Set `DATABASE_URL` in your environment variables.
- Run migrations:
  ```sh
  cd server
  npx prisma migrate deploy
  npx prisma generate
  ```
- (Optional) Use `npx prisma studio` to inspect/manage data.

## 4. CDN (Cloudinary)
- Create a Cloudinary account (https://cloudinary.com/).
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your environment.
- The backend will automatically upload and serve videos/images via Cloudinary.

## 5. Monitoring & Logging
- Sentry is integrated for error monitoring. Set `SENTRY_DSN` in your environment.
- Logs are output via `morgan` and custom logger. Use Vercel's built-in log streaming for runtime logs.
- (Optional) Integrate Datadog, Logtail, or another provider for advanced monitoring.

## 6. CI/CD Pipeline (GitHub Actions)
- See `.github/workflows/deploy.yml` for the pipeline.
- On push to `main` or PR, the workflow will:
  - Install dependencies
  - Lint, type-check, and test
  - Build frontend and backend
  - Run Prisma migrations
  - Deploy to Vercel (if configured)
- Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub secrets.

## 7. Local Development
- Install all dependencies:
  ```sh
  npm run install-all
  ```
- Start both servers:
  ```sh
  npm run dev
  ```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 8. Useful Commands
- `npm run db:migrate` — Run DB migrations
- `npm run db:studio` — Open Prisma Studio
- `npm run build` — Build frontend
- `npm run server` — Start backend
- `npm run client` — Start frontend

---
For any issues, check Vercel logs, Sentry dashboard, or open an issue in the repository. 