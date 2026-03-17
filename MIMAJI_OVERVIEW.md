# MiMaji — Application Overview Document

**Version:** 1.0
**Date:** 17 March 2026
**Tagline:** *Fresh Water Delivered Today*

---

## 1. Software Overview

MiMaji is a **water delivery platform** for Nairobi, Kenya. It connects customers who need clean drinking water with distributors, kiosks, and delivery riders — powered by M-Pesa mobile payments and SMS notifications.

### Target Users

| Role | Description |
|------|-------------|
| **Customer** | Orders water jugs, pays via M-Pesa, tracks delivery |
| **Distributor** | Accepts orders, manages deliveries from a depot |
| **Rider** | Picks up and delivers water to customers |
| **Kiosk/Provider** | Stationary water point listed in the directory |
| **Admin** | Monitors KPIs, manages zones, pricing, users |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | 2.99.2 |
| State | React Context + Zustand | 5.0.12 |
| Payments | Safaricom M-Pesa STK Push | — |
| SMS | Africa's Talking | — |
| Maps | Google Maps API (planned) | — |
| Hosting | Vercel (implicit) | — |

---

## 3. Frontend Pages (14 routes)

### Public / Customer Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Homepage** | Hero banner, order form, how-it-works steps, impact banner, footer |
| `/signup` | **Sign Up** | Full name, phone, password, M-Pesa number, delivery address |
| `/login` | **Log In** | Phone + password authentication |
| `/orders` | **Order History** | Filterable list (all / active / delivered), requires OTP login |
| `/order/[id]` | **Order Detail** | Payment flow, status stepper, real-time updates via Supabase Realtime |
| `/track` | **Live Tracking** | Simulated map, rider card (name, vehicle, rating), ETA countdown, 6-step timeline |
| `/kiosks` | **Water Providers** | Directory with list/map view toggle, sort by distance/rating, filter by zone |
| `/impact` | **Impact / CSR** | Donation stats, success stories, partner call-to-action |
| `/referrals` | **Referral Program** | Share referral code, reward tiers (10L per friend) |

### Onboarding Pages

| Route | Page | Description |
|-------|------|-------------|
| `/join/provider` | **Provider Signup** | 3-step form: Business Info → Location & Type → Operations |
| `/join/rider` | **Rider Signup** | 3-step form: Personal Info → Vehicle & Zone → Availability |

### Distributor Pages

| Route | Page | Description |
|-------|------|-------------|
| `/distributor` | **Distributor Login** | OTP-based authentication |
| `/distributor/dashboard` | **Distributor Dashboard** | Order tabs (new/active/done), accept/deliver actions, daily stats, Realtime subscriptions |

### Admin Pages

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | **Admin Panel** | Tabs: Overview (KPIs, zone charts), Orders, Distributors, Zones, Pricing |

---

## 4. Components (14 total)

### Layout

| Component | Purpose |
|-----------|---------|
| `Navbar.tsx` | Sticky header, 3 variants (default/distributor/admin), mobile hamburger, language switcher |
| `Footer.tsx` | Site-wide footer with links and branding |

### Shared / UI

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Variants: primary, outline, ghost, danger. Sizes: sm, md, lg. Loading spinner |
| `Badge.tsx` | Color-coded order status tags (6 statuses) |
| `OTPLogin.tsx` | 6-digit input with auto-focus, paste support, resend countdown |
| `PromoPopup.tsx` | First-time promo modal (discount + referral rewards) |
| `ClientProviders.tsx` | Wraps app in LangProvider context |

### Order Flow

| Component | Purpose |
|-----------|---------|
| `OrderForm.tsx` | Address, quantity, price breakdown, M-Pesa field, voucher code → calls `/api/orders` |
| `AddressInput.tsx` | Address field with geocoding (lat/lng) |
| `QuantitySelector.tsx` | 1–10 jug selector with per-unit pricing display |
| `PriceBreakdown.tsx` | Tiered pricing table with savings calculation |
| `HowItWorks.tsx` | 3-step visual guide: Order → Pay → Receive |

### Tracking

| Component | Purpose |
|-----------|---------|
| `StatusStepper.tsx` | Linear progress through Paid → Confirmed → On the Way → Delivered |
| `StatusCard.tsx` | Contextual status message card |

---

## 5. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-900` | #0A2342 | Primary dark / headings |
| `blue-700` | #1A4B8C | Buttons / accents |
| `blue-500` | #2B7FD4 | Links / interactive |
| `blue-200` | #BDDBF5 | Light accents |
| `blue-100` | #D6E8F7 | Card backgrounds |
| `blue-50` | #EEF6FD | Page backgrounds |
| `text-dark` | #0A2342 | Body text |
| `text-mid` | #3D5A80 | Secondary text |
| `text-light` | #7FA5C8 | Muted / placeholder |
| `success` | #1A8C5B | Delivered / positive |
| `warning` | #B87A00 | Pending / caution |
| `error` | #C0392B | Cancelled / errors |

### Typography

- **Font:** Inter (Google Fonts)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extra Bold)

### Animations

| Name | Effect |
|------|--------|
| `pulse-drop` | Scale 1 → 1.1 → 1 (1.5s) |
| `fade-in` | Opacity + slide down (0.4s) |
| `slide-in-top` | Slide from top (0.3s) |
| `bounce-number` | Scale bounce (0.2s) |
| `slide-up` | Slide from bottom (0.3s) |
| Stagger delays | 100ms, 200ms, 300ms |

---

## 6. Backend / API Routes

### POST /api/orders

- Validates address, phone, quantity (1–10)
- Calculates total: `quantity × jug_price + delivery_fee`
- Creates order in Supabase
- Initiates M-Pesa STK Push
- Creates payment record
- **Returns:** `{ orderId, checkoutRequestId, priceTotal }`

### POST /api/mpesa/callback

- Safaricom webhook for payment results
- Updates payment status → `success` or `failed`
- Updates order status → `paid` or `cancelled`
- Sends SMS confirmation via Africa's Talking
- Returns Safaricom-expected acknowledgement

---

## 7. Library Modules (src/lib/)

| Module | Exports | Purpose |
|--------|---------|---------|
| `supabase.ts` | `supabase`, `createServiceClient()` | Supabase browser + service-role clients |
| `mpesa.ts` | `getAccessToken()`, `initiateSTKPush()`, `formatKenyanPhone()` | Safaricom M-Pesa integration (sandbox + prod) |
| `sms.ts` | `sendSMS()`, `orderConfirmationMessage()`, `deliveryCompleteMessage()` | Africa's Talking SMS with templates |
| `pricing.ts` | `getPricePerJug()`, `calculateTotal()`, `getPricingTable()` | Volume-based tiered pricing engine |
| `i18n.ts` | `t()`, `getStoredLang()`, `setStoredLang()` | 100+ keys in English and Swahili |
| `LangContext.tsx` | `LangProvider`, `useLang()` | React Context for language state |
| `types/index.ts` | Enums + Interfaces | OrderStatus, PaymentStatus, UserRole, Profile, Zone, Order, Payment, etc. |

---

## 8. Database Schema (Supabase / PostgreSQL)

### Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `profiles` | id (UUID PK), role, full_name, phone (UNIQUE) | All user accounts |
| `zones` | id, name, active | 10 Nairobi zones seeded |
| `orders` | id, customer_id, distributor_id, quantity, price_total, status, mpesa_ref | Realtime enabled |
| `payments` | id, order_id (FK), mpesa_checkout_id, mpesa_receipt, status, raw_callback (JSONB) | Linked to orders |
| `distributors` | id (FK profiles), zone_id (FK), depot_name, active | Depot operators |
| `riders` | id, full_name, phone (UNIQUE), vehicle_type, zone_id, status | Delivery personnel |
| `kiosks` | id, business_name, phone, zone_id, business_type, price_per_jug, verified, rating | Water providers |
| `config` | key (PK), value | App settings (jug_price, delivery_fee) |

### Enums

- **order_status:** pending_payment → paid → confirmed → out_for_delivery → delivered → cancelled
- **payment_status:** pending → success → failed
- **user_role:** customer, distributor, admin
- **vehicle_type:** bicycle, motorcycle, car
- **business_type:** borehole, vendor, utility

### Security

- **Row-Level Security (RLS)** on all tables
- **Realtime** enabled on `orders`
- **Indexes** on customer_id, zone_id, status, created_at

---

## 9. Pricing Model

| Quantity | Price/Jug (KES) | Total (KES) |
|----------|-----------------|-------------|
| 1 jug | 420 | 420 |
| 2 jugs | 410 | 820 |
| 3 jugs | 400 | 1,200 |
| 5 jugs | 390 | 1,950 |
| 7 jugs | 375 | 2,625 |
| 9+ jugs | 360 | 3,240+ |

**Delivery:** Free on all orders

---

## 10. External APIs & Integrations

| Service | Purpose | Mode |
|---------|---------|------|
| **Safaricom M-Pesa** (Daraja API) | STK Push payments | Sandbox / Production |
| **Africa's Talking** | SMS notifications | Sandbox / Production |
| **Google Maps** | Geocoding and map display | Planned |
| **Supabase Realtime** | Live order status updates | Active |

### Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `MPESA_CONSUMER_KEY` | Safaricom API consumer key |
| `MPESA_CONSUMER_SECRET` | Safaricom API consumer secret |
| `MPESA_SHORTCODE` | M-Pesa business shortcode |
| `MPESA_PASSKEY` | M-Pesa Lipa Na passkey |
| `MPESA_CALLBACK_URL` | Webhook URL for payment callbacks |
| `AT_API_KEY` | Africa's Talking API key |
| `AT_USERNAME` | Africa's Talking username |

---

## 11. Internationalization (i18n)

- **Languages:** English (en) + Swahili (sw)
- **Coverage:** 100+ translation keys
- **Persistence:** localStorage
- **Switcher:** Language toggle in Navbar

---

## 12. Key Features Summary

| Area | Features |
|------|----------|
| **Ordering** | Address input, quantity selector, tiered pricing, voucher codes |
| **Payments** | M-Pesa STK Push, payment status tracking, callback processing |
| **Tracking** | Uber/Bolt-style live tracking, rider card, ETA, 6-step timeline |
| **Notifications** | SMS order confirmation + delivery complete |
| **Referrals** | Share code, 10L reward per friend, tiered rewards |
| **Kiosks** | Provider directory, list/map view, ratings, zone filter |
| **Distributor** | Real-time order queue, accept/deliver workflow, daily stats |
| **Admin** | KPI dashboard, zone breakdown, order/distributor/zone/pricing management |
| **Onboarding** | Multi-step forms for providers and riders |
| **Impact** | CSR/donation page, success stories, partner CTA |
| **i18n** | English + Swahili with in-app toggle |

---

## 13. Project Structure

```
MiMaji/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Tailwind theme & animations
│   │   ├── signup/page.tsx             # Customer signup
│   │   ├── login/page.tsx              # Customer login
│   │   ├── orders/page.tsx             # Order history
│   │   ├── order/[id]/page.tsx         # Order detail + tracking
│   │   ├── track/page.tsx              # Live tracking
│   │   ├── kiosks/page.tsx             # Water provider directory
│   │   ├── impact/page.tsx             # Impact / CSR page
│   │   ├── referrals/page.tsx          # Referral program
│   │   ├── join/
│   │   │   ├── provider/page.tsx       # Provider onboarding
│   │   │   └── rider/page.tsx          # Rider onboarding
│   │   ├── distributor/
│   │   │   ├── page.tsx                # Distributor login
│   │   │   └── dashboard/page.tsx      # Distributor dashboard
│   │   ├── admin/page.tsx              # Admin panel
│   │   └── api/
│   │       ├── orders/route.ts         # Order creation endpoint
│   │       └── mpesa/callback/route.ts # M-Pesa webhook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── shared/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── OTPLogin.tsx
│   │   │   ├── PromoPopup.tsx
│   │   │   └── ClientProviders.tsx
│   │   ├── order/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── AddressInput.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   ├── PriceBreakdown.tsx
│   │   │   └── HowItWorks.tsx
│   │   └── tracking/
│   │       ├── StatusStepper.tsx
│   │       └── StatusCard.tsx
│   └── lib/
│       ├── supabase.ts
│       ├── mpesa.ts
│       ├── sms.ts
│       ├── pricing.ts
│       ├── i18n.ts
│       ├── LangContext.tsx
│       └── types/index.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_riders_and_kiosks.sql
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env.local
```

---

*Document generated for MiMaji — Fresh Water Delivered Today*
