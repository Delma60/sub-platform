# Website TODO - Next.js Fullstack (Web + Backend/API)

The website is the fullstack core: it hosts the customer-facing web app, the admin dashboard, AND the backend API that the mobile app will also consume.

---

## 1. Project Setup
- [x] Initialize Next.js app (App Router) - `apps/web`
- [x] Set up TypeScript, ESLint, Prettier
- [x] Set up Tailwind (or chosen styling system)
- [x] Connect to Neon Postgres (env vars, connection pooling via `@neondatabase/serverless` or Prisma driver adapter)
- [x] Set up ORM (Prisma or Drizzle) and run initial migration
- [x] Set up AWS S3 client + signed URL helper
- [x] Set up Flutterwave SDK/keys (test mode)
- [ ] Deploy skeleton to Vercel (staging)

## 2. Database & Backend Logic
- [x] Create schema: users, addresses, products, subscription_plans, subscriptions, orders, order_items, payments, deliveries
- [x] Seed script with sample products/plans for dev
- [x] Order-generation logic (turns active subscriptions into orders each cycle)
- [x] Subscription state machine (active, paused, cancelled, payment_failed)

## 3. API Routes (consumed by both web AND mobile app)
- [x] `POST /api/auth/register`, `/login`, `/refresh`, `/logout`
- [x] `GET /api/products`, admin `POST/PUT/DELETE /api/products/:id`
- [x] `GET /api/plans`, admin CRUD for plans
- [x] `POST /api/subscriptions` (subscribe), `PATCH` (pause/skip/cancel/upgrade)
- [x] `GET /api/orders` (user's order history), `GET /api/orders/:id`
- [x] `POST /api/payments/initiate` (Flutterwave checkout init)
- [x] `POST /api/payments/webhook` (Flutterwave webhook - verify signature, update DB)
- [x] `POST /api/uploads/sign` (S3 signed URL for image uploads)
- [x] `PATCH /api/deliveries/:id` (customer skip plus rider/admin status updates with role and ownership checks)
- [x] Zod validation on every route, consistent error response shape
- [x] Rate limiting on public/auth routes

## 4. Auth & Access Control
- [x] Custom signed access/refresh token setup usable by web cookies and mobile bearer authentication
- [x] Middleware for protected routes (customer vs admin vs rider)
- [x] Password reset flow with expiring single-use token delivery through email

## 5. Customer-Facing Web Pages
- [x] Landing page (value prop, pricing tiers, how it works, CTA)
- [x] Product/box catalog page
- [x] Plan selection + checkout flow (Flutterwave redirect)
- [x] Checkout success / failure pages
- [x] Customer dashboard: current subscription, next delivery date, pause/skip/cancel controls
- [x] Order history + payment history
- [x] Address book (add/edit/remove delivery addresses)
- [x] Account settings (profile, password, notifications)
- [x] Responsive/mobile-friendly layout
- [x] SEO basics: metadata, sitemap.xml, robots.txt, generated OG image

## 6. Admin Dashboard
- [x] Admin login (role-gated)
- [x] Manage products (create/edit, upload images to S3)
- [x] Manage subscription plans (tiers, pricing, item templates)
- [x] View/manage all subscriptions (search, filter by status)
- [x] View/manage orders and delivery status
- [x] Assign riders to deliveries
- [x] Manage riders (create/edit/deactivate rider accounts)
- [x] View payment/transaction logs
- [x] Basic analytics (active subs, MRR, churn, upcoming deliveries count)

## 7. Rider/Ops View (can be part of admin, gated by role)
- [x] Today's delivery list
- [x] Rider delivery detail page with customer/address/order/plan context
- [x] Rider delivery route/list filters: today, pending, in-progress, completed, failed
- [x] Mark delivery in-progress, delivered, failed, or rescheduled from rider dashboard
- [x] Upload proof-of-delivery photo via S3 signed upload
- [x] Capture proof metadata: recipient name, rider note, delivery timestamp, optional geo/location
- [x] Report delivery issue: customer unavailable, missing item, damaged item, wrong address, payment issue
- [x] Rider-safe `PATCH /api/deliveries/:id` flow with ownership checks
- [x] Admin assignment workflow: assign/reassign rider, unassign rider, view rider workload
- [x] Rider notification flow: new assignment, route changes, delivery reminders
- [x] Rider mobile-friendly layout for one-handed delivery-day use
- [x] Rider delivery history page

## 8. Notifications (triggered from backend)
- [x] Email service integration (Resend/SendGrid) - order confirmation, receipts, delivery reminders
- [x] SMS integration (e.g. Termii) - delivery day reminders
- [x] Webhook-triggered notification on payment success/failure

## 9. Testing & QA
- [ ] Unit tests: billing cycle logic, order generation
- [ ] Integration test: Flutterwave webhook handling
- [ ] E2E test: full checkout flow
- [ ] Manual QA: admin flows, subscription pause/cancel edge cases

## 10. Deployment & DevOps
- [ ] Staging + production environments (separate Neon branches, S3 prefixes, Flutterwave keys)
- [ ] CI/CD via GitHub Actions -> Vercel
- [ ] Cron job for order generation (Vercel Cron) (partial: protected order-generation endpoint exists; Vercel Cron is not configured)
- [ ] Error tracking (Sentry) + analytics (PostHog)
- [ ] Custom domain + SSL
