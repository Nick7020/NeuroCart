from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from vendors.models import VendorProfile
from products.models import Category, Product


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_user(email, role='customer', password='testpass123'):
    return User.objects.create_user(email=email, password=password, role=role)


def make_vendor(email, shop_name, verification_status='approved'):
    user = make_user(email, role='vendor')
    vendor = VendorProfile.objects.create(
        user=user,
        shop_name=shop_name,
        verification_status=verification_status,
    )
    return user, vendor


def make_category(name='Electronics', slug='electronics'):
    return Category.objects.get_or_create(slug=slug, defaults={'name': name})[0]


def make_product(vendor, name='Widget', price='9.99', stock=10, category=None, is_active=True):
    if category is None:
        category = make_category()
    return Product.objects.create(
        vendor=vendor,
        category=category,
        name=name,
        description='A test product',
        price=price,
        stock=stock,
        is_active=is_active,
    )


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ── Product CRUD by vendor owner ──────────────────────────────────────────────

class ProductCreateTest(TestCase):
    def setUp(self):
        self.category = make_category()
        self.owner_user, self.owner_vendor = make_vendor('vendor@example.com', 'My Shop')
        self.pending_user, _ = make_vendor('pending@example.com', 'Pending Shop', 'pending')
        self.customer_user = make_user('customer@example.com', role='customer')
        self.url = reverse('product-list-create')

    def _payload(self):
        return {
            'name': 'New Product',
            'description': 'Great item',
            'price': '29.99',
            'stock': 5,
            'category': str(self.category.pk),
        }

    def test_approved_vendor_can_create_product(self):
        client = auth_client(self.owner_user)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.filter(vendor=self.owner_vendor).count(), 1)

    def test_created_product_belongs_to_requesting_vendor(self):
        client = auth_client(self.owner_user)
        client.post(self.url, self._payload(), format='json')
        product = Product.objects.get(vendor=self.owner_vendor)
        self.assertEqual(product.name, 'New Product')

    def test_pending_vendor_cannot_create_product(self):
        client = auth_client(self.pending_user)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_create_product(self):
        client = auth_client(self.customer_user)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_product(self):
        response = APIClient().post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_product_with_negative_price_fails(self):
        client = auth_client(self.owner_user)
        payload = self._payload()
        payload['price'] = '-5.00'
        response = client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_product_with_negative_stock_fails(self):
        client = auth_client(self.owner_user)
        payload = self._payload()
        payload['stock'] = -1
        response = client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProductUpdateTest(TestCase):
    def setUp(self):
        self.owner_user, self.owner_vendor = make_vendor('owner@example.com', 'Owner Shop')
        self.product = make_product(self.owner_vendor, 'Original Name')
        self.url = reverse('product-update', kwargs={'pk': self.product.pk})

    def _payload(self):
        return {
            'name': 'Updated Name',
            'description': 'Updated description',
            'price': '19.99',
            'stock': 5,
        }

    def test_owner_can_update_own_product(self):
        client = auth_client(self.owner_user)
        response = client.put(self.url, self._payload(), format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Updated Name')
        self.assertEqual(str(self.product.price), '19.99')

    def test_unauthenticated_cannot_update_product(self):
        response = APIClient().put(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class VendorProductListTest(TestCase):
    def setUp(self):
        self.owner_user, self.owner_vendor = make_vendor('vlist@example.com', 'List Shop')
        self.other_user, self.other_vendor = make_vendor('other@example.com', 'Other Shop')
        make_product(self.owner_vendor, 'Product A')
        make_product(self.owner_vendor, 'Product B')
        make_product(self.other_vendor, 'Other Product')
        self.url = reverse('vendor-product-list')

    def test_vendor_sees_only_own_products(self):
        client = auth_client(self.owner_user)
        response = client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Product A', names)
        self.assertIn('Product B', names)
        self.assertNotIn('Other Product', names)

    def test_unauthenticated_cannot_access_vendor_product_list(self):
        response = APIClient().get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ── Non-owner vendor cannot update/delete ─────────────────────────────────────

class NonOwnerVendorUpdateTest(TestCase):
    def setUp(self):
        self.owner_user, self.owner_vendor = make_vendor('owner2@example.com', 'Owner Shop 2')
        self.other_user, self.other_vendor = make_vendor('other2@example.com', 'Other Shop 2')
        self.product = make_product(self.owner_vendor, 'Owner Product')
        self.update_url = reverse('product-update', kwargs={'pk': self.product.pk})
        self.delete_url = reverse('product-delete', kwargs={'pk': self.product.pk})

    def _payload(self):
        return {
            'name': 'Hijacked Name',
            'description': 'Hijacked',
            'price': '1.00',
            'stock': 1,
        }

    def test_other_vendor_cannot_update_product(self):
        client = auth_client(self.other_user)
        response = client.put(self.update_url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Owner Product')

    def test_other_vendor_cannot_delete_product(self):
        client = auth_client(self.other_user)
        response = client.delete(self.delete_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_active)

    def test_customer_cannot_update_product(self):
        customer = make_user('cust2@example.com', role='customer')
        client = auth_client(customer)
        response = client.put(self.update_url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ── Product filter/search ─────────────────────────────────────────────────────

class ProductFilterSearchTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        _, self.vendor = make_vendor('filter_vendor@example.com', 'Filter Shop')

        self.electronics = make_category('Electronics', 'electronics')
        self.books = make_category('Books', 'books')
        self.sub_electronics = Category.objects.create(
            name='Phones', slug='phones', parent_category=self.electronics
        )

        self.laptop = make_product(self.vendor, 'Laptop', price='999.99', stock=5, category=self.electronics)
        self.phone = make_product(self.vendor, 'Smartphone', price='499.99', stock=3, category=self.sub_electronics)
        self.book = make_product(self.vendor, 'Python Book', price='29.99', stock=0, category=self.books)
        self.novel = make_product(self.vendor, 'Great Novel', price='14.99', stock=8, category=self.books)

        self.url = reverse('product-list-create')

    def test_filter_by_category_returns_direct_products(self):
        response = self.client.get(self.url, {'category': str(self.books.pk)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Python Book', names)
        self.assertIn('Great Novel', names)
        self.assertNotIn('Laptop', names)

    def test_filter_by_category_includes_subcategory_products(self):
        # Filtering by Electronics should also return Smartphone (in Phones sub-category)
        response = self.client.get(self.url, {'category': str(self.electronics.pk)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Laptop', names)
        self.assertIn('Smartphone', names)
        self.assertNotIn('Python Book', names)

    def test_filter_by_price_min(self):
        response = self.client.get(self.url, {'price_min': '100'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Laptop', names)
        self.assertIn('Smartphone', names)
        self.assertNotIn('Python Book', names)
        self.assertNotIn('Great Novel', names)

    def test_filter_by_price_max(self):
        response = self.client.get(self.url, {'price_max': '50'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Python Book', names)
        self.assertIn('Great Novel', names)
        self.assertNotIn('Laptop', names)

    def test_filter_by_price_range(self):
        response = self.client.get(self.url, {'price_min': '20', 'price_max': '600'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Smartphone', names)
        self.assertIn('Python Book', names)
        self.assertNotIn('Laptop', names)
        self.assertNotIn('Great Novel', names)

    def test_filter_in_stock_true_excludes_out_of_stock(self):
        response = self.client.get(self.url, {'in_stock': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertNotIn('Python Book', names)  # stock=0
        self.assertIn('Laptop', names)
        self.assertIn('Smartphone', names)
        self.assertIn('Great Novel', names)

    def test_filter_in_stock_false_returns_only_out_of_stock(self):
        response = self.client.get(self.url, {'in_stock': 'false'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Python Book', names)
        self.assertNotIn('Laptop', names)

    def test_search_by_name(self):
        response = self.client.get(self.url, {'search': 'Laptop'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Laptop', names)
        self.assertNotIn('Smartphone', names)

    def test_search_by_description(self):
        # Give one product a unique description to search on
        self.laptop.description = 'High performance ultrabook'
        self.laptop.save()
        response = self.client.get(self.url, {'search': 'ultrabook'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Laptop', names)
        self.assertNotIn('Smartphone', names)

    def test_search_is_case_insensitive(self):
        response = self.client.get(self.url, {'search': 'laptop'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertIn('Laptop', names)

    def test_filter_by_vendor_id(self):
        _, other_vendor = make_vendor('other_filter@example.com', 'Other Filter Shop')
        make_product(other_vendor, 'Other Vendor Product', category=self.electronics)

        response = self.client.get(self.url, {'vendor_id': str(self.vendor.pk)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertNotIn('Other Vendor Product', names)
        self.assertIn('Laptop', names)

    def test_public_list_excludes_inactive_products(self):
        make_product(self.vendor, 'Hidden Product', is_active=False, category=self.electronics)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['name'] for p in response.data['results']]
        self.assertNotIn('Hidden Product', names)

    def test_list_is_paginated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('results', response.data)


# ── Soft-delete sets is_active=False ─────────────────────────────────────────

class SoftDeleteTest(TestCase):
    def setUp(self):
        self.owner_user, self.owner_vendor = make_vendor('softdel@example.com', 'Soft Del Shop')
        self.product = make_product(self.owner_vendor, 'Deletable Product')
        self.delete_url = reverse('product-delete', kwargs={'pk': self.product.pk})
        self.list_url = reverse('product-list-create')

    def test_delete_sets_is_active_false(self):
        client = auth_client(self.owner_user)
        response = client.delete(self.delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_active)

    def test_delete_does_not_remove_db_record(self):
        client = auth_client(self.owner_user)
        client.delete(self.delete_url)
        self.assertTrue(Product.objects.filter(pk=self.product.pk).exists())

    def test_soft_deleted_product_hidden_from_public_list(self):
        client = auth_client(self.owner_user)
        client.delete(self.delete_url)

        response = APIClient().get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [p['id'] for p in response.data['results']]
        self.assertNotIn(str(self.product.pk), ids)

    def test_soft_deleted_product_still_in_vendor_list(self):
        """Vendor's own list includes inactive products (all their products)."""
        client = auth_client(self.owner_user)
        client.delete(self.delete_url)

        vendor_list_url = reverse('vendor-product-list')
        response = client.get(vendor_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [p['id'] for p in response.data['results']]
        self.assertIn(str(self.product.pk), ids)

    def test_soft_delete_returns_204_not_200(self):
        client = auth_client(self.owner_user)
        response = client.delete(self.delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


# ── IsVendorOwner (kept from task 12.3) ──────────────────────────────────────

class IsVendorOwnerUpdateTest(TestCase):
    """Task 12.3 — IsVendorOwner on ProductUpdateView."""

    def setUp(self):
        self.client = APIClient()
        self.owner_user, self.owner_vendor = make_vendor('owner_12@example.com', 'Owner Shop 12')
        self.other_user, _ = make_vendor('other_12@example.com', 'Other Shop 12')
        self.product = make_product(self.owner_vendor, 'Owner Product 12')

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
        self.owner_user, self.owner_vendor = make_vendor('del_owner_12@example.com', 'Del Owner Shop 12')
        self.other_user, _ = make_vendor('del_other_12@example.com', 'Del Other Shop 12')
        self.product = make_product(self.owner_vendor, 'Deletable Product 12')

    def _url(self):
        return reverse('product-delete', kwargs={'pk': self.product.pk})

    def test_other_vendor_cannot_delete_product(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
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


# ── Review Tests ──────────────────────────────────────────────────────────────

from products.models import Review
from orders.models import Order, OrderItem


def make_order(user, status='delivered'):
    return Order.objects.create(user=user, total_amount='9.99', status=status)


def make_order_item(order, product, vendor, item_status='delivered'):
    return OrderItem.objects.create(
        order=order,
        product=product,
        vendor=vendor,
        quantity=1,
        unit_price=product.price,
        subtotal=product.price,
        status=item_status,
    )


class ReviewRequiresDeliveredOrderItemTest(TestCase):
    """Task 14.7 — Review requires a delivered OrderItem for that product."""

    def setUp(self):
        self.vendor_user, self.vendor = make_vendor('rv_vendor@example.com', 'RV Shop')
        self.customer = make_user('rv_customer@example.com', role='customer')
        self.product = make_product(self.vendor, 'Reviewable Widget')
        self.url = reverse('review-create', kwargs={'pk': self.product.pk})

    def _payload(self):
        return {'rating': 4, 'comment': 'Great product!'}

    def test_review_without_any_order_returns_400(self):
        """No order at all — must be rejected."""
        client = auth_client(self.customer)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_with_non_delivered_order_item_returns_400(self):
        """OrderItem exists but is not delivered — must be rejected."""
        order = make_order(self.customer, status='confirmed')
        make_order_item(order, self.product, self.vendor, item_status='processing')

        client = auth_client(self.customer)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_with_delivered_order_item_succeeds(self):
        """Delivered OrderItem present — review must be accepted."""
        order = make_order(self.customer, status='delivered')
        make_order_item(order, self.product, self.vendor, item_status='delivered')

        client = auth_client(self.customer)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_cannot_submit_review(self):
        response = APIClient().post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DuplicateReviewTest(TestCase):
    """Task 14.7 — A user cannot submit more than one review per product."""

    def setUp(self):
        self.vendor_user, self.vendor = make_vendor('dup_vendor@example.com', 'Dup Shop')
        self.customer = make_user('dup_customer@example.com', role='customer')
        self.product = make_product(self.vendor, 'Dup Widget')
        self.url = reverse('review-create', kwargs={'pk': self.product.pk})

        # Give the customer a delivered order item so the first review is valid
        order = make_order(self.customer, status='delivered')
        make_order_item(order, self.product, self.vendor, item_status='delivered')

    def _payload(self):
        return {'rating': 5, 'comment': 'Excellent!'}

    def test_first_review_succeeds(self):
        client = auth_client(self.customer)
        response = client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_review_returns_400(self):
        """Second review for the same product by the same user must return 400."""
        client = auth_client(self.customer)
        # First review
        client.post(self.url, self._payload(), format='json')
        # Second review
        response = client.post(self.url, {'rating': 3, 'comment': 'Changed my mind'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_one_review_stored_after_duplicate_attempt(self):
        client = auth_client(self.customer)
        client.post(self.url, self._payload(), format='json')
        client.post(self.url, {'rating': 3, 'comment': 'Changed my mind'}, format='json')
        self.assertEqual(Review.objects.filter(user=self.customer, product=self.product).count(), 1)


class VendorRatingRecalculationTest(TestCase):
    """Task 14.7 — Vendor rating recalculates after review save/delete."""

    def setUp(self):
        self.vendor_user, self.vendor = make_vendor('rating_vendor@example.com', 'Rating Shop')
        self.customer1 = make_user('rating_c1@example.com', role='customer')
        self.customer2 = make_user('rating_c2@example.com', role='customer')
        self.product = make_product(self.vendor, 'Rated Widget')

        # Give both customers delivered order items
        for customer in (self.customer1, self.customer2):
            order = make_order(customer, status='delivered')
            make_order_item(order, self.product, self.vendor, item_status='delivered')

    def test_vendor_rating_updates_after_first_review(self):
        Review.objects.create(user=self.customer1, product=self.product, rating=4)
        self.vendor.refresh_from_db()
        self.assertAlmostEqual(float(self.vendor.rating), 4.0)

    def test_vendor_rating_is_average_of_all_reviews(self):
        Review.objects.create(user=self.customer1, product=self.product, rating=4)
        Review.objects.create(user=self.customer2, product=self.product, rating=2)
        self.vendor.refresh_from_db()
        self.assertAlmostEqual(float(self.vendor.rating), 3.0)

    def test_vendor_rating_resets_to_zero_when_all_reviews_deleted(self):
        review = Review.objects.create(user=self.customer1, product=self.product, rating=5)
        review.delete()
        self.vendor.refresh_from_db()
        self.assertAlmostEqual(float(self.vendor.rating), 0.0)

    def test_vendor_rating_recalculates_after_review_deleted(self):
        review1 = Review.objects.create(user=self.customer1, product=self.product, rating=4)
        Review.objects.create(user=self.customer2, product=self.product, rating=2)
        # Delete first review — average should now be 2.0
        review1.delete()
        self.vendor.refresh_from_db()
        self.assertAlmostEqual(float(self.vendor.rating), 2.0)

    def test_vendor_rating_via_api_after_review_submission(self):
        """End-to-end: submitting a review via API updates vendor rating."""
        url = reverse('review-create', kwargs={'pk': self.product.pk})
        client = auth_client(self.customer1)
        client.post(url, {'rating': 5, 'comment': 'Perfect!'}, format='json')
        self.vendor.refresh_from_db()
        self.assertAlmostEqual(float(self.vendor.rating), 5.0)
