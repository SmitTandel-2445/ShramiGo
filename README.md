# ShramiGo Monorepo

Welcome to the ShramiGo monorepo! This repository contains the entire ShramiGo platform, organized as a monorepo using **PNPM Workspaces**. It houses the frontend React application, the backend API, and shared TypeScript contracts.

## 📂 Folder Structure

The project has been refactored into a feature-sliced architecture.

```
ShramiGo/
├── pnpm-workspace.yaml     # PNPM Workspace Configuration
├── package.json            # Root configuration
├── apps/
│   ├── frontend/           # React/Vite Frontend Web Application (Feature-Sliced Design)
│   │   ├── src/
│   │   │   ├── app/        # App layer (routing, layouts, providers)
│   │   │   ├── features/   # Feature-wise modules (auth, bookings, workers, etc.)
│   │   │   ├── components/ # Shared UI components (common, ui)
│   │   │   ├── lib/        # API clients and utilities
│   │   │   └── stores/     # State management
│   │   └── package.json
│   │
│   ├── shramigo-expo/      # React Native Expo Mobile Application (Expo Router)
│   │   ├── app/            # File-based navigation (auth, customer, worker, admin)
│   │   ├── src/            # Components, contexts, services, and hooks
│   │   └── package.json
│   │
│   └── backend/            # Python FastAPI Backend
│       ├── app/
│       ├── tests/
│       └── requirements.txt
│
└── packages/
    └── contracts/          # Shared TypeScript types for full-stack consistency
        ├── src/
        └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PNPM (`npm install -g pnpm`) or NPM
- Python (v3.9+)
- Expo CLI (`npm install -g expo-cli`) or Expo Go app on iOS/Android

### Installation

1. **Install dependencies for the entire workspace:**
   ```bash
   pnpm install
   ```

2. **Build the shared contracts package:**
   ```bash
   cd packages/contracts
   pnpm build
   ```
   *(Alternatively, run from root: `pnpm --filter @shramigo/contracts build`)*

3. **Install Backend Dependencies:**
   ```bash
   cd apps/backend
   pip install -r requirements.txt
   ```

4. **Install Expo Mobile App Dependencies:**
   ```bash
   cd apps/shramigo-expo
   npm install --legacy-peer-deps
   ```

### Running Locally

**Start the Frontend Web Development Server:**
```bash
# From root
pnpm dev

# Or from apps/frontend
cd apps/frontend
pnpm dev
```
The web frontend will start at `http://localhost:5173`.

**Start the Expo Mobile Development Server:**
```bash
cd apps/shramigo-expo
npm start
```
- Press `a` for Android emulator, `i` for iOS simulator, or `w` for web preview.
- Scan the QR code with the **Expo Go** app on your physical iOS/Android phone to run natively.

**Start the Backend Server:**
```bash
cd apps/backend
uvicorn app.main:app --reload
```

The backend API will start at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

### 🔑 Local Seed & Default Admin Setup

To set up or seed a default administrative user for local development and testing:

```bash
cd apps/backend
python create_admin.py --email joan@gmail.com --password joan123 --name "Joan Admin" --phone 9876500000
```

> **Default Seed Credentials (Local Development):**
> - **Admin Portal / API**: `joan@gmail.com` / `joan123` (generated via `create_admin.py`)
> - **Customer / Worker Portals**: New user accounts can be created locally via the registration flow or seeding scripts.


## 🏗️ Architecture: Frontend & Mobile

### Web Application (`apps/frontend`)
The web frontend uses the Feature-Sliced Design to maintain scalability:
- **`app/`**: Global initialization (Router, Context, Global Layouts).
- **`features/`**: Business logic, partitioned by domain (e.g. `auth`, `bookings`, `workers`). Each feature folder contains its own pages, services, data, and sub-components.
- **`components/`**: Only generic, reusable UI (Buttons, Cards, Inputs).
- **`lib/`**: Global utilities, constants, and API instances.

### Mobile Application (`apps/shramigo-expo`)
The mobile application is built using React Native with Expo Router (file-based navigation):
- **`app/`**: Route hierarchy with role-segregated tab groups:
  - `(auth)`: Login & registration flows for Customers, Workers, and Admins.
  - `(customer)`: Customer tabs (Explore/Services, Search, Bookings, AI Matchmaker, Profile).
  - `(worker)`: Worker tabs (Dashboard, Jobs, Earnings, Skills, Welfare, Profile).
  - `(admin)`: Admin tabs (Overview Metrics, Verification & Approvals, User/Worker Management, Bookings, Reports).
- **`src/contexts/`**: `AuthContext` (backed by `expo-secure-store`), `LanguageContext` (English & Hindi support), and `NotificationContext`.
- **`src/services/`**: Modular API integration mirroring the backend endpoints.

## 📦 Shared Contracts (`packages/contracts`)
Contains `booking.ts`, `customer.ts`, `service.ts`, `worker.ts`, and other cross-cutting models. The frontend depends on this via the `@shramigo/contracts` workspace alias.
