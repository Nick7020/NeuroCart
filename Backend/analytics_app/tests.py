from decimal import Decimal
from django.test import TestCase
from django.utils import timezone

from analytics_app.models import SalesRecord
from orders.models import Order, OrderItem
from products.models import Product, Category
from users.models import User
from vendors.models import VendorProfile
from services.order_service import create_sales_record, update_order_item_status


def make_vendor(email="vendor@test.com", shop_name="Test Shop"):
    user = User.objects.create_user(email=email, password="pass", role="vendor")
    return VendorProfile.objects.create(user=user, shop_name=shop_name, verification_status="approved")


def make_order_item(vendor, status="shipped", subtotal=Decimal("50.00")):
    customer = User.objects.create_user(
        email=f"customer_{vendor.shop_name}@test.com", password="pass", role="customer"
    )
    category = Category.objects.create(name="Electronics", slug=f"electronics-{vendor.id}")
    product = Product.objects.create(
        vendor=vendor, category=category, name="Widget",
        description="A widget", price=Decimal("25.00"), stock=10
    )
    order = Order.objects.create(user=customer, total_amount=subtotal, status="confirmed")
    return OrderItem.objects.create(
        order=order, product=product, vendor=vendor,
        quantity=2, unit_price=Decimal("25.00"), subtotal=subtotal, status=status
    )


class CreateSalesRecordTest(TestCase):
    def setUp(self):
        self.vendor = make_vendor()
        self.order_item = make_order_item(self.vendor, status="shipped")

    def test_creates_sales_record_with_correct_fields(self):
        create_sales_record(self.order_item)

        record = SalesRecord.objects.get(order_item=self.order_item)
        self.assertEqual(record.vendor, self.vendor)
        self.assertEqual(record.revenue, self.order_item.subtotal)
        self.assertEqual(record.date, timezone.now().date())

    def test_idempotent_does_not_duplicate(self):
        create_sales_record(self.order_item)
        create_sales_record(self.order_item)  # second call

        count = SalesRecord.objects.filter(order_item=self.order_item).count()
        self.assertEqual(count, 1)

    def test_revenue_matches_subtotal(self):
        self.order_item.subtotal = Decimal("123.45")
        self.order_item.save()

        create_sales_record(self.order_item)

        record = SalesRecord.objects.get(order_item=self.order_item)
        self.assertEqual(record.revenue, Decimal("123.45"))


class UpdateOrderItemStatusDeliveredTest(TestCase):
    def setUp(self):
        self.vendor = make_vendor(email="v2@test.com", shop_name="Shop2")
        self.order_item = make_order_item(self.vendor, status="shipped")

    def test_sales_record_created_on_delivered_transition(self):
        self.assertEqual(SalesRecord.objects.count(), 0)

        update_order_item_status(self.order_item, self.vendor, "delivered")

        self.assertEqual(SalesRecord.objects.count(), 1)
        record = SalesRecord.objects.get(order_item=self.order_item)
        self.assertEqual(record.vendor, self.vendor)
        self.assertEqual(record.revenue, self.order_item.subtotal)

    def test_no_sales_record_for_non_delivered_transition(self):
        item = make_order_item(
            make_vendor(email="v3@test.com", shop_name="Shop3"), status="pending"
        )
        update_order_item_status(item, item.vendor, "processing")

        self.assertEqual(SalesRecord.objects.count(), 0)

    def test_order_status_aggregated_to_delivered_when_all_items_delivered(self):
        update_order_item_status(self.order_item, self.vendor, "delivered")

        self.order_item.order.refresh_from_db()
        self.assertEqual(self.order_item.order.status, "delivered")


# ── Analytics Service Tests ───────────────────────────────────────────────────

from datetime import date, timedelta
from services.analytics_service import (
    get_admin_overview,
    get_sales_by_period,
    get_top_vendors,
    get_top_products,
    get_vendor_analytics,
    get_trending_products,
)


def make_sales_record(vendor, order_item, revenue, record_date=None):
    if record_date is None:
        record_date = date.today()
    return SalesRecord.objects.create(
        vendor=vendor,
        order_item=order_item,
        revenue=revenue,
        date=record_date,
    )


class GetAdminOverviewTest(TestCase):
    def test_returns_zeros_when_empty(self):
        result = get_admin_overview()
        self.assertEqual(result['total_revenue'], Decimal('0.00'))
        self.assertEqual(result['total_orders'], 0)
        self.assertEqual(result['total_customers'], 0)
        self.assertEqual(result['total_vendors'], 0)
        self.assertEqual(result['total_products'], 0)

    def test_counts_customers_and_vendors(self):
        User.objects.create_user(email='c1@test.com', password='pass', role='customer')
        User.objects.create_user(email='c2@test.com', password='pass', role='customer')
        make_vendor(email='v1@test.com', shop_name='Shop1')
        result = get_admin_overview()
        self.assertEqual(result['total_customers'], 2)
        self.assertEqual(result['total_vendors'], 1)

    def test_sums_revenue_from_sales_records(self):
        vendor = make_vendor(email='rev_v@test.com', shop_name='RevShop')
        item = make_order_item(vendor, status='delivered', subtotal=Decimal('100.00'))
        make_sales_record(vendor, item, Decimal('100.00'))
        result = get_admin_overview()
        self.assertEqual(result['total_revenue'], Decimal('100.00'))


class GetSalesByPeriodTest(TestCase):
    def setUp(self):
        self.vendor = make_vendor(email='sp_v@test.com', shop_name='SPShop')
        self.item = make_order_item(self.vendor, status='delivered', subtotal=Decimal('50.00'))
        self.today = date.today()
        make_sales_record(self.vendor, self.item, Decimal('50.00'), self.today)

    def test_returns_data_within_range(self):
        result = get_sales_by_period(self.today, self.today, granularity='day')
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['total_revenue'], Decimal('50.00'))

    def test_returns_empty_outside_range(self):
        yesterday = self.today - timedelta(days=1)
        result = get_sales_by_period(yesterday, yesterday, granularity='day')
        self.assertEqual(len(result), 0)

    def test_weekly_granularity(self):
        result = get_sales_by_period(self.today, self.today, granularity='week')
        self.assertEqual(len(result), 1)

    def test_monthly_granularity(self):
        result = get_sales_by_period(self.today, self.today, granularity='month')
        self.assertEqual(len(result), 1)


class GetTopVendorsTest(TestCase):
    def test_returns_empty_when_no_records(self):
        result = get_top_vendors()
        self.assertEqual(result, [])

    def test_returns_vendors_ordered_by_revenue(self):
        v1 = make_vendor(email='tv1@test.com', shop_name='TopShop1')
        v2 = make_vendor(email='tv2@test.com', shop_name='TopShop2')
        item1 = make_order_item(v1, status='delivered', subtotal=Decimal('200.00'))
        item2 = make_order_item(v2, status='delivered', subtotal=Decimal('100.00'))
        make_sales_record(v1, item1, Decimal('200.00'))
        make_sales_record(v2, item2, Decimal('100.00'))
        result = get_top_vendors(limit=10)
        self.assertEqual(result[0]['shop_name'], 'TopShop1')
        self.assertEqual(result[1]['shop_name'], 'TopShop2')


class GetTopProductsTest(TestCase):
    def test_returns_empty_when_no_orders(self):
        result = get_top_products()
        self.assertEqual(result, [])

    def test_returns_products_ordered_by_units_sold(self):
        vendor = make_vendor(email='tp_v@test.com', shop_name='TPShop')
        item = make_order_item(vendor, status='delivered', subtotal=Decimal('50.00'))
        result = get_top_products()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['units_sold'], 2)


class GetVendorAnalyticsTest(TestCase):
    def test_returns_zeros_for_vendor_with_no_sales(self):
        vendor = make_vendor(email='va_v@test.com', shop_name='VAShop')
        result = get_vendor_analytics(vendor)
        self.assertEqual(result['total_revenue'], Decimal('0.00'))
        self.assertEqual(result['order_count'], 0)
        self.assertEqual(result['top_products'], [])
        self.assertEqual(result['daily_revenue'], [])

    def test_returns_correct_revenue_for_vendor(self):
        vendor = make_vendor(email='va2_v@test.com', shop_name='VA2Shop')
        item = make_order_item(vendor, status='delivered', subtotal=Decimal('75.00'))
        make_sales_record(vendor, item, Decimal('75.00'))
        result = get_vendor_analytics(vendor)
        self.assertEqual(result['total_revenue'], Decimal('75.00'))
        self.assertEqual(result['order_count'], 1)

    def test_daily_revenue_includes_recent_records(self):
        vendor = make_vendor(email='va3_v@test.com', shop_name='VA3Shop')
        item = make_order_item(vendor, status='delivered', subtotal=Decimal('30.00'))
        make_sales_record(vendor, item, Decimal('30.00'), date.today())
        result = get_vendor_analytics(vendor)
        self.assertEqual(len(result['daily_revenue']), 1)


class GetTrendingProductsTest(TestCase):
    def test_returns_empty_when_no_orders(self):
        result = get_trending_products()
        self.assertEqual(result, [])

    def test_returns_products_with_recent_orders(self):
        vendor = make_vendor(email='trend_v@test.com', shop_name='TrendShop')
        make_order_item(vendor, status='pending', subtotal=Decimal('20.00'))
        result = get_trending_products(days=7)
        self.assertEqual(len(result), 1)
        self.assertIn('product_id', result[0])
        self.assertIn('order_count', result[0])


# ── Recommendation Service Tests ──────────────────────────────────────────────

from services.recommendation_service import get_also_bought, get_vendor_performance_score


class GetAlsoBoughtTest(TestCase):
    def test_returns_empty_when_no_co_purchases(self):
        vendor = make_vendor(email='rec_v@test.com', shop_name='RecShop')
        item = make_order_item(vendor, status='delivered', subtotal=Decimal('25.00'))
        result = get_also_bought(item.product_id)
        self.assertEqual(result, [])

    def test_returns_co_purchased_products(self):
        from django.core.cache import cache
        cache.clear()

        vendor = make_vendor(email='rec2_v@test.com', shop_name='Rec2Shop')
        customer = User.objects.create_user(email='rec_c@test.com', password='pass', role='customer')
        category = Category.objects.create(name='RecCat', slug='rec-cat')

        product_a = Product.objects.create(
            vendor=vendor, category=category, name='Product A',
            description='A', price=Decimal('10.00'), stock=10
        )
        product_b = Product.objects.create(
            vendor=vendor, category=category, name='Product B',
            description='B', price=Decimal('20.00'), stock=10
        )

        order = Order.objects.create(user=customer, total_amount=Decimal('30.00'), status='confirmed')
        OrderItem.objects.create(
            order=order, product=product_a, vendor=vendor,
            quantity=1, unit_price=Decimal('10.00'), subtotal=Decimal('10.00'), status='pending'
        )
        OrderItem.objects.create(
            order=order, product=product_b, vendor=vendor,
            quantity=1, unit_price=Decimal('20.00'), subtotal=Decimal('20.00'), status='pending'
        )

        result = get_also_bought(product_a.id)
        result_ids = [p.id for p in result]
        self.assertIn(product_b.id, result_ids)
        self.assertNotIn(product_a.id, result_ids)

    def test_excludes_out_of_stock_products(self):
        from django.core.cache import cache
        cache.clear()

        vendor = make_vendor(email='rec3_v@test.com', shop_name='Rec3Shop')
        customer = User.objects.create_user(email='rec3_c@test.com', password='pass', role='customer')
        category = Category.objects.create(name='RecCat3', slug='rec-cat-3')

        product_a = Product.objects.create(
            vendor=vendor, category=category, name='Product A3',
            description='A', price=Decimal('10.00'), stock=10
        )
        product_b = Product.objects.create(
            vendor=vendor, category=category, name='Product B3',
            description='B', price=Decimal('20.00'), stock=0  # out of stock
        )

        order = Order.objects.create(user=customer, total_amount=Decimal('30.00'), status='confirmed')
        OrderItem.objects.create(
            order=order, product=product_a, vendor=vendor,
            quantity=1, unit_price=Decimal('10.00'), subtotal=Decimal('10.00'), status='pending'
        )
        OrderItem.objects.create(
            order=order, product=product_b, vendor=vendor,
            quantity=1, unit_price=Decimal('20.00'), subtotal=Decimal('20.00'), status='pending'
        )

        result = get_also_bought(product_a.id)
        result_ids = [p.id for p in result]
        self.assertNotIn(product_b.id, result_ids)


class GetVendorPerformanceScoreTest(TestCase):
    def test_returns_zero_for_vendor_with_no_sales_or_rating(self):
        vendor = make_vendor(email='score_v@test.com', shop_name='ScoreShop')
        score = get_vendor_performance_score(vendor)
        self.assertEqual(score, 0.0)

    def test_score_uses_rating_and_sales(self):
        from django.core.cache import cache
        cache.clear()

        vendor = make_vendor(email='score2_v@test.com', shop_name='Score2Shop')
        vendor.rating = Decimal('4.0')
        vendor.total_sales = Decimal('100.00')
        vendor.save()

        score = get_vendor_performance_score(vendor)
        # score = (4.0 * 0.4) + (1.0 * 0.6) = 1.6 + 0.6 = 2.2 (normalized_sales = 1.0 since only vendor)
        self.assertAlmostEqual(score, 2.2, places=5)
