"""
Analytics service — aggregation queries, trend calculations.
"""
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum, Count, DecimalField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth

from analytics_app.models import SalesRecord
from orders.models import Order, OrderItem
from products.models import Product
from users.models import User
from vendors.models import VendorProfile


def get_admin_overview() -> dict:
    """Return total revenue, orders, customers, vendors, products."""
    total_revenue = SalesRecord.objects.aggregate(
        total=Sum('revenue', default=Decimal('0.00'))
    )['total'] or Decimal('0.00')

    total_orders = Order.objects.count()
    total_customers = User.objects.filter(role='customer').count()
    total_vendors = VendorProfile.objects.count()
    total_products = Product.objects.filter(is_active=True).count()

    return {
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'total_customers': total_customers,
        'total_vendors': total_vendors,
        'total_products': total_products,
    }


def get_sales_by_period(start_date, end_date, granularity='day') -> list:
    """Return daily/weekly/monthly sales breakdown."""
    trunc_map = {
        'day': TruncDay,
        'week': TruncWeek,
        'month': TruncMonth,
    }
    trunc_fn = trunc_map.get(granularity, TruncDay)

    qs = (
        SalesRecord.objects
        .filter(date__range=(start_date, end_date))
        .annotate(period=trunc_fn('date'))
        .values('period')
        .annotate(
            total_revenue=Sum('revenue', output_field=DecimalField()),
            total_orders=Count('order_item__order', distinct=True),
        )
        .order_by('period')
    )

    return [
        {
            'period': entry['period'],
            'total_revenue': entry['total_revenue'] or Decimal('0.00'),
            'total_orders': entry['total_orders'] or 0,
        }
        for entry in qs
    ]


def get_top_vendors(limit=10) -> list:
    """Return top vendors by total revenue."""
    qs = (
        SalesRecord.objects
        .values('vendor__id', 'vendor__shop_name')
        .annotate(total_revenue=Sum('revenue', output_field=DecimalField()))
        .order_by('-total_revenue')[:limit]
    )

    return [
        {
            'vendor_id': entry['vendor__id'],
            'shop_name': entry['vendor__shop_name'],
            'total_revenue': entry['total_revenue'] or Decimal('0.00'),
        }
        for entry in qs
    ]


def get_top_products(limit=10) -> list:
    """Return top products by units sold."""
    qs = (
        OrderItem.objects
        .values('product__id', 'product__name')
        .annotate(units_sold=Sum('quantity'))
        .order_by('-units_sold')[:limit]
    )

    return [
        {
            'product_id': entry['product__id'],
            'product_name': entry['product__name'],
            'units_sold': entry['units_sold'] or 0,
        }
        for entry in qs
    ]


def get_vendor_analytics(vendor) -> dict:
    """Return vendor's own revenue, order count, top products, daily revenue last 30 days."""
    vendor_records = SalesRecord.objects.filter(vendor=vendor)

    totals = vendor_records.aggregate(
        total_revenue=Sum('revenue', default=Decimal('0.00')),
    )
    total_revenue = totals['total_revenue'] or Decimal('0.00')

    order_count = (
        OrderItem.objects
        .filter(vendor=vendor)
        .values('order')
        .distinct()
        .count()
    )

    top_products = (
        OrderItem.objects
        .filter(vendor=vendor)
        .values('product__id', 'product__name')
        .annotate(units_sold=Sum('quantity'))
        .order_by('-units_sold')[:5]
    )
    top_products_list = [
        {
            'product_id': entry['product__id'],
            'product_name': entry['product__name'],
            'units_sold': entry['units_sold'] or 0,
        }
        for entry in top_products
    ]

    thirty_days_ago = date.today() - timedelta(days=29)
    daily_revenue = (
        vendor_records
        .filter(date__gte=thirty_days_ago)
        .annotate(day=TruncDay('date'))
        .values('day')
        .annotate(revenue=Sum('revenue', output_field=DecimalField()))
        .order_by('day')
    )
    daily_revenue_list = [
        {
            'date': entry['day'],
            'revenue': entry['revenue'] or Decimal('0.00'),
        }
        for entry in daily_revenue
    ]

    return {
        'total_revenue': total_revenue,
        'order_count': order_count,
        'top_products': top_products_list,
        'daily_revenue': daily_revenue_list,
    }


def get_trending_products(days=7, limit=10) -> list:
    """Return top products by order frequency in the given window."""
    since = date.today() - timedelta(days=days)

    qs = (
        OrderItem.objects
        .filter(order__created_at__date__gte=since)
        .values('product__id', 'product__name')
        .annotate(order_count=Count('order', distinct=True))
        .order_by('-order_count')[:limit]
    )

    return [
        {
            'product_id': entry['product__id'],
            'product_name': entry['product__name'],
            'order_count': entry['order_count'] or 0,
        }
        for entry in qs
    ]
