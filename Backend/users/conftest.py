"""
Pytest configuration for the users test suite.
Disables DRF throttling so repeated calls to rate-limited endpoints
(register, login) don't return 429 during tests.
"""
import pytest
from django.core.cache import cache
from unittest.mock import patch


@pytest.fixture(autouse=True)
def disable_throttling():
    """
    Patch AnonRateThrottle.allow_request to always return True during tests,
    and clear the cache before each test to reset any throttle counters.
    """
    cache.clear()
    with patch('rest_framework.throttling.AnonRateThrottle.allow_request', return_value=True):
        yield
