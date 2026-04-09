from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4

from users.models import User
from vendors.models import VendorProfile
from products.models import Category, Product


def make_approved_vendor(email, shop_name):
    """Helper: create a user + approved VendorProfile."""
    user = User.objects.create_user(
        email=email,
        password='testpass123',
        role='vendor',
    )
    vendor = VendorProfile.objects.create(
        user=user,
        shop_name=shop_name,
        verification_status='approved',
    )
    return user, vendor


def make_product(vendor, name='Test Product'):
    """Helper: create a product for a vendor."""
    category = Category.objects.get_or_create(
        slug='test-cat',
        defaults={'name': 'Test Category'},
    )[0]
    return Product.objects.create(
        vendor=vendor,
        category=category,
        name=name,
        description='A test product',
        price='9.99',
        stock=10,
    )


class IsVendorOwnerUpdateTest(TestCase):
    """Task 12.3 — IsVendorOwner on ProductUpdateView."""

    def setUp(self):
        self.client = APIClient()
        self.owner_user, self.owner_vendor = make_approved_vendor(
            'owner@example.com', 'Owner Shop'
        )
        self.other_user, self.other_vendor = make_approved_vendor(
            'other@example.com', 'Other Shop'
        )
        self.product = make_product(self.owner_vendor, 'Owner Product')

    def _url(self):
        return reverse('product-update', kwargs={'pk': self.product.pk})

    def _payload(self):
        return {
            'name': 'Updated Name',
            'description': 'Updated description',
            'price': '19.99',
            'stock': 5,
        }

    def test_owner_can_update_own_product(self):
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.put(self._url(), self._payload(), format='json')
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Updated Name')

    def test_other_vendor_cannot_update_product(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.put(self._url(), self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_update_product(self):
        response = self.client.put(self._url(), self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class IsVendorOwnerDeleteTest(TestCase):
    """Task 12.3 — IsVendorOwner on ProductDeleteView."""

    def setUp(self):
        self.client = APIClient()
        self.owner_user, self.owner_vendor = make_approved_vendor(
            'del_owner@example.com', 'Del Owner Shop'
        )
        self.other_user, self.other_vendor = make_approved_vendor(
            'del_other@example.com', 'Del Other Shop'
        )
        self.product = make_product(self.owner_vendor, 'Deletable Product')

    def _url(self):
        return reverse('product-delete', kwargs={'pk': self.product.pk})

    def test_other_vendor_cannot_delete_product(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # Product should still be active
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_active)

    def test_owner_can_soft_delete_own_product(self):
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_active)

    def test_unauthenticated_cannot_delete_product(self):
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
