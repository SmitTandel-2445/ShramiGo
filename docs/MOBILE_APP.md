# ShramiGo Mobile App Documentation

This document outlines the architecture, design, and implementation specifics of the **ShramiGo Expo Mobile Application** (`apps/shramigo-expo`).

---

## 🏗️ Architecture Overview

The mobile application is built with **React Native** and **Expo SDK 52**, utilizing **Expo Router v4** for file-system-based routing.

### Directory Structure
- **`app/`**: File-based routes matching the screen hierarchy.
  - `_layout.tsx`: Root provider wrapper (`AuthProvider`, `LanguageProvider`, `NotificationProvider`, `SafeAreaProvider`).
  - `welcome.tsx`: Role selection and onboarding gateway.
  - `(auth)/`: Authentication screens (Customer Login, Worker Login, Admin Login, Customer/Worker Registration).
  - `(customer)/`: Customer tab navigation (`home`, `search`, `bookings`, `ai-match`, `profile`, `notifications`).
  - `(worker)/`: Worker tab navigation (`dashboard`, `jobs`, `earnings`, `skills`, `welfare`, `profile`, `notifications`).
  - `(admin)/`: Mobile Admin tab navigation (`dashboard`, `bookings`, `users`, `workers`, `reports`).
- **`src/contexts/`**:
  - `AuthContext.tsx`: Manages user session state, JWT tokens, and user profile data stored in `expo-secure-store`.
  - `LanguageContext.tsx`: Provides dynamic bilingual translations (**English** & **Hindi**) across all UI strings with an active toggle.
  - `NotificationContext.tsx`: Manages in-app push notifications and alerts.
- **`src/services/`**:
  - `api.ts`: Central Axios client configured with authorization headers, base URL handling, and timeout configurations.
  - `auth.ts`, `bookings.ts`, `workers.ts`, `services.ts`, `admin.ts`: Domain-specific API interaction methods with resilient mock fallbacks for seamless offline testing.
- **`src/components/`**:
  - Reusable, theme-consistent UI components styled with curated design tokens (primary palette: `#2563EB`, `#1E40AF`, `#10B981`, `#F59E0B`, `#EF4444`).

---

## 🔄 User Roles and Feature Matrix

| Feature / Screen | Customer Portal | Worker Portal | Admin Portal |
| :--- | :---: | :---: | :---: |
| **Authentication & Profile** | ✅ | ✅ | ✅ |
| **Service Browsing & Search** | ✅ | ❌ | ❌ |
| **AI Worker Matchmaker** | ✅ | ❌ | ❌ |
| **Booking Creation & Management** | ✅ | ✅ | ✅ |
| **Real-time Job Alerts & Status Updates**| ❌ | ✅ | ❌ |
| **Earnings & Payout Tracker** | ❌ | ✅ | ❌ |
| **Skills & Identity Verification** | ❌ | ✅ | ❌ |
| **Emergency Welfare & Support** | ❌ | ✅ | ❌ |
| **User & Worker Management** | ❌ | ❌ | ✅ |
| **Dispute Resolution & Audit Reports** | ❌ | ❌ | ✅ |
| **Bilingual Toggle (EN / HI)** | ✅ | ✅ | ✅ |

---

## 🔒 Security & Session Storage

1. **Hardware-Backed Storage**: Auth tokens and user state are saved via `expo-secure-store` on iOS Keychain and Android KeyStore, replacing unencrypted browser storage.
2. **Bearer Token Interceptor**: All outgoing API requests automatically attach the `Authorization: Bearer <token>` header when available.
3. **Automatic Logout**: On HTTP 401 Unauthorized errors, the session is cleared and the user is redirected to `/welcome`.

---

## 🌐 Network Configuration & Local Development

When testing on a physical device using **Expo Go**:
1. Connect your mobile phone to the same Wi-Fi network as your development computer.
2. Update `.env` in `apps/shramigo-expo`:
   ```env
   EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api/v1
   ```
3. Start the server:
   ```bash
   npm start
   ```
