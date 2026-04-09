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
