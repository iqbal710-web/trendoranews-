# TrendoraNews

Next.js 16 and PostgreSQL application. The original upload flattened the project files into the repository root. The compatible app and database files have been restored to `src/app` and `src/db`, components and helpers to `src/components` and `src/lib`, and images to `public`. The ZIP also contains a separate, incomplete `(site)`/`studio` implementation that refers to missing files and a different database schema; it has not been enabled. The original archive is preserved for reference.

## Vercel deployment

1. Import this repository in Vercel, with the root directory left blank and the Next.js framework preset. Use Node.js 22 or another Next.js 16 supported version.
2. Provision a reachable PostgreSQL database. Set `DATABASE_URL` in Vercel for Production and Preview to the provider's connection string. A local `127.0.0.1` database cannot be reached by Vercel. Set `AUTH_SECRET` to a long randomly generated secret (for example `openssl rand -hex 32`) and `NEXT_PUBLIC_SITE_URL` to the site's full public HTTPS URL. Do not commit these values.
3. Create the database tables once, **before using the application**. From a trusted computer, install dependencies (`npm ci`), configure `DATABASE_URL` in a local `.env` file, and run `npm run db:push`. Check the target database carefully before accepting schema changes; back up existing data first. Use a separate database for previews.
4. Deploy the commit containing the restored directories. A successful build alone does not guarantee the database connection or tables are correct. Check `/api/health` and load the homepage after deployment.

The database starts empty. `npm run db:seed` is an optional **demo-only** seed for an empty test database: it creates example articles and accounts with the public password `password123`. Never use it on a public production database. Google sign-in is unavailable because the compatible OAuth implementation was not included in the upload; email/password login is available.

Vercel's function filesystem is not persistent. Local media uploads cannot be used there; the media library supports registering an already hosted image URL. Durable direct uploads require integrating external object storage.

## Local development

Copy `.env.example` to `.env`, fill in the values, run `npm ci`, initialize a test database with `npm run db:push`, and run `npm run dev`. `npm run typecheck` and `npm run build` verify TypeScript and the production build; the build requires `DATABASE_URL` to be set. The `db:seed` warning above also applies locally.
