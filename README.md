# ShramiGo Monorepo

Welcome to the ShramiGo monorepo! This repository contains the entire ShramiGo platform, organized as a monorepo using **PNPM Workspaces**. It houses the frontend React application, the backend API, and shared TypeScript contracts.

## 📂 Folder Structure

The project has been refactored into a feature-sliced architecture.

```
ShramiGo/
├── pnpm-workspace.yaml     # PNPM Workspace Configuration
├── package.json            # Root configuration
├── apps/
│   ├── frontend/           # React/Vite Frontend Application (Feature-Sliced Design)
│   │   ├── src/
│   │   │   ├── app/        # App layer (routing, layouts, providers)
│   │   │   ├── features/   # Feature-wise modules (auth, bookings, workers, etc.)
│   │   │   ├── components/ # Shared UI components (common, ui)
│   │   │   ├── lib/        # API clients and utilities
│   │   │   └── stores/     # State management
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
- PNPM (`npm install -g pnpm`)
- Python (v3.9+)

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

### Running Locally

**Start the Frontend Development Server:**
```bash
# From root
pnpm dev

# Or from apps/frontend
cd apps/frontend
pnpm dev
```
The frontend will start at `http://localhost:5173`.

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


## 🏗️ Architecture: Feature-Sliced Design (Frontend)

The frontend uses the Feature-Sliced Design to maintain scalability:
- **`app/`**: Global initialization (Router, Context, Global Layouts).
- **`features/`**: Business logic, partitioned by domain (e.g. `auth`, `bookings`, `workers`). Each feature folder contains its own pages, services, data, and sub-components.
- **`components/`**: Only generic, reusable UI (Buttons, Cards, Inputs).
- **`lib/`**: Global utilities, constants, and API instances.

## 📦 Shared Contracts (`packages/contracts`)
Contains `booking.ts`, `customer.ts`, `service.ts`, `worker.ts`, and other cross-cutting models. The frontend depends on this via the `@shramigo/contracts` workspace alias.
