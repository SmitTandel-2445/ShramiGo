import argparse
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
import random

from sqlalchemy import delete

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.features.auth.customer_profile import CustomerProfile
from app.features.auth.refresh_token import RefreshToken
from app.features.auth.user import User, UserRole
from app.features.bookings.models import Booking
from app.features.notifications.models import Notification
from app.features.payments.models import Payment
from app.features.reviews.models import Review
from app.features.services.models import Service
from app.features.services.seed import SERVICES
from app.features.workers.availability import WorkerAvailability
from app.features.workers.profile import WorkerProfile
from app.features.workers.skill import WorkerSkill
from app.features.workers.worker_service import WorkerService

# ==============================================================================
# REALISTIC DATASETS & LOOKUPS
# ==============================================================================

CITIES = [
    {"city": "Pune", "state": "Maharashtra", "pincode_prefix": "411", "lat": 18.5204, "lon": 73.8567, "areas": ["Baner", "Kothrud", "Koregaon Park", "Viman Nagar", "Hadapsar", "Aundh", "Shivaji Nagar", "Wakad", "Hinjewadi", "Deccan", "Katraj", "Magarpatta"]},
    {"city": "Mumbai", "state": "Maharashtra", "pincode_prefix": "400", "lat": 19.0760, "lon": 72.8777, "areas": ["Bandra West", "Andheri East", "Powai", "Juhu", "Borivali", "Dadar", "Colaba", "Malad", "Goregaon", "Thane West"]},
    {"city": "Bengaluru", "state": "Karnataka", "pincode_prefix": "560", "lat": 12.9716, "lon": 77.5946, "areas": ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "JP Nagar", "Electronic City", "Malleshwaram"]},
    {"city": "Delhi", "state": "Delhi", "pincode_prefix": "110", "lat": 28.6139, "lon": 77.2090, "areas": ["Connaught Place", "South Extension", "Lajpat Nagar", "Hauz Khas", "Dwarka", "Rohini", "Saket", "Vasant Kunj"]},
    {"city": "Ahmedabad", "state": "Gujarat", "pincode_prefix": "380", "lat": 23.0225, "lon": 72.5714, "areas": ["Navrangpura", "Satellite", "Bodakdev", "Vastrapur", "Prahlad Nagar", "Maninagar", "SG Highway"]},
]

FIRST_NAMES_MALE = [
    "Aarav", "Ramesh", "Suresh", "Amit", "Rajesh", "Deepak", "Manoj", "Vikas", "Imran",
    "Rahul", "Vikram", "Sanjay", "Kunal", "Arjun", "Nitin", "Mahesh", "Ashok", "Prakash",
    "Ganesh", "Sachin", "Ajay", "Vijay", "Anil", "Sunil", "Ravi", "Dinesh", "Pradeep", "Santosh"
]

FIRST_NAMES_FEMALE = [
    "Sunita", "Anita", "Priya", "Ananya", "Sneha", "Kavita", "Pooja", "Meera", "Ritu",
    "Divya", "Preeti", "Swati", "Geeta", "Shruti", "Jyoti", "Rekha", "Shweta", "Neha",
    "Suman", "Lata", "Aarti", "Shilpa", "Payal", "Kajal", "Sheetal", "Komal", "Deepa"
]

LAST_NAMES = [
    "Patel", "Sharma", "Mistry", "Verma", "Shinde", "Patil", "Gupta", "Yadav", "Deshmukh",
    "Rao", "Joshi", "Kulkarni", "Mehta", "Suthar", "Rathore", "Gaikwad", "Khan", "Jadhav",
    "Kumar", "Singh", "Shah", "Nair", "Reddy", "Chauhan", "Pandey", "Mishra", "Thakur", "Choudhary"
]

PORTRAIT_IMAGES = [
    "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80",
]

SERVICE_SKILLS_MAP = {
    "Electrical Repair": [
        ("Wiring & Circuit Breakers", "Short circuit isolation, fuse box upgrades, and DB installation."),
        ("Inverter & UPS Setup", "Battery health checks, inverter wiring, and backup power maintenance."),
        ("Ceiling Fan & Chandelier Fitting", "Heavy light fixtures, modular switches, and decorative lighting installation."),
    ],
    "Plumbing Repair": [
        ("Leakage Fix & Pipe Repair", "PPR, CPVC, and copper pipe soldering, joint sealing, and water pressure balancing."),
        ("Sanitary & Tap Installation", "Mixers, diverters, commodes, shower panels, and vanity fittings."),
        ("Drain Unblocking & Jet Cleaning", "Heavy drainage blockages, kitchen trap cleaning, and sewer line clearing."),
    ],
    "Home Cleaning": [
        ("Complete Home Sanitization", "Eco-friendly disinfectant surface wiping, sweeping, and deep mop."),
        ("Kitchen & Countertop Scrubbing", "Stove degreasing, backsplash descaling, and cabinet shelf wiping."),
    ],
    "Deep Cleaning": [
        ("Move-in Deep Clean", "Full scrubbing of window channels, doors, switch plates, and balcony floors."),
        ("Bathroom Tile Descaling", "Hard water stain removal, grout bleaching, and acid-free tile buffing."),
    ],
    "Sofa Cleaning": [
        ("Upholstery & Fabric Shampooing", "Wet vacuum extraction, pet hair removal, and fabric revitalization."),
        ("Leather Conditioning", "Moisturizing leather cleaner and protective buffing."),
    ],
    "Carpentry": [
        ("Furniture Assembly & Repair", "Modular bed, wardrobe, dining table, and shelving assembly."),
        ("Door Locks & Hydraulic Hinges", "Smart digital lock installation, soft-close channel alignment, and latch fixing."),
    ],
    "Painting": [
        ("Interior Wall Emulsion", "Royale luxury finish, damp-proof primer coat, and putty smoothening."),
        ("Texture & Accent Walls", "Geometric stencil work, metallic textures, and waterproof exterior coating."),
    ],
    "AC Repair": [
        ("Jet Pump Deep Wash", "High-pressure foam wash for indoor and outdoor cooling fins."),
        ("Gas Leak Detection & Top-up", "R32 and R410A refrigerant charging and vacuum pressure testing."),
        ("PCB & Capacitor Diagnostics", "Inverter circuit board repair, thermostat and fan motor replacement."),
    ],
    "Appliance Repair": [
        ("Washing Machine Repair", "Drum bearing, water inlet valve, drain pump, and motherboard repair."),
        ("Microwave & Geyser Servicing", "Heating element replacement, magnetron testing, and thermostat calibration."),
    ],
    "Driver Service": [
        ("City & Highway Chauffeur", "Manual and automatic SUV and luxury sedan handling with smooth defensive driving."),
        ("Outstation Transit", "Experienced with intercity highways, Ghat roads, and toll management."),
    ],
    "Masonry Work": [
        ("Tile & Granite Installation", "Laser-leveled floor tiling, wall dado, and granite kitchen platform fabrication."),
        ("Civil Plaster & Brick Repair", "Structural crack filling, waterproofing screed, and brickwork patching."),
    ],
}

POSITIVE_REVIEWS = [
    "Arrived right on time and fixed the issue with great precision. Very polite and professional!",
    "Extremely thorough work. Explained the root cause clearly and cleaned up the area after finishing.",
    "True master of his craft. Solved a persistent problem that other technicians couldn't fix.",
    "Very humble, fast, and transparent pricing. Highly recommended to all cooperative members!",
    "Top-notch service quality! Delivered exactly what was promised with genuine replacement parts.",
    "Great experience. Was well equipped with all professional tools and completed the work well before time.",
    "Very neat craftsmanship. The finish is solid and looks brand new.",
    "Excellent communication and punctual arrival. Will definitely book again through ShramiGo.",
    "Saved me high service center expenses. Honest and reliable technician.",
    "Cleaned up every corner and left the home spotless. Very satisfied with the cooperative service!",
]

MODERATE_REVIEWS = [
    "Work quality was good, but arrived about 20 minutes later than the scheduled time.",
    "Good job overall. Took a little longer than estimated because of parts availability, but resolved properly.",
    "Satisfactory work. Fixed the issue, though communication could have been slightly better.",
]

# Password Hash Cache for blazing fast bulk insertions
_HASH_CACHE = {}

def get_cached_hash(password: str) -> str:
    if password not in _HASH_CACHE:
        _HASH_CACHE[password] = hash_password(password)
    return _HASH_CACHE[password]


# ==============================================================================
# DATABASE MANAGEMENT
# ==============================================================================

def clear_application_data(db) -> None:
    """Clear all application tables in dependency order."""
    tables_to_clear = [
        Review,
        Payment,
        Notification,
        Booking,
        WorkerAvailability,
        WorkerSkill,
        WorkerService,
        WorkerProfile,
        CustomerProfile,
        RefreshToken,
        Service,
        User,
    ]
    for model in tables_to_clear:
        try:
            db.execute(delete(model))
        except Exception:
            pass
    db.commit()


def seed_services_catalog(db) -> dict[str, Service]:
    services = {}
    for data in SERVICES:
        existing = db.query(Service).filter(Service.name == data["name"]).first()
        if not existing:
            service = Service(**data)
            db.add(service)
            services[data["name"]] = service
        else:
            services[data["name"]] = existing
    db.flush()
    return services


# ==============================================================================
# BATCHED SEED GENERATOR
# ==============================================================================

def seed_database(reset: bool = True, num_customers: int = 50, num_workers: int = 50, num_bookings: int = 250) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if reset:
            print("Resetting existing application data...")
            clear_application_data(db)

        print("Seeding services catalog...")
        services_map = seed_services_catalog(db)
        service_names = list(services_map.keys())

        print(f"Generating users (Admins, {num_customers} Customers, {num_workers} Workers)...")

        # ----------------------------------------------------------------------
        # 1. Admin Accounts
        # ----------------------------------------------------------------------
        admin_data = [
            ("admin@shramigo.com", "Demo Admin", "9876500001", "admin123"),
            ("support@shramigo.com", "Support Lead", "9876500002", "admin123"),
        ]
        admins = []
        for email, name, phone, pwd in admin_data:
            user = User(
                email=email,
                full_name=name,
                phone=phone,
                password_hash=get_cached_hash(pwd),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            admins.append(user)

        # ----------------------------------------------------------------------
        # 2. Customer Accounts & Profile Data
        # ----------------------------------------------------------------------
        customers = []
        customer_profiles_payload = []

        # Primary demo customer
        primary_customer = User(
            email="customer@shramigo.com",
            full_name="Demo Customer",
            phone="9876500003",
            password_hash=get_cached_hash("customer123"),
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        )
        db.add(primary_customer)
        customers.append(primary_customer)
        customer_profiles_payload.append({
            "user_ref": primary_customer,
            "address": "Flat 402, Sunshine Heights, Baner",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411045",
            "latitude": 18.5590,
            "longitude": 73.7868,
        })

        used_phones = {"9876500001", "9876500002", "9876500003", "9876500010"}
        used_emails = {"admin@shramigo.com", "support@shramigo.com", "customer@shramigo.com", "worker@shramigo.com"}

        # Bulk Generated Customers
        for i in range(1, num_customers):
            is_female = random.random() < 0.5
            fname = random.choice(FIRST_NAMES_FEMALE if is_female else FIRST_NAMES_MALE)
            lname = random.choice(LAST_NAMES)
            full_name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{i}@example.com"
            if email in used_emails:
                email = f"{fname.lower()}.{lname.lower()}{random.randint(1000, 9999)}@example.com"
            used_emails.add(email)

            phone = f"987{random.randint(1000000, 9999999)}"
            while phone in used_phones:
                phone = f"987{random.randint(1000000, 9999999)}"
            used_phones.add(phone)

            city_obj = random.choice(CITIES)
            area = random.choice(city_obj["areas"])
            lat_offset = (random.random() - 0.5) * 0.08
            lon_offset = (random.random() - 0.5) * 0.08

            c_user = User(
                email=email,
                full_name=full_name,
                phone=phone,
                password_hash=get_cached_hash("customer123"),
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
            )
            db.add(c_user)
            customers.append(c_user)
            customer_profiles_payload.append({
                "user_ref": c_user,
                "address": f"Flat {random.randint(101, 1404)}, {random.choice(['Tower A', 'Silver Heights', 'Green Meadows', 'Palm Enclave', 'Royal Residency'])}, {area}",
                "city": city_obj["city"],
                "state": city_obj["state"],
                "pincode": f"{city_obj['pincode_prefix']}{random.randint(10, 99):02d}",
                "latitude": round(city_obj["lat"] + lat_offset, 6),
                "longitude": round(city_obj["lon"] + lon_offset, 6),
            })

        # ----------------------------------------------------------------------
        # 3. Worker Accounts & Metadata Payloads
        # ----------------------------------------------------------------------
        workers = []
        worker_profiles_payload = []
        worker_services_payload = []
        days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

        # Primary demo worker
        primary_worker = User(
            email="worker@shramigo.com",
            full_name="Ramesh Patil",
            phone="9876500010",
            password_hash=get_cached_hash("worker123"),
            role=UserRole.WORKER,
            is_active=True,
            is_verified=True,
        )
        db.add(primary_worker)
        workers.append(primary_worker)
        worker_profiles_payload.append({
            "user_ref": primary_worker,
            "address": "45 Green Park, Shivaji Nagar",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411005",
            "bio": "Certified master electrician and appliance technician with 8+ years experience in domestic and commercial wiring, short circuit fixes, and appliance installation.",
            "experience_years": 8,
            "profile_image": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
            "latitude": 18.5314,
            "longitude": 73.8446,
            "service_radius_km": 20,
        })
        worker_services_payload.append({
            "user_ref": primary_worker,
            "services": [("Electrical Repair", Decimal("350")), ("AC Repair", Decimal("450")), ("Appliance Repair", Decimal("380"))],
        })

        # Bulk Generated Workers
        for i in range(1, num_workers):
            is_female = random.random() < 0.25
            fname = random.choice(FIRST_NAMES_FEMALE if is_female else FIRST_NAMES_MALE)
            lname = random.choice(LAST_NAMES)
            full_name = f"{fname} {lname}"
            email = f"worker.{fname.lower()}.{lname.lower()}{i}@shramigo.com"
            if email in used_emails:
                email = f"worker.{fname.lower()}.{lname.lower()}{random.randint(1000, 9999)}@shramigo.com"
            used_emails.add(email)

            phone = f"987{random.randint(1000000, 9999999)}"
            while phone in used_phones:
                phone = f"987{random.randint(1000000, 9999999)}"
            used_phones.add(phone)

            city_obj = random.choice(CITIES)
            area = random.choice(city_obj["areas"])
            lat_offset = (random.random() - 0.5) * 0.08
            lon_offset = (random.random() - 0.5) * 0.08

            primary_svc_name = random.choice(service_names)
            chosen_services_list = [primary_svc_name]
            if random.random() < 0.4:
                compatible = [s for s in service_names if s != primary_svc_name]
                chosen_services_list.append(random.choice(compatible))

            exp_years = random.randint(2, 18)
            verified = random.random() < 0.85

            w_user = User(
                email=email,
                full_name=full_name,
                phone=phone,
                password_hash=get_cached_hash("worker123"),
                role=UserRole.WORKER,
                is_active=True,
                is_verified=verified,
            )
            db.add(w_user)
            workers.append(w_user)

            bio = f"Experienced {primary_svc_name} specialist with {exp_years}+ years of trusted service across {city_obj['city']}. Dedicated to prompt response, quality artistry, and fair cooperative pricing."

            worker_profiles_payload.append({
                "user_ref": w_user,
                "address": f"{random.randint(10, 150)} {random.choice(['Gandhi Nagar', 'Shanti Colony', 'Navrang Society', 'Vikas Path', 'Station Road'])}, {area}",
                "city": city_obj["city"],
                "state": city_obj["state"],
                "pincode": f"{city_obj['pincode_prefix']}{random.randint(10, 99):02d}",
                "bio": bio,
                "experience_years": exp_years,
                "profile_image": random.choice(PORTRAIT_IMAGES),
                "latitude": round(city_obj["lat"] + lat_offset, 6),
                "longitude": round(city_obj["lon"] + lon_offset, 6),
                "service_radius_km": random.choice([15, 20, 25, 30]),
            })

            svc_tuples = []
            for svc_name in chosen_services_list:
                base = services_map[svc_name].base_price
                price_variation = random.choice([-50, 0, 50, 100, 150])
                custom_price = Decimal(str(max(200, base + price_variation)))
                svc_tuples.append((svc_name, custom_price))

            worker_services_payload.append({
                "user_ref": w_user,
                "services": svc_tuples,
            })

        # BATCH FLUSH 1: All Users
        db.flush()

        # BATCH INSERT 2: Profiles
        for cp in customer_profiles_payload:
            db.add(CustomerProfile(
                user_id=cp["user_ref"].id,
                address=cp["address"],
                city=cp["city"],
                state=cp["state"],
                pincode=cp["pincode"],
                latitude=cp["latitude"],
                longitude=cp["longitude"],
            ))

        for wp in worker_profiles_payload:
            db.add(WorkerProfile(
                user_id=wp["user_ref"].id,
                address=wp["address"],
                city=wp["city"],
                state=wp["state"],
                pincode=wp["pincode"],
                bio=wp["bio"],
                experience_years=wp["experience_years"],
                profile_image=wp["profile_image"],
                latitude=wp["latitude"],
                longitude=wp["longitude"],
                service_radius_km=wp["service_radius_km"],
            ))

        # BATCH INSERT 3: Worker Services, Skills & Availability
        ws_lookup = {}
        for ws_item in worker_services_payload:
            w_id = ws_item["user_ref"].id
            ws_lookup[w_id] = []
            for svc_name, custom_price in ws_item["services"]:
                ws_obj = WorkerService(
                    worker_id=w_id,
                    service_id=services_map[svc_name].id,
                    custom_price=custom_price,
                    is_active=True,
                )
                db.add(ws_obj)
                ws_lookup[w_id].append((services_map[svc_name].id, custom_price, svc_name))

                if svc_name in SERVICE_SKILLS_MAP:
                    for s_title, s_desc in SERVICE_SKILLS_MAP[svc_name]:
                        db.add(WorkerSkill(
                            worker_id=w_id,
                            skill_name=s_title,
                            category=services_map[svc_name].category,
                            description=s_desc,
                        ))

            for d in days_of_week:
                db.add(WorkerAvailability(
                    worker_id=w_id,
                    day_of_week=d,
                    start_time=time(random.choice([8, 9]), 0),
                    end_time=time(random.choice([18, 19, 20]), 0),
                    is_available=True,
                ))

        db.flush()

        # ----------------------------------------------------------------------
        # 4. Bookings, Payments, Reviews & Notifications
        # ----------------------------------------------------------------------
        print(f"Generating {num_bookings} Bookings with lifecycle statuses, payments, ratings, and reviews...")

        today = date.today()
        now_dt = datetime.now(timezone.utc)
        now_ts = int(now_dt.timestamp())

        statuses_pool = [
            ("completed", 0.65),
            ("confirmed", 0.15),
            ("pending", 0.10),
            ("in_progress", 0.05),
            ("cancelled", 0.05),
        ]

        booking_items_payload = []

        for b_idx in range(num_bookings):
            if b_idx < 10:
                cust = primary_customer
                wrk = primary_worker if b_idx < 5 else random.choice(workers)
            else:
                cust = random.choice(customers)
                wrk = random.choice(workers)

            w_services = ws_lookup.get(wrk.id, [])
            if w_services:
                chosen_svc_id, hourly_rate, chosen_svc_name = random.choice(w_services)
            else:
                chosen_svc_id = services_map["Electrical Repair"].id
                hourly_rate = Decimal("350")
                chosen_svc_name = "Electrical Repair"

            rnd = random.random()
            cum = 0.0
            chosen_status = "completed"
            for stat, weight in statuses_pool:
                cum += weight
                if rnd <= cum:
                    chosen_status = stat
                    break

            if chosen_status == "completed":
                day_offset = random.randint(1, 120)
                booking_date = today - timedelta(days=day_offset)
                payment_method = random.choice(["razorpay", "cash"])
                payment_status = "paid"
            elif chosen_status == "confirmed":
                day_offset = random.randint(1, 14)
                booking_date = today + timedelta(days=day_offset)
                payment_method = random.choice(["razorpay", "cash"])
                payment_status = "paid" if payment_method == "razorpay" else "pending"
            elif chosen_status == "pending":
                day_offset = random.randint(1, 7)
                booking_date = today + timedelta(days=day_offset)
                payment_method = "cash"
                payment_status = "pending"
            elif chosen_status == "in_progress":
                booking_date = today
                payment_method = random.choice(["razorpay", "cash"])
                payment_status = "paid" if payment_method == "razorpay" else "pending"
            else:
                day_offset = random.randint(1, 30)
                booking_date = today - timedelta(days=day_offset)
                payment_method = "cash"
                payment_status = "cancelled"

            booking_time = time(random.randint(8, 17), random.choice([0, 30]))
            hours = random.randint(1, 5)
            subtotal = hourly_rate * hours
            service_charge = Decimal("30")
            total_amount = subtotal + service_charge
            worker_payout = subtotal

            completed_at = None
            if chosen_status == "completed":
                completed_at = datetime.combine(booking_date, booking_time) + timedelta(hours=hours)

            booking_obj = Booking(
                customer_id=cust.id,
                worker_id=wrk.id,
                service_id=chosen_svc_id,
                booking_date=booking_date,
                booking_time=booking_time,
                hours=hours,
                service_address=f"Flat {random.randint(101, 1201)}, {random.choice(['Rosewood Apts', 'Greenfield Heights', 'Royal Orchid', 'Lake View Park'])}, Pune",
                description=f"Standard service and diagnosis for {chosen_svc_name}.",
                hourly_rate=hourly_rate,
                subtotal=subtotal,
                service_charge=service_charge,
                total_amount=total_amount,
                worker_payout=worker_payout,
                status=chosen_status,
                payment_method=payment_method,
                payment_status=payment_status,
                completed_at=completed_at,
            )
            db.add(booking_obj)
            booking_items_payload.append({
                "booking_ref": booking_obj,
                "customer_id": cust.id,
                "worker_id": wrk.id,
                "customer_name": cust.full_name,
                "worker_name": wrk.full_name,
                "svc_name": chosen_svc_name,
                "total_amount": total_amount,
                "worker_payout": worker_payout,
                "payment_method": payment_method,
                "payment_status": payment_status,
                "chosen_status": chosen_status,
                "completed_at": completed_at,
                "idx": b_idx,
            })

        # BATCH FLUSH 4: Bookings
        db.flush()

        # BATCH INSERT 5: Payments, Reviews, and Notifications
        for item in booking_items_payload:
            b_id = item["booking_ref"].id
            b_idx = item["idx"]

            # Payment
            db.add(Payment(
                booking_id=b_id,
                customer_id=item["customer_id"],
                worker_id=item["worker_id"],
                amount=item["total_amount"],
                payment_method=item["payment_method"],
                payment_status=item["payment_status"],
                provider="razorpay" if item["payment_method"] == "razorpay" else "manual",
                provider_order_id=f"order_seed_{b_id}_{now_ts}_{b_idx}" if item["payment_method"] == "razorpay" else None,
                provider_payment_id=f"pay_seed_{b_id}_{now_ts}_{b_idx}" if item["payment_status"] == "paid" else None,
                paid_at=item["completed_at"] if item["payment_status"] == "paid" else None,
            ))

            # Review for completed bookings
            if item["chosen_status"] == "completed" and random.random() < 0.85:
                star_rnd = random.random()
                if star_rnd < 0.70:
                    rating = 5
                    review_text = random.choice(POSITIVE_REVIEWS)
                elif star_rnd < 0.90:
                    rating = 4
                    review_text = random.choice(POSITIVE_REVIEWS)
                else:
                    rating = 3
                    review_text = random.choice(MODERATE_REVIEWS)

                db.add(Review(
                    booking_id=b_id,
                    customer_id=item["customer_id"],
                    worker_id=item["worker_id"],
                    rating=rating,
                    review_text=review_text,
                    created_at=item["completed_at"] or now_dt,
                ))

            # Notifications for recent bookings
            if b_idx < 50:
                if item["chosen_status"] == "completed":
                    db.add(Notification(
                        user_id=item["customer_id"],
                        title="Service Completed",
                        message=f"Your booking for {item['svc_name']} with {item['worker_name']} has been completed.",
                        notif_type="booking_completed",
                        is_read=True,
                    ))
                    db.add(Notification(
                        user_id=item["worker_id"],
                        title="Payout Processed",
                        message=f"Payout of ₹{item['worker_payout']:.0f} for Booking #{b_id} was processed.",
                        notif_type="payout",
                        is_read=True,
                    ))
                elif item["chosen_status"] == "confirmed":
                    db.add(Notification(
                        user_id=item["customer_id"],
                        title="Booking Confirmed",
                        message=f"{item['worker_name']} has accepted your request for {item['svc_name']}.",
                        notif_type="booking_confirmed",
                        is_read=False,
                    ))
                elif item["chosen_status"] == "pending":
                    db.add(Notification(
                        user_id=item["worker_id"],
                        title="New Booking Request",
                        message=f"New booking request from {item['customer_name']} for {item['svc_name']}.",
                        notif_type="booking_request",
                        is_read=False,
                    ))

        # Welcome notifications
        for u in [primary_customer, primary_worker] + admins:
            db.add(Notification(
                user_id=u.id,
                title="Welcome to ShramiGo Platform",
                message="Your account is active. Connect with trusted workers and manage your bookings effortlessly.",
                notif_type="general",
                is_read=False,
            ))

        db.commit()

        print("\n" + "=" * 65)
        print("SHRAMIGO DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 65)
        print("DEMO ACCOUNTS (Password: 'customer123' / 'worker123' / 'admin123'):")
        print("  - Customer : customer@shramigo.com  (pass: customer123)")
        print("  - Worker   : worker@shramigo.com    (pass: worker123)")
        print("  - Admin    : admin@shramigo.com     (pass: admin123)")
        print("  - Support  : support@shramigo.com   (pass: admin123)")
        print("\nTOTAL DATABASE STATS:")
        print(f"  - Services Catalog : {db.query(Service).count()}")
        print(f"  - Total Users      : {db.query(User).count()}")
        print(f"  - Customers        : {db.query(User).filter(User.role == UserRole.CUSTOMER).count()}")
        print(f"  - Workers          : {db.query(User).filter(User.role == UserRole.WORKER).count()}")
        print(f"  - Worker Services  : {db.query(WorkerService).count()}")
        print(f"  - Worker Skills    : {db.query(WorkerSkill).count()}")
        print(f"  - Availability Rows: {db.query(WorkerAvailability).count()}")
        print(f"  - Total Bookings   : {db.query(Booking).count()}")
        print(f"  - Reviews & Ratings: {db.query(Review).count()}")
        print(f"  - Payments Recorded: {db.query(Payment).count()}")
        print(f"  - Notifications    : {db.query(Notification).count()}")
        print("=" * 65 + "\n")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed large-scale realistic demo data for ShramiGo.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete all application data before inserting the demo dataset.",
    )
    parser.add_argument(
        "--customers",
        type=int,
        default=50,
        help="Number of customer accounts to generate (default: 50).",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=50,
        help="Number of worker accounts to generate (default: 50).",
    )
    parser.add_argument(
        "--bookings",
        type=int,
        default=250,
        help="Number of bookings to generate (default: 250).",
    )
    args = parser.parse_args()
    seed_database(
        reset=args.reset,
        num_customers=args.customers,
        num_workers=args.workers,
        num_bookings=args.bookings,
    )
