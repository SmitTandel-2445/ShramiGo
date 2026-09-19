# ShramiGo Architecture

ShramiGo is a full-stack platform consisting of a React/Vite web application, a React Native (Expo) mobile application, and a FastAPI/SQLAlchemy backend backed by PostgreSQL in production.

## 📱 Frontend & Mobile Clients

### 1. Web Frontend (`apps/frontend`)
- `frontend/src/App.tsx` owns the browser route tree.
- `frontend/src/features/` implements feature-sliced domains (auth, bookings, workers, customers, admin).
- `frontend/src/services/` contains the web API client and domain services.

### 2. Expo Mobile Application (`apps/shramigo-expo`)
- `app/` owns the file-based route hierarchy leveraging Expo Router (`(auth)`, `(customer)`, `(worker)`, `(admin)`).
- `src/contexts/` contains `AuthContext` (JWT backed by `expo-secure-store`), `LanguageContext` (English/Hindi toggle), and `NotificationContext`.
- `src/services/` contains domain API clients with graceful offline fallback.

## ⚙️ Backend (`apps/backend`)
- `backend/app/routers/` exposes RESTful HTTP endpoints.
- `backend/app/schemas/` contains authoritative request/response validation (Pydantic).
- `backend/app/models/` contains SQLAlchemy persistence models.
- `backend/alembic/` contains schema migrations.

## 🔐 Authentication & Security

Authentication is bearer-token based for compatibility across both Web and Mobile clients. The backend loads the user from the token subject, checks account state, and enforces role ownership on protected resources. Frontend/mobile route guards are a user-experience layer only.

- Web stores tokens in `localStorage`/memory.
- Mobile stores tokens securely using hardware-backed `expo-secure-store`.
- Refresh sessions are stored as hashed opaque tokens in `refresh_tokens`; refresh rotates and revokes the previous token. Redis provides shared login rate-limit counters.

## 💳 Payments & Calculations

Razorpay is accessed through `backend/app/services/payment/` rather than from booking business logic.

Money is stored with SQLAlchemy `Numeric` and represented as `Decimal`. Booking `subtotal` is the service amount, `service_charge` is the platform fee, `total_amount` is the customer total, and `worker_payout` is the worker settlement amount.

## 📍 Geolocation & Discovery

Nearby discovery uses validated worker/customer coordinates and a Haversine calculation. PostgreSQL/PostGIS is intentionally deferred because the current MVP needs portable SQLAlchemy/PostgreSQL deployment without a PostGIS operational dependency; the endpoint and profile fields are ready for a future spatial index migration.

## ⏰ Timestamps & Local Time

Timestamps are stored in UTC-style naive database columns for compatibility with the existing schema. Booking date/time validation uses the server's configured UTC interpretation; a future migration should make timezone-aware columns explicit if local-time booking is required.
