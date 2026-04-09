import pytest
from rest_framework.test import APIClient
from django.urls import reverse

from users.models import User
from vendors.models import VendorProfile
from products.models import Category


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def vendor_user(db):
    return User.objects.create_user(
        email='vendor@example.com',
        password='testpass123',
        role='vendor',
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin@example.com',
        password='testpass123',
        role='admin',
        is_staff=True,
    )


@pytest.fixture
def pending_vendor_profile(db, vendor_user):
    return VendorProfile.objects.create(
        user=vendor_user,
        shop_name='Test Shop',
        description='A test shop',
        verification_status='pending',
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', slug='electronics')


# ── Test 1: Vendor registration creates pending profile ───────────────────────

@pytest.mark.django_db
def test_vendor_registration_creates_pending_profile(api_client, vendor_user):
    api_client.force_authenticate(user=vendor_user)
    url = reverse('vendor-register')
    data = {'shop_name': 'My New Shop', 'description': 'Selling stuff'}
    response = api_client.post(url, data, format='json')

    assert response.status_code == 201
    assert VendorProfile.objects.filter(user=vendor_user).exists()
    profile = VendorProfile.objects.get(user=vendor_user)
    assert profile.verification_status == 'pending'
    assert profile.shop_name == 'My New Shop'


# ── Test 2: Unapproved (pending) vendor gets 403 on product creation ──────────

@pytest.mark.django_db
def test_pending_vendor_cannot_create_product(api_client, vendor_user, pending_vendor_profile, category):
    api_client.force_authenticate(user=vendor_user)
    url = reverse('product-list-create')
    data = {
        'name': 'Test Product',
        'description': 'A product',
        'price': '9.99',
        'stock': 10,
        'category': str(category.id),
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 403


# ── Test 3: Admin can approve a vendor ────────────────────────────────────────

@pytest.mark.django_db
def test_admin_can_approve_vendor(api_client, admin_user, pending_vendor_profile):
    api_client.force_authenticate(user=admin_user)
    url = reverse('admin-vendor-verify', kwargs={'id': pending_vendor_profile.id})
    response = api_client.patch(url, {'verification_status': 'approved'}, format='json')

    assert response.status_code == 200
    pending_vendor_profile.refresh_from_db()
    assert pending_vendor_profile.verification_status == 'approved'


# ── Test 4: Admin can reject a vendor ────────────────────────────────────────

@pytest.mark.django_db
def test_admin_can_reject_vendor(api_client, admin_user, pending_vendor_profile):
    api_client.force_authenticate(user=admin_user)
    url = reverse('admin-vendor-verify', kwargs={'id': pending_vendor_profile.id})
    response = api_client.patch(url, {'verification_status': 'rejected'}, format='json')

    assert response.status_code == 200
    pending_vendor_profile.refresh_from_db()
    assert pending_vendor_profile.verification_status == 'rejected'
