import argparse
import hashlib
import sys
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.features.auth.user import User, UserRole
from app.core.config import settings
import redis

def create_or_update_admin(email: str, password: str, full_name: str = "Admin User", phone: str = "9876500000"):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password_hash = hash_password(password)
            user.role = UserRole.ADMIN
            user.is_active = True
            user.is_verified = True
            user.full_name = full_name
            db.commit()
            print(f"Updated existing user '{email}' to ADMIN with provided password.")
        else:
            # Check phone conflict
            phone_user = db.query(User).filter(User.phone == phone).first()
            if phone_user:
                phone = f"9{int(phone_user.phone[-9:]) + 1:09d}"
            
            admin_user = User(
                full_name=full_name,
                phone=phone,
                email=email,
                password_hash=hash_password(password),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"Created new ADMIN user '{email}' successfully.")

        # Clear redis rate limit keys for this email
        if settings.REDIS_URL:
            try:
                r = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=0.2, socket_timeout=0.2)
                key = f"login:email:{hashlib.sha256(email.lower().encode()).hexdigest()}"
                r.delete(key)
                print(f"Cleared login rate-limiting cache for '{email}'.")
            except Exception as ex:
                pass

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or update an administrative user.")
    parser.add_argument("--email", default="joan@gmail.com", help="Admin email address")
    parser.add_argument("--password", default="joan123", help="Admin password")
    parser.add_argument("--name", default="Joan Admin", help="Admin full name")
    parser.add_argument("--phone", default="9876500000", help="Admin phone number")

    args = parser.parse_args()
    create_or_update_admin(
        email=args.email,
        password=args.password,
        full_name=args.name,
        phone=args.phone,
    )
