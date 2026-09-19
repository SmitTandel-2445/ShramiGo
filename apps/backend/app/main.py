from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.features.admin.routes import router as admin_router
from app.features.auth.profile_routes import router as profile_router
from app.features.auth.routes import router as auth_router
from app.features.bookings.routes import router as bookings_router
from app.features.health.routes import router as health_router
from app.features.matching.routes import router as ai_router
from app.features.notifications.routes import router as notifications_router
from app.features.payments.routes import router as payments_router
from app.features.reviews.routes import router as reviews_router
from app.features.services.routes import router as services_router
from app.features.workers.routes import router as workers_router
from app.features.workers.service_routes import router as worker_services_router


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend API for ShramiGo Cooperative Gig Services Platform",
)


cors_origins = settings.cors_origins
has_wildcard = "*" in cors_origins

# Catch any unhandled 500 errors and attach CORS headers so browsers don't mask server errors as CORS errors
@app.middleware("http")
async def cors_exception_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    private_network = request.headers.get("access-control-request-private-network")
    
    try:
        response: Response = await call_next(request)
    except Exception as exc:
        headers = {}
        if origin:
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"
        if private_network:
            headers["Access-Control-Allow-Private-Network"] = "true"
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": str(exc)},
            headers=headers,
        )

    if private_network:
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if has_wildcard else cors_origins,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_private_network=True,
)


# Register API routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(services_router)
app.include_router(worker_services_router)
app.include_router(workers_router)
app.include_router(bookings_router)
app.include_router(reviews_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(payments_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to ShramiGo API",
        "status": "running",
    }
