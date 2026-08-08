# Website TODO — Next.js Fullstack (Web + Backend/API)

The website is the fullstack core: it hosts the customer-facing web app, the admin dashboard, AND the backend API that the mobile app will also consume.

---

## 1. Project Setup
- [ ] Initialize Next.js app (App Router) — `apps/web`
- [ ] Set up TypeScript, ESLint, Prettier
- [ ] Set up Tailwind (or chosen styling system)
- [ ] Connect to Neon Postgres (env vars, connection pooling via `@neondatabase/serverless` or Prisma driver adapter)
- [ ] Set up ORM (Prisma or Drizzle) and run initial migration
- [ ] Set up AWS S3 client + signed URL helper
- [ ] Set up Flutterwave SDK/keys (test mode)
- [ ] Deploy skeleton to Vercel (staging)

## 2. Database & Backend Logic
- [ ] Create schema: users, addresses, products, subscription_plans, subscriptions, orders, order_items, payments, deliveries
- [ ] Seed script with sample products/plans for dev
- [ ] Order-generation logic (turns active subscriptions into orders each cycle)
- [ ] Subscription state machine (active, paused, cancelled, payment_failed)

## 3. API Routes (consumed by both web AND mobile app)
- [ ] `POST /api/auth/register`, `/login`, `/refresh`, `/logout`
- [ ] `GET /api/products`, admin `POST/PUT/DELETE /api/products/:id`
- [ ] `GET /api/plans`, admin CRUD for plans
- [ ] `POST /api/subscriptions` (subscribe), `PATCH` (pause/skip/cancel/upgrade)
- [ ] `GET /api/orders` (user's order history), `GET /api/orders/:id`
- [ ] `POST /api/payments/initiate` (Flutterwave checkout init)
- [ ] `POST /api/payments/webhook` (Flutterwave webhook — verify signature, update DB)
- [ ] `POST /api/uploads/sign` (S3 signed URL for image uploads)
- [ ] `PATCH /api/deliveries/:id` (rider/admin updates delivery status)
- [ ] Zod validation on every route, consistent error response shape
- [ ] Rate limiting on public/auth routes

## 4. Auth & Access Control
- [ ] Auth.js/NextAuth or custom JWT setup, issuing tokens usable by mobile too
- [ ] Middleware for protected routes (customer vs admin vs rider)
- [ ] Password reset flow / OTP via email or SMS

## 5. Customer-Facing Web Pages
- [ ] Landing page (value prop, pricing tiers, how it works, CTA)
- [ ] Product/box catalog page
- [ ] Plan selection + checkout flow (Flutterwave redirect/inline)
- [ ] Checkout success / failure pages
- [ ] Customer dashboard: current subscription, next delivery date, pause/skip/cancel controls
- [ ] Order history + payment history
- [ ] Address book (add/edit/remove delivery addresses)
- [ ] Account settings (profile, password, notifications)
- [ ] Responsive/mobile-friendly layout
- [ ] SEO basics: metadata, sitemap.xml, robots.txt, OG images

## 6. Admin Dashboard
- [ ] Admin login (role-gated)
- [ ] Manage products (create/edit, upload images to S3)
- [ ] Manage subscription plans (tiers, pricing, item templates)
- [ ] View/manage all subscriptions (search, filter by status)
- [ ] View/manage orders and delivery status
- [ ] Assign riders to deliveries
- [ ] View payment/transaction logs
- [ ] Basic analytics (active subs, MRR, churn, upcoming deliveries count)

## 7. Rider/Ops View (can be part of admin, gated by role)
- [ ] Today's delivery list
- [ ] Mark delivered + upload proof-of-delivery photo (S3)
- [ ] Report delivery issue (missing/damaged item)

## 8. Notifications (triggered from backend)
- [ ] Email service integration (Resend/SendGrid) — order confirmation, receipts, delivery reminders
- [ ] SMS integration (e.g. Termii) — delivery day reminders
- [ ] Webhook-triggered notification on payment success/failure

## 9. Testing & QA
- [ ] Unit tests: billing cycle logic, order generation
- [ ] Integration test: Flutterwave webhook handling
- [ ] E2E test: full checkout flow
- [ ] Manual QA: admin flows, subscription pause/cancel edge cases

## 10. Deployment & DevOps
- [ ] Staging + production environments (separate Neon branches, S3 prefixes, Flutterwave keys)
- [ ] CI/CD via GitHub Actions → Vercel
- [ ] Cron job for order generation (Vercel Cron)
- [ ] Error tracking (Sentry) + analytics (PostHog)
- [ ] Custom domain + SSL