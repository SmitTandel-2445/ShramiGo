from pathlib import Path
import shutil

fe = Path("apps/frontend/src")
for p in fe.rglob("*.ts"):
    t = p.read_text(encoding="utf-8")
    n = t.replace('from "./api"', 'from "@/lib/api"')
    if n != t:
        p.write_text(n, encoding="utf-8")
        print("fixed", p)

for folder in [
    "apps/backend/app/routers",
    "apps/backend/app/schemas",
    "apps/backend/app/services",
]:
    path = Path(folder)
    if path.exists():
        shutil.rmtree(path)
        print("removed", folder)
