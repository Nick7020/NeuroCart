"""
Analytics service — aggregation queries, trend calculations.
"""


def get_admin_overview():
    """Return total revenue, orders, customers, vendors, products."""
    raise NotImplementedError


def get_sales_by_period(start_date, end_date, granularity='day'):
    """Return daily/weekly/monthly sales breakdown."""
    raise NotImplementedError


def get_top_vendors(limit=10):
    """Return top vendors by total revenue."""
    raise NotImplementedError


def get_top_products(limit=10):
    """Return top products by units sold."""
    raise NotImplementedError


def get_vendor_analytics(vendor):
    """Return vendor's own revenue, order count, top products, daily revenue last 30 days."""
    raise NotImplementedError


def get_trending_products(days=7, limit=10):
    """Return top products by order frequency in the given window."""
    raise NotImplementedError
