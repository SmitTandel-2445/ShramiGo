import pytest
from pydantic import ValidationError

from app.features.workers.routes import haversine_km
from app.features.auth.profile_schemas import WorkerProfileUpdate


def test_haversine_distance_is_realistic() -> None:
    distance = haversine_km(0, 0, 0, 1)
    assert 110 < distance < 112


def test_coordinates_are_validated() -> None:
    with pytest.raises(ValidationError):
        WorkerProfileUpdate(latitude=91)
    with pytest.raises(ValidationError):
        WorkerProfileUpdate(longitude=-181)
    with pytest.raises(ValidationError):
        WorkerProfileUpdate(longitude=10)
