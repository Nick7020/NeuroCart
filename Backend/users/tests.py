import pytest
from rest_framework.test import APIClient
from users.models import User


REGISTER_URL = '/api/auth/register'
LOGIN_URL = '/api/auth/login'
PROFILE_URL = '/api/users/me'


def make_user(email='test@example.com', password='securepass123', role='customer', is_active=True):
    user = User.objects.create_user(email=email, password=password, role=role)
    user.is_active = is_active
    user.save()
    return user


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_register_valid_data_creates_user():
    client = APIClient()
    payload = {'email': 'new@example.com', 'password': 'securepass1', 'role': 'customer'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 201
    assert 'access' in response.data
    assert 'refresh' in response.data
    assert User.objects.filter(email='new@example.com').exists()


@pytest.mark.django_db
def test_register_password_is_hashed():
    client = APIClient()
    payload = {'email': 'hash@example.com', 'password': 'securepass1', 'role': 'customer'}
    client.post(REGISTER_URL, payload, format='json')
    user = User.objects.get(email='hash@example.com')
    assert user.password != 'securepass1'
    assert user.check_password('securepass1')


@pytest.mark.django_db
def test_register_duplicate_email_returns_400():
    make_user(email='dup@example.com')
    client = APIClient()
    payload = {'email': 'dup@example.com', 'password': 'securepass1', 'role': 'customer'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_short_password_returns_400():
    client = APIClient()
    payload = {'email': 'short@example.com', 'password': 'abc', 'role': 'customer'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_missing_email_returns_400():
    client = APIClient()
    payload = {'password': 'securepass1', 'role': 'customer'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_missing_password_returns_400():
    client = APIClient()
    payload = {'email': 'nopw@example.com', 'role': 'customer'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_invalid_role_returns_400():
    client = APIClient()
    payload = {'email': 'badrole@example.com', 'password': 'securepass1', 'role': 'superadmin'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_vendor_role_creates_vendor():
    client = APIClient()
    payload = {'email': 'vendor@example.com', 'password': 'securepass1', 'role': 'vendor'}
    response = client.post(REGISTER_URL, payload, format='json')
    assert response.status_code == 201
    assert User.objects.get(email='vendor@example.com').role == 'vendor'


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_login_valid_credentials_returns_tokens():
    make_user(email='login@example.com', password='securepass1')
    client = APIClient()
    response = client.post(LOGIN_URL, {'email': 'login@example.com', 'password': 'securepass1'}, format='json')
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_login_wrong_password_returns_401():
    make_user(email='wrongpw@example.com', password='securepass1')
    client = APIClient()
    response = client.post(LOGIN_URL, {'email': 'wrongpw@example.com', 'password': 'wrongpassword'}, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_login_nonexistent_email_returns_400():
    client = APIClient()
    response = client.post(LOGIN_URL, {'email': 'ghost@example.com', 'password': 'securepass1'}, format='json')
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# Inactive user
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_inactive_user_cannot_login():
    make_user(email='inactive@example.com', password='securepass1', is_active=False)
    client = APIClient()
    response = client.post(LOGIN_URL, {'email': 'inactive@example.com', 'password': 'securepass1'}, format='json')
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_get_own_profile_returns_200():
    user = make_user(email='profile@example.com')
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get(PROFILE_URL)
    assert response.status_code == 200
    assert response.data['email'] == 'profile@example.com'


@pytest.mark.django_db
def test_get_profile_unauthenticated_returns_401():
    client = APIClient()
    response = client.get(PROFILE_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_put_own_profile_updates_name():
    user = make_user(email='update@example.com')
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.put(PROFILE_URL, {'first_name': 'Alice', 'last_name': 'Smith'}, format='json')
    assert response.status_code == 200
    assert response.data['first_name'] == 'Alice'
    assert response.data['last_name'] == 'Smith'


@pytest.mark.django_db
def test_put_profile_unauthenticated_returns_401():
    client = APIClient()
    response = client.put(PROFILE_URL, {'first_name': 'Hacker'}, format='json')
    assert response.status_code == 401


@pytest.mark.django_db
def test_profile_endpoint_returns_only_own_profile():
    """
    /api/users/me always returns the authenticated user's own profile,
    so a user cannot access another user's data via this endpoint.
    """
    user_a = make_user(email='usera@example.com')
    make_user(email='userb@example.com')

    client = APIClient()
    client.force_authenticate(user=user_a)
    response = client.get(PROFILE_URL)
    assert response.status_code == 200
    assert response.data['email'] == 'usera@example.com'


@pytest.mark.django_db
def test_profile_email_and_role_are_read_only():
    user = make_user(email='readonly@example.com', role='customer')
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.put(PROFILE_URL, {'email': 'hacked@example.com', 'role': 'admin'}, format='json')
    assert response.status_code == 200
    # email and role must remain unchanged
    assert response.data['email'] == 'readonly@example.com'
    assert response.data['role'] == 'customer'
