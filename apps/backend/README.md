# ShramiGo Backend

Backend scaffold and API services for the ShramiGo Cooperative Gig Services Platform, built with FastAPI, SQLAlchemy, Alembic, and PostgreSQL.

---

## Prerequisites

- **Python 3.10+**
- **PostgreSQL** (or SQLite/Redis as configured)

---

## Setup & Installation

1. **Navigate to the backend directory:**

   ```bash
   cd apps/backend
   ```

2. **Create a Python Virtual Environment:**

   ```bash
   python -m venv .venv
   ```

3. **Activate the Virtual Environment:**
   - **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD):**
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
   - **Linux / macOS:**
     ```bash
     source .venv/bin/activate
     ```

4. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Configuration:**
   Copy `.env` sample or configure environment variables:
   ```bash
   # Ensure DATABASE_URL, SECRET_KEY, etc. are set in your .env file
   ```

---

## Database Setup, Migrations & Seeding

### 1. Database Migrations

Run database migrations to initialize or update the database schema:

```bash
alembic upgrade head
```

_(Optional)_ Create an initial standalone admin user:

```bash
python create_admin.py --email admin@shramigo.com --password admin123 --name "Platform Admin" --phone 9876500001
```

---

### 2. Large-Scale Realistic Database Seeding (`seed_demo.py`)

The repository includes a high-performance, batched SQLAlchemy ORM seeding generator that populates hundreds of randomized, production-realistic records with full relational integrity.

#### Quick Start

To reset and seed the default dataset (~100 users, 250 bookings, 150+ reviews, payments, notifications):

```bash
python seed_demo.py --reset
```

#### Custom Scale Seeding

You can customize the volume of generated entities via CLI parameters:

```bash
# Seed 100 customers, 100 workers, and 500 bookings
python seed_demo.py --reset --customers 100 --workers 100 --bookings 500
```

#### CLI Parameters

| Flag | Type | Default | Description |
|---|---|---|---|
| `--reset` | Boolean flag | `False` | Clears all existing application records before seeding. |
| `--customers` | Integer | `50` | Number of customer accounts and profiles to generate. |
| `--workers` | Integer | `50` | Number of trade worker accounts, profiles, skills, and availability schedules to generate. |
| `--bookings` | Integer | `250` | Number of bookings across all statuses (`completed`, `confirmed`, `in_progress`, `pending`, `cancelled`). |

#### ORM Architecture & Seeding Highlights

- **Batched SQLAlchemy Flushes**: Uses staged multi-entity flushes (`db.flush()`) to minimize network round-trips to remote databases (e.g. Supabase PostgreSQL), generating hundreds of records in seconds.
- **Relational Integrity**: Generates full cascading relationships from `User` -> `CustomerProfile` / `WorkerProfile` -> `WorkerService` -> `WorkerSkill` -> `WorkerAvailability` -> `Booking` -> `Payment` & `Review` -> `Notification`.
- **Realistic Data Distribution**:
  - **11 Trade Services**: Electrical, Plumbing, Cleaning, Deep Cleaning, Sofa Cleaning, Carpentry, Painting, AC Repair, Appliance Repair, Driver, and Masonry.
  - **Geo-Coordinates & Addresses**: Real street addresses and GPS coordinates mapped across Indian metropolitan hubs (Pune, Mumbai, Bengaluru, Delhi, Ahmedabad).
  - **Authentic Reviews & Ratings**: Realistic 3–5 star distribution with natural feedback comments, allowing realistic calculation of worker average ratings and review counts.
  - **Payment Histories**: Matched Razorpay transaction IDs and Cash receipts with timestamps.

#### Default Demo Login Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Customer** | `customer@shramigo.com` | `customer123` | Demo customer with Pune address & active bookings |
| **Worker** | `worker@shramigo.com` | `worker123` | Master Electrician & AC technician with 4.9 rating |
| **Admin** | `admin@shramigo.com` | `admin123` | Platform Administrator |
| **Support** | `support@shramigo.com` | `admin123` | Support Lead |

*(All generated bulk customer and worker accounts also use `customer123` and `worker123` respectively).*

---

## Running the Server

Start the development server using **Uvicorn**:

```bash
uvicorn app.main:app --reload
```

By default, the server runs at `http://127.0.0.1:8000`. You can access interactive API documentation at:

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

To specify custom host and port:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Running Tests

Run test suites with `pytest`:

```bash
pytest
```

---

## Production & Third-Party Services

### Razorpay Integration

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in `.env` from Razorpay test or live mode. Register `POST /api/payments/webhook/razorpay` in the Razorpay Dashboard. The browser may create a checkout and submit the provider response, but the backend verifies both the checkout signature and webhook before marking a payment as paid.

### Redis Throttling

Set `REDIS_URL` to a shared Redis instance for login throttling. When Redis is unavailable, the application fails open for availability, so production monitoring should alert on Redis failures.

### Authentication & Token Rotation

Use `POST /api/auth/refresh` to rotate refresh tokens and `POST /api/auth/logout` to revoke tokens. Raw refresh tokens are never stored directly in the database.
