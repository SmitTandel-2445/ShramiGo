import argparse
from datetime import date, time, timedelta
from decimal import Decimal

from sqlalchemy import delete

from app.core.database import Base, SessionLocal
from app.core.security import hash_password
from app.features.auth.customer_profile import CustomerProfile
from app.features.auth.user import User, UserRole
from app.features.bookings.models import Booking
from app.features.services.models import Service
from app.features.services.seed import SERVICES
from app.features.workers.availability import WorkerAvailability
from app.features.workers.profile import WorkerProfile
from app.features.workers.skill import WorkerSkill
from app.features.workers.worker_service import WorkerService

DEMO_USERS = {
    "customer@shramigo.com": {
        "full_name": "Demo Customer",
        "phone": "9876500001",
        "role": UserRole.CUSTOMER,
        "password": "customer123",
    },
    "worker@shramigo.com": {
        "full_name": "Demo Worker",
        "phone": "9876500002",
        "role": UserRole.WORKER,
        "password": "worker123",
    },
    "admin@shramigo.com": {
        "full_name": "Demo Admin",
        "phone": "9876500003",
        "role": UserRole.ADMIN,
        "password": "admin123",
    },
}


def clear_application_data(db) -> None:
    for table in reversed(Base.metadata.sorted_tables):
        if table.name != "alembic_version":
            db.execute(delete(table))


def get_or_create_users(db) -> dict[str, User]:
    users = {}
    for email, data in DEMO_USERS.items():
        password = data["password"]
        user_data = {key: value for key, value in data.items() if key != "password"}
        user = User(
            email=email,
            password_hash=hash_password(password),
            is_active=True,
            is_verified=True,
            **user_data,
        )
        db.add(user)
        users[email] = user

    db.flush()
    return users


def seed_services(db) -> dict[str, Service]:
    services = {}
    for data in SERVICES:
        service = Service(**data)
        db.add(service)
        services[data["name"]] = service

    db.flush()
    return services


def seed_demo(reset: bool) -> None:
    db = SessionLocal()
    try:
        if reset:
            clear_application_data(db)

        users = get_or_create_users(db)
        customer = users["customer@shramigo.com"]
        worker = users["worker@shramigo.com"]
        services = seed_services(db)

        db.add(
            CustomerProfile(
                user_id=customer.id,
                address="12 Lake View Road",
                city="Pune",
                state="Maharashtra",
                pincode="411001",
                latitude=18.5204,
                longitude=73.8567,
            )
        )
        db.add(
            WorkerProfile(
                user_id=worker.id,
                address="45 Green Park",
                city="Pune",
                state="Maharashtra",
                pincode="411004",
                bio="Reliable home-service professional for cleaning and repairs.",
                experience_years=6,
                latitude=18.5314,
                longitude=73.8446,
                service_radius_km=15,
            )
        )
        for service_name, price in (
            ("Home Cleaning", Decimal("650")),
            ("Plumbing Repair", Decimal("450")),
            ("Electrical Repair", Decimal("500")),
        ):
            db.add(
                WorkerService(
                    worker_id=worker.id,
                    service_id=services[service_name].id,
                    custom_price=price,
                    is_active=True,
                )
            )
        db.add_all(
            [
                WorkerSkill(
                    worker_id=worker.id, skill_name="Home Cleaning", category="Cleaning"
                ),
                WorkerSkill(
                    worker_id=worker.id, skill_name="Plumbing", category="Plumbing"
                ),
                WorkerSkill(
                    worker_id=worker.id,
                    skill_name="Electrical Work",
                    category="Electrical",
                ),
            ]
        )
        for day in ("monday", "tuesday", "wednesday", "thursday", "friday"):
            db.add(
                WorkerAvailability(
                    worker_id=worker.id,
                    day_of_week=day,
                    start_time=time(9),
                    end_time=time(18),
                    is_available=True,
                )
            )

        today = date.today()
        jobs = (
            (
                "Home Cleaning",
                today + timedelta(days=1),
                time(10),
                2,
                "Please clean the kitchen and living room.",
                "confirmed",
                "paid",
            ),
            (
                "Plumbing Repair",
                today + timedelta(days=3),
                time(14),
                1,
                "The kitchen tap is leaking.",
                "pending",
                "pending",
            ),
            (
                "Electrical Repair",
                today - timedelta(days=2),
                time(11),
                2,
                "Install two ceiling lights.",
                "completed",
                "paid",
            ),
        )
        for (
            service_name,
            booking_date,
            booking_time,
            hours,
            description,
            status,
            payment_status,
        ) in jobs:
            hourly_rate = services[service_name].base_price
            subtotal = hourly_rate * hours
            service_charge = Decimal("30")
            db.add(
                Booking(
                    customer_id=customer.id,
                    worker_id=worker.id,
                    service_id=services[service_name].id,
                    booking_date=booking_date,
                    booking_time=booking_time,
                    hours=hours,
                    service_address="12 Lake View Road, Pune, Maharashtra 411001",
                    description=description,
                    hourly_rate=hourly_rate,
                    subtotal=subtotal,
                    service_charge=service_charge,
                    total_amount=subtotal + service_charge,
                    worker_payout=subtotal,
                    status=status,
                    payment_method="cash",
                    payment_status=payment_status,
                )
            )

        db.commit()
        print("Demo data seeded successfully.")
        print("Users: customer@shramigo.com, worker@shramigo.com, admin@shramigo.com")
        print("Passwords: customer123, worker123, admin123")
        print("Bookings: 3")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed local or configured demo data.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete all application data before inserting the demo dataset.",
    )
    args = parser.parse_args()
    seed_demo(reset=args.reset)
