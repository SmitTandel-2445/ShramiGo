"""One-shot monorepo restructure: backend feature modules + import rewrite."""
from __future__ import annotations

import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "apps" / "backend" / "app"

MOVES = {
    # auth
    "routers/auth.py": "features/auth/routes.py",
    "routers/profile.py": "features/auth/profile_routes.py",
    "schemas/auth.py": "features/auth/schemas.py",
    "schemas/profile.py": "features/auth/profile_schemas.py",
    "models/user.py": "features/auth/user.py",
    "models/refresh_token.py": "features/auth/refresh_token.py",
    "models/customer_profile.py": "features/auth/customer_profile.py",
    "services/rate_limit.py": "features/auth/rate_limit.py",
    # services catalog
    "routers/services.py": "features/services/routes.py",
    "schemas/service.py": "features/services/schemas.py",
    "models/service.py": "features/services/models.py",
    "seed_services.py": "features/services/seed.py",
    # workers
    "routers/workers.py": "features/workers/routes.py",
    "routers/worker_services.py": "features/workers/service_routes.py",
    "schemas/worker_discovery.py": "features/workers/discovery_schemas.py",
    "schemas/worker_service.py": "features/workers/service_schemas.py",
    "models/worker_profile.py": "features/workers/profile.py",
    "models/worker_skill.py": "features/workers/skill.py",
    "models/worker_availability.py": "features/workers/availability.py",
    "models/worker_service.py": "features/workers/worker_service.py",
    # bookings
    "routers/bookings.py": "features/bookings/routes.py",
    "schemas/booking.py": "features/bookings/schemas.py",
    "models/booking.py": "features/bookings/models.py",
    # payments
    "routers/payments.py": "features/payments/routes.py",
    "schemas/payment.py": "features/payments/schemas.py",
    "models/payment.py": "features/payments/models.py",
    "services/payment/base.py": "features/payments/base.py",
    "services/payment/razorpay.py": "features/payments/razorpay.py",
    "services/payment/service.py": "features/payments/service.py",
    # reviews
    "routers/reviews.py": "features/reviews/routes.py",
    "schemas/review.py": "features/reviews/schemas.py",
    "models/review.py": "features/reviews/models.py",
    # notifications
    "routers/notifications.py": "features/notifications/routes.py",
    "models/notification.py": "features/notifications/models.py",
    # admin
    "routers/admin.py": "features/admin/routes.py",
    # matching (AI)
    "routers/ai.py": "features/matching/routes.py",
    "schemas/ai.py": "features/matching/schemas.py",
    # health
    "routers/health.py": "features/health/routes.py",
}

IMPORT_REPLACEMENTS = [
    ("app.services.payment.razorpay", "app.features.payments.razorpay"),
    ("app.services.payment.service", "app.features.payments.service"),
    ("app.services.payment.base", "app.features.payments.base"),
    ("app.services.payment", "app.features.payments"),
    ("app.services.rate_limit", "app.features.auth.rate_limit"),
    ("app.models.customer_profile", "app.features.auth.customer_profile"),
    ("app.models.refresh_token", "app.features.auth.refresh_token"),
    ("app.models.user", "app.features.auth.user"),
    ("app.models.worker_availability", "app.features.workers.availability"),
    ("app.models.worker_profile", "app.features.workers.profile"),
    ("app.models.worker_skill", "app.features.workers.skill"),
    ("app.models.worker_service", "app.features.workers.worker_service"),
    ("app.models.service", "app.features.services.models"),
    ("app.models.booking", "app.features.bookings.models"),
    ("app.models.payment", "app.features.payments.models"),
    ("app.models.review", "app.features.reviews.models"),
    ("app.models.notification", "app.features.notifications.models"),
    ("app.schemas.auth", "app.features.auth.schemas"),
    ("app.schemas.profile", "app.features.auth.profile_schemas"),
    ("app.schemas.service", "app.features.services.schemas"),
    ("app.schemas.worker_discovery", "app.features.workers.discovery_schemas"),
    ("app.schemas.worker_service", "app.features.workers.service_schemas"),
    ("app.schemas.booking", "app.features.bookings.schemas"),
    ("app.schemas.payment", "app.features.payments.schemas"),
    ("app.schemas.review", "app.features.reviews.schemas"),
    ("app.schemas.ai", "app.features.matching.schemas"),
    ("app.routers.notifications", "app.features.notifications.routes"),
    ("app.routers.worker_services", "app.features.workers.service_routes"),
    ("app.routers.workers", "app.features.workers.routes"),
    ("app.routers.bookings", "app.features.bookings.routes"),
    ("app.routers.payments", "app.features.payments.routes"),
    ("app.routers.reviews", "app.features.reviews.routes"),
    ("app.routers.profile", "app.features.auth.profile_routes"),
    ("app.routers.services", "app.features.services.routes"),
    ("app.routers.health", "app.features.health.routes"),
    ("app.routers.admin", "app.features.admin.routes"),
    ("app.routers.auth", "app.features.auth.routes"),
    ("app.routers.ai", "app.features.matching.routes"),
    ("app.seed_services", "app.features.services.seed"),
]


def rewrite_imports(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in IMPORT_REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")


def main() -> None:
    for src_rel, dest_rel in MOVES.items():
        src = BACKEND / src_rel
        dest = BACKEND / dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not src.exists():
            print(f"SKIP missing {src}")
            continue
        if dest.exists():
            print(f"SKIP exists {dest}")
            continue
        shutil.move(str(src), str(dest))
        print(f"MOVED {src_rel} -> {dest_rel}")

    feature_inits = {
        "features/__init__.py": "",
        "features/auth/__init__.py": "from .routes import router\nfrom .profile_routes import router as profile_router\n\n__all__ = [\"router\", \"profile_router\"]\n",
        "features/services/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/workers/__init__.py": "from .routes import router\nfrom .service_routes import router as service_router\n\n__all__ = [\"router\", \"service_router\"]\n",
        "features/bookings/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/payments/__init__.py": "from .routes import router\nfrom .base import PaymentProvider\nfrom .razorpay import RazorpayProvider\n\n__all__ = [\"router\", \"PaymentProvider\", \"RazorpayProvider\"]\n",
        "features/reviews/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/notifications/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/admin/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/matching/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
        "features/health/__init__.py": "from .routes import router\n\n__all__ = [\"router\"]\n",
    }
    for rel, content in feature_inits.items():
        path = BACKEND / rel
        if not path.exists():
            path.write_text(content, encoding="utf-8")

    for path in (ROOT / "apps" / "backend").rglob("*.py"):
        rewrite_imports(path)

    # Drop old layered packages if empty of py files
    for folder in ["routers", "schemas", "services/payment", "services"]:
        target = BACKEND / folder
        if target.exists():
            py_files = list(target.rglob("*.py"))
            if not py_files:
                shutil.rmtree(target)
                print(f"REMOVED {folder}")
            else:
                print(f"KEEP {folder}: {py_files}")


if __name__ == "__main__":
    main()
