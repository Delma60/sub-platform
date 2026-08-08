# App TODO — React Native (Expo)

The mobile app is a client that consumes the same backend API built in the Next.js website (auth, products, subscriptions, payments, orders). It does not duplicate backend logic — it calls the existing API.

---

## 1. Project Setup
- [ ] Initialize Expo project — `apps/mobile` (use Expo Router for navigation/file-based routing)
- [ ] Set up TypeScript, ESLint, Prettier (share config with web where possible)
- [ ] Set up shared package for API client + types/schemas (consumed by both web and mobile)
- [ ] Configure `app.json`/`app.config.ts` (app name, bundle IDs, icons, splash)
- [ ] Set up environment config for dev/staging/prod API URLs
- [ ] Install core deps: expo-secure-store, expo-notifications, expo-image, react-query (or SWR)

## 2. Auth
- [ ] Login / register screens
- [ ] Store auth tokens securely (expo-secure-store)
- [ ] Token refresh handling (silent refresh, auto-logout on expiry)
- [ ] Forgot password / OTP flow (matching backend)
- [ ] Biometric login (optional, Face ID/fingerprint via expo-local-authentication)

## 3. Core Navigation & Screens
- [ ] Onboarding/intro screens (first-launch only)
- [ ] Home/catalog screen — browse plans and products
- [ ] Plan detail screen (what's included, price, frequency)
- [ ] Subscribe/checkout flow
- [ ] Subscription management screen (view current plan, pause/skip/cancel/upgrade)
- [ ] Order history screen
- [ ] Order/delivery tracking screen (status: processing, packed, out for delivery, delivered)
- [ ] Address book (add/edit/remove delivery addresses, use device location)
- [ ] Profile/account settings screen
- [ ] Payment history / receipts screen

## 4. Payments (Flutterwave)
- [ ] Integrate Flutterwave in-app checkout (WebView-based checkout or official RN SDK if available)
- [ ] Handle payment success/failure/cancel states within app flow
- [ ] Display saved card/payment method status (for recurring billing)
- [ ] Deep link or redirect handling back into the app after payment

## 5. Notifications
- [ ] Set up Expo push notifications (register device token, send to backend)
- [ ] Handle notification permissions prompt (with clear rationale)
- [ ] In-app notification center/list
- [ ] Local notification for "delivery tomorrow" reminder (optional, backend-driven preferred)

## 6. Media & Storage
- [ ] Product images loaded from S3/CDN (via `expo-image` for caching/performance)
- [ ] Profile avatar upload flow (get signed URL from backend, upload directly to S3)

## 7. Offline & Error Handling
- [ ] Loading states for all data-fetching screens
- [ ] Offline/no-connection state handling
- [ ] Global error boundary + friendly error messages
- [ ] Retry logic for failed API calls

## 8. Polish & Store Readiness
- [ ] App icon, splash screen, adaptive icon (Android)
- [ ] Store screenshots and preview assets
- [ ] Privacy policy & terms links (required by both stores)
- [ ] App Store / Play Store descriptions and metadata

## 9. Testing & QA
- [ ] Manual QA on physical iOS + Android devices
- [ ] Test subscription lifecycle end-to-end (subscribe → pause → resume → cancel)
- [ ] Test payment flow with Flutterwave test cards
- [ ] Test push notification delivery

## 10. Build & Deployment
- [ ] Configure EAS Build (development, preview, production profiles)
- [ ] Set up EAS Secrets for API keys/env vars
- [ ] Internal testing build (TestFlight / Google Play internal track)
- [ ] Submit to App Store (Apple Developer account required)
- [ ] Submit to Google Play (Play Console account required)
- [ ] Set up OTA updates via EAS Update for JS-only fixes post-launch