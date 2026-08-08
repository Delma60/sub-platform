# Instructions — Foodstuff Subscription Platform

Setup and getting-started guide for developers working on this project.

---

## 1. Project Structure (Monorepo)

```
/foodstuff-platform
├── apps/
│   ├── web/          # Next.js fullstack app (website + API + admin)
│   └── mobile/        # React Native Expo app
├── packages/
│   ├── shared-types/  # Shared TypeScript types & zod schemas
│   └── api-client/    # Shared fetch wrapper used by both web and mobile
├── website-todo.md
├── app-todo.md
└── instructions.md
```

Using a monorepo (Turborepo or Nx) lets the web backend and mobile app share types and an API client, so you don't duplicate request/response shapes or validation logic.

## 2. Prerequisites
- Node.js 20+ and npm/pnpm/yarn
- A [Neon](https://neon.tech) account (Postgres database)
- An [AWS](https://aws.amazon.com) account with S3 access (or an S3-compatible provider)
- A [Flutterwave](https://flutterwave.com) merchant account (test + live API keys)
- Expo account + Expo CLI (`npm install -g eas-cli`) for mobile builds
- Xcode (Mac, for iOS builds/simulator) and/or Android Studio (for Android builds/emulator)

## 3. Initial Setup

1. Clone the repo and install dependencies from the root:
   ```bash
   npm install
   ```
2. Create a Neon project, grab the connection string, and set up your ORM (Prisma or Drizzle):
   ```bash
   cd apps/web
   npx prisma init   # or drizzle-kit equivalent
   ```
3. Run the initial migration and seed script once schema is defined (see `website-todo.md` §2):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. Create an S3 bucket (e.g. `foodstuff-platform-media`) with appropriate CORS rules to allow signed-URL uploads from your web/app domains.
5. In Flutterwave dashboard: get your test `Public Key`, `Secret Key`, and `Encryption Key`, and configure a webhook URL pointing to `https://<your-domain>/api/payments/webhook`.

## 4. Environment Variables

Create `.env` files (never commit these — add to `.gitignore`).

**`apps/web/.env.local`:**
```
DATABASE_URL=postgres://<neon-connection-string>
NEXTAUTH_SECRET=<random-secret>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=<region>
S3_BUCKET_NAME=foodstuff-platform-media
FLW_PUBLIC_KEY=<flutterwave-public-key>
FLW_SECRET_KEY=<flutterwave-secret-key>
FLW_ENCRYPTION_KEY=<flutterwave-encryption-key>
FLW_WEBHOOK_HASH=<your-chosen-webhook-secret-hash>
```

**`apps/mobile/.env`:**
```
EXPO_PUBLIC_API_URL=https://<your-web-domain>/api
EXPO_PUBLIC_FLW_PUBLIC_KEY=<flutterwave-public-key>
```
> Mobile only holds the Flutterwave **public** key — secret keys stay server-side only.

## 5. Running Locally

**Web (Next.js — website + API + admin):**
```bash
cd apps/web
npm run dev
# runs at http://localhost:3000
```

**Mobile (Expo):**
```bash
cd apps/mobile
npx expo start
# scan QR with Expo Go, or press i / a for simulator/emulator
```
Make sure `EXPO_PUBLIC_API_URL` points to a reachable address — `localhost` won't work from a physical device; use your machine's LAN IP or a tunnel (`npx expo start --tunnel`).

## 6. Build & Deploy Order (Recommended Sequence)

1. **Backend first**: build out database schema + API routes in `apps/web` (see `website-todo.md` §1–4) before touching UI — the mobile app depends on this API.
2. **Website UI**: build customer-facing pages, then admin dashboard.
3. **Mobile app**: once auth + core API routes are stable, start on `apps/mobile` — it should only need to call existing endpoints, not invent new ones.
4. **Payments**: wire up Flutterwave in web first (easier to debug with browser devtools), then replicate the flow in mobile.
5. **Notifications**: add once core flows (subscribe → order → deliver) work end-to-end.
6. **Testing & deployment**: staging environment for both web and mobile builds before any store submission or production launch.

## 7. Deployment Targets
- **Web**: Vercel (recommended for Next.js) — connect GitHub repo, set env vars in Vercel dashboard, enable Vercel Cron for order-generation jobs.
- **Database**: Neon — use separate branches for dev/staging/prod.
- **Mobile**: EAS Build for production binaries, EAS Update for OTA JS updates, submit via EAS Submit to App Store / Play Store.

## 8. Useful References
- Next.js App Router docs: https://nextjs.org/docs
- Neon docs: https://neon.tech/docs
- Flutterwave docs: https://developer.flutterwave.com/docs
- Expo docs: https://docs.expo.dev
- EAS Build/Submit: https://docs.expo.dev/eas

## 9. Notes & Conventions
- All API responses should follow a consistent shape, e.g. `{ success: boolean, data?: T, error?: string }`.
- Validate all input with zod schemas shared between backend and any form logic.
- Never expose AWS or Flutterwave **secret** keys to client code (web or mobile) — only use them in `apps/web` server-side code.
- Use the shared `packages/api-client` in both web and mobile so API contract changes only need updating in one place.