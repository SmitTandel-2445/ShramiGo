# ShramiGo Expo Mobile Application

The official cross-platform mobile client for **ShramiGo** (श्रमिGo) built with **React Native**, **Expo SDK 52**, and **Expo Router**.

---

## 📱 Features

- **Role-Based Portals**:
  - **Customer Portal**: Discover local verified workers, filter by category & location, instant booking, and AI-powered dynamic matchmaker.
  - **Worker Portal**: Job alerts, request acceptance/rejection, daily/weekly earnings tracker, skill badges, verification status, and welfare emergency assistance.
  - **Admin Portal**: Platform dashboard metrics, worker identity approvals, user management, and booking dispute resolution.
- **Multilingual Support**: Real-time language switcher supporting **English** and **Hindi (हिन्दी)**.
- **Secure Authentication**: JWT-based authentication persisted securely on native hardware using `expo-secure-store`.
- **Offline / Mock Resilience**: Built-in mock fallbacks and graceful degradation for unstable connectivity.
- **File-Based Routing**: Clean nested navigation leveraging `@expo/router`.

---

## 📂 Project Structure

```
apps/shramigo-expo/
├── app/                        # Expo Router file-based route hierarchy
│   ├── _layout.tsx             # Root layout with Auth, Language & Notification providers
│   ├── index.tsx               # Entry redirect handler
│   ├── welcome.tsx             # Onboarding & role-selection screen
│   ├── (auth)/                 # Authentication routes (login, register, admin-login)
│   ├── (customer)/             # Customer tabs (home, search, bookings, profile, ai-match)
│   ├── (worker)/               # Worker tabs (dashboard, jobs, earnings, skills, welfare, profile)
│   └── (admin)/                # Admin tabs (dashboard, bookings, users, workers, reports)
├── src/
│   ├── components/             # Reusable UI primitives (Header, StatCard, Badge, Button, etc.)
│   ├── contexts/               # React Contexts (AuthContext, LanguageContext, NotificationContext)
│   ├── services/               # API clients (api.ts, auth.ts, bookings.ts, workers.ts, etc.)
│   └── types/                  # TypeScript interfaces and shared type declarations
├── assets/                     # App icons, splash screens, and static images
├── app.json                    # Expo application configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Expo Go App**: Install from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS).

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd apps/shramigo-expo
   ```

2. Install dependencies with legacy peer flag:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure Environment:
   Create a `.env` file from `.env.example`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
   > **Note for Physical Devices (Expo Go)**: Replace `localhost` with your machine's local network IP address (e.g., `http://192.168.1.100:8000/api/v1`).

---

## 🏃 Running the App

Start the Expo development server:

```bash
npm start
```

### Options:
- **Expo Go (Physical Device)**: Scan the generated QR code using the Expo Go camera (Android) or default Camera app (iOS).
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS required).
- **Web Preview**: Press `w` in the terminal.

---

## 🛠️ Key Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Launches the Expo interactive development bundler |
| `npm run android` | Launches the app on connected Android emulator / device |
| `npm run ios` | Launches the app on iOS Simulator |
| `npm run web` | Bundles and runs the application in the web browser |
| `npx tsc --noEmit` | Runs full TypeScript type verification |

---

## 🔐 Authentication & Roles

| Role | Default / Test Credentials | Landing Route |
| :--- | :--- | :--- |
| **Admin** | `joan@gmail.com` / `joan123` | `/(admin)/dashboard` |
| **Worker** | Create via Worker Register screen | `/(worker)/dashboard` |
| **Customer** | Create via Customer Register screen | `/(customer)/home` |
