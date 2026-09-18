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
   cd shramigo_update/backend
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

## Database Setup & Migrations

Run database migrations to initialize or update the database schema:

```bash
alembic upgrade head
```

*(Optional)* Create an initial admin user:
```bash
python create_admin.py
```

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
