"""Schema re-exports for backwards compatibility."""

from app.features.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

from app.features.auth.profile_schemas import (
    CustomerProfileResponse,
    CustomerProfileUpdate,
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerSkillCreate,
    WorkerSkillUpdate,
    WorkerSkillResponse,
    WorkerAvailabilityCreate,
    WorkerAvailabilityUpdate,
    WorkerAvailabilityResponse,
)

from app.features.services.schemas import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
)

from app.features.workers.service_schemas import (
    WorkerServiceCreate,
    WorkerServiceUpdate,
)

from app.features.workers.discovery_schemas import WorkerDiscoveryResponse

from app.features.bookings.schemas import BookingCreate, BookingResponse

__all__ = [
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserResponse",
    "CustomerProfileResponse",
    "CustomerProfileUpdate",
    "WorkerProfileResponse",
    "WorkerProfileUpdate",
    "WorkerSkillCreate",
    "WorkerSkillUpdate",
    "WorkerSkillResponse",
    "WorkerAvailabilityCreate",
    "WorkerAvailabilityUpdate",
    "WorkerAvailabilityResponse",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "WorkerServiceCreate",
    "WorkerServiceUpdate",
    "WorkerDiscoveryResponse",
    "BookingCreate",
    "BookingResponse",
]