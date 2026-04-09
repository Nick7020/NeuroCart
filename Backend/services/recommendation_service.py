"""
Recommendation service — co-occurrence recommendations, vendor scoring.
"""
from django.core.cache import cache
from django.db.models import Count, Max

from orders.models import OrderItem
from products.models import Product
from vendors.models import VendorProfile


def get_also_bought(product_id, limit=5):
    """Return products frequently ordered together with the given product.

    Uses a co-occurrence algorithm: finds orders containing the given product,
    then ranks other products in those orders by co-occurrence frequency.
    Excludes the current product and out-of-stock items.
    Results are cached for 1 hour.
    """
    cache_key = f"also_bought_{product_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # Find all order IDs that contain the given product
    order_ids = OrderItem.objects.filter(
        product_id=product_id
    ).values_list("order_id", flat=True)

    # Find other products in those orders, ranked by co-occurrence count
    co_occurring = (
        OrderItem.objects.filter(order_id__in=order_ids)
        .exclude(product_id=product_id)
        .values("product_id")
        .annotate(co_count=Count("product_id"))
        .order_by("-co_count")
    )

    # Collect product IDs in ranked order, then filter for in-stock active products
    ranked_ids = [row["product_id"] for row in co_occurring]

    # Preserve ranking order while filtering
    products_qs = Product.objects.filter(
        id__in=ranked_ids,
        stock__gt=0,
        is_active=True,
    )

    # Re-sort by the original co-occurrence ranking
    id_to_rank = {pid: idx for idx, pid in enumerate(ranked_ids)}
    result = sorted(products_qs, key=lambda p: id_to_rank.get(p.id, len(ranked_ids)))[:limit]

    cache.set(cache_key, result, 3600)
    return result


def get_vendor_performance_score(vendor):
    """Return weighted vendor performance score.

    score = (vendor.rating * 0.4) + (normalized_sales * 0.6)

    Sales are normalized against the maximum total_sales across all vendors.
    If max total_sales is 0, normalized_sales is treated as 0.
    Result is cached for 1 hour.
    """
    cache_key = f"vendor_score_{vendor.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    max_sales = VendorProfile.objects.aggregate(max_sales=Max("total_sales"))["max_sales"] or 0

    if max_sales > 0:
        normalized_sales = float(vendor.total_sales) / float(max_sales)
    else:
        normalized_sales = 0.0

    score = (float(vendor.rating) * 0.4) + (normalized_sales * 0.6)

    cache.set(cache_key, score, 3600)
    return score
