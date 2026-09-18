
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import (
    admin,
    ai,
    auth,
    bookings,
    health,
    notifications,
    payments,
    profile,
    reviews,
    services,
    worker_services,
    workers,
)


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
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(services.router)
app.include_router(worker_services.router)
app.include_router(workers.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to ShramiGo API",
        "status": "running",
    }

