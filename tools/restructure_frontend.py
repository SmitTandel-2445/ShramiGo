"""Frontend feature layout: types, services, routes, drop duplicates and contracts."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FE = ROOT / "apps" / "frontend" / "src"

SERVICE_RENAMES = {
    "features/auth/authService.ts": "features/auth/services.ts",
    "features/bookings/bookingService.ts": "features/bookings/services.ts",
    "features/workers/workerService.ts": "features/workers/services.ts",
    "features/services/servicesService.ts": "features/services/services.ts",
    "features/admin/adminService.ts": "features/admin/services.ts",
    "features/reviews/reviewsService.ts": "features/reviews/services.ts",
    "features/auth/profileService.ts": "features/auth/profileServices.ts",
    "features/auth/notificationsService.ts": "features/notifications/services.ts",
    "features/services/aiService.ts": "features/matching/services.ts",
    "features/services/AIRecommendations.tsx": "features/matching/AIRecommendations.tsx",
}

IMPORT_REPLACEMENTS = [
    ("@/features/auth/authService", "@/features/auth/services"),
    ("@/features/bookings/bookingService", "@/features/bookings/services"),
    ("@/features/workers/workerService", "@/features/workers/services"),
    ("@/features/services/servicesService", "@/features/services/services"),
    ("@/features/admin/adminService", "@/features/admin/services"),
    ("@/features/reviews/reviewsService", "@/features/reviews/services"),
    ("@/features/auth/profileService", "@/features/auth/profileServices"),
    ("@/features/auth/notificationsService", "@/features/notifications/services"),
    ("@/features/services/aiService", "@/features/matching/services"),
    ("from '@shramigo/contracts'", "from './types'"),
    ('from "@shramigo/contracts"', 'from "./types"'),
    ("from '@/app/providers/ThemeContext'", "from '@/app/providers/ThemeContext'"),
]

DELETE_DIRS = [
    FE / "pages",
    FE / "services",
    FE / "routes",
    FE / "layouts",
    FE / "context",
    FE / "data",
    FE / "components" / "auth",
    FE / "components" / "navigation",
    FE / "hooks",
    ROOT / "packages",
]

DELETE_FILES = [
    FE / "components" / "BrandLogo.tsx",
    FE / "utils" / "profileImage.ts",
    FE / "constants" / "appConstants.ts",
    FE / "app" / "router" / "AppRoutes.tsx",
    FE / "app" / "router" / "CustomerRoutes.tsx",
    FE / "app" / "router" / "WorkerRoutes.tsx",
]


def rewrite_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in IMPORT_REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")


def main() -> None:
    (FE / "features" / "notifications").mkdir(parents=True, exist_ok=True)
    (FE / "features" / "matching").mkdir(parents=True, exist_ok=True)

    for src_rel, dest_rel in SERVICE_RENAMES.items():
        src = FE / src_rel
        dest = FE / dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.exists():
            if dest.exists():
                dest.unlink()
            shutil.move(str(src), str(dest))
            print(f"MOVED {src_rel} -> {dest_rel}")

    for path in FE.rglob("*"):
        if path.suffix in {".ts", ".tsx"}:
            rewrite_file(path)

    for d in DELETE_DIRS:
        if d.exists():
            shutil.rmtree(d)
            print(f"REMOVED DIR {d}")

    for f in DELETE_FILES:
        if f.exists():
            f.unlink()
            print(f"REMOVED FILE {f}")

    utils = FE / "utils"
    if utils.exists() and not any(utils.iterdir()):
        utils.rmdir()

    constants = FE / "constants"
    if constants.exists() and not any(constants.iterdir()):
        shutil.rmtree(constants)

    router = FE / "app" / "router"
    if router.exists() and not any(router.iterdir()):
        router.rmdir()


if __name__ == "__main__":
    main()
