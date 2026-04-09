"""
Recommendation service — co-occurrence recommendations, vendor scoring.
"""
import json
import logging

from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Max
from django.http import Http404

from orders.models import OrderItem
from products.models import Product
from vendors.models import VendorProfile
from services import analytics_service

logger = logging.getLogger(__name__)


def get_also_bought(product_id, limit=10):
    """Return products frequently ordered together with the given product.

    Uses a co-occurrence algorithm: finds orders containing the given product,
    then ranks other products in those orders by co-occurrence frequency.
    Excludes the current product and out-of-stock items.
    Falls back to same-category products when no co-occurrence data exists.
    Results are cached for 1 hour.
    """
    cache_key = f"rec_product_{product_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # Fetch the product object (needed for category fallback)
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise Http404

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
    ).select_related('category', 'vendor').prefetch_related('images')

    # Re-sort by the original co-occurrence ranking
    id_to_rank = {pid: idx for idx, pid in enumerate(ranked_ids)}
    result = sorted(products_qs, key=lambda p: id_to_rank.get(p.id, len(ranked_ids)))

    # Category fallback when co-occurrence yields no results
    if not result:
        result = list(
            Product.objects.filter(
                category=product.category,
                is_active=True,
                stock__gt=0,
            )
            .exclude(id=product_id)
            .select_related('category', 'vendor')
            .prefetch_related('images')
            .order_by('-created_at')[:limit]
        )

    # Enforce limit cap
    result = result[:min(limit, 10)]

    cache.set(cache_key, result, 3600)
    return result


def get_user_recommendations(user_id, limit=10):
    """Return personalised product recommendations for a user based on purchase history.

    Uses co-occurrence across all products the user has purchased to find items
    frequently bought together that the user hasn't yet purchased.
    Falls back to trending products when the user has no order history.
    Results are cached for 1 hour.
    """
    cache_key = f"rec_user_{user_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    limit = min(limit, 10)

    # 4.2 Collect all product IDs the user has purchased
    purchased_ids = set(
        OrderItem.objects.filter(
            order__user_id=user_id
        ).values_list('product_id', flat=True)
    )

    # 4.3 No purchase history → fall back to trending (trending has its own cache)
    if not purchased_ids:
        return analytics_service.get_trending_products(limit=limit)

    # 4.4 Run co-occurrence across all purchased products
    # Find all orders that contain any of the user's purchased products
    order_ids_for_purchased = OrderItem.objects.filter(
        product_id__in=purchased_ids
    ).values_list('order_id', flat=True)

    co_occurring = (
        OrderItem.objects
        .filter(order_id__in=order_ids_for_purchased)
        .exclude(product_id__in=purchased_ids)
        .values('product_id')
        .annotate(co_count=Count('product_id'))
        .order_by('-co_count')
    )

    ranked_ids = [row['product_id'] for row in co_occurring]

    # 4.5 Fetch final Product queryset with select_related/prefetch_related
    products_qs = Product.objects.filter(
        id__in=ranked_ids,
        is_active=True,
        stock__gt=0,
    ).select_related('category', 'vendor').prefetch_related('images')

    # Re-sort by co_count rank and slice to limit
    id_to_rank = {pid: idx for idx, pid in enumerate(ranked_ids)}
    result = sorted(products_qs, key=lambda p: id_to_rank.get(p.id, len(ranked_ids)))
    result = result[:limit]

    # 4.6 Cache the result
    cache.set(cache_key, result, 3600)
    return result


def get_ai_recommendations(user_id, limit=10):
    """Return AI-enhanced product recommendations for a user via OpenAI re-ranking.

    Fetches the user's last 5 purchased products and up to 20 candidate products
    from get_user_recommendations, then asks OpenAI to rank the candidates by
    relevance. Falls back to get_user_recommendations on any failure or when
    OPENAI_API_KEY is not configured.

    AI results are NOT cached (user-specific, dynamic OpenAI responses).
    """
    limit = min(limit, 10)

    # 5.2 No API key → immediate fallback, no external call
    if not getattr(settings, 'OPENAI_API_KEY', ''):
        return get_user_recommendations(user_id, limit)

    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY

        # 5.3 Fetch user's last 5 purchased products
        last_purchased = list(
            Product.objects.filter(
                orderitem__order__user_id=user_id
            )
            .order_by('-orderitem__order__created_at')
            .distinct()[:5]
        )

        # 5.4 Fetch up to 20 candidate products
        candidates = get_user_recommendations(user_id, limit=20)

        if not candidates:
            return []

        # 5.5 Build OpenAI prompt
        purchased_lines = "\n".join(
            f"{i + 1}. {p.name}: {p.description or ''}"
            for i, p in enumerate(last_purchased)
        )
        candidate_lines = "\n".join(
            f"{i + 1}. {p.id}: {p.name}: {p.description or ''}"
            for i, p in enumerate(candidates)
        )
        prompt = (
            "You are a product recommendation engine.\n\n"
            "The user recently purchased these products:\n"
            f"{purchased_lines}\n\n"
            "Rank the following candidate products by relevance to the user's interests. "
            "Return ONLY a JSON array of product IDs (UUIDs) in order from most to least relevant.\n\n"
            f"Candidates:\n{candidate_lines}\n\n"
            "Response (JSON array of UUIDs only):"
        )

        # 5.6 Call OpenAI
        response = openai.chat.completions.create(
            model='gpt-4o-mini',
            messages=[{'role': 'user', 'content': prompt}],
        )

        content = response.choices[0].message.content.strip()

        # 5.7 Parse response as JSON array of UUIDs
        try:
            ranked_ids = json.loads(content)
            if not isinstance(ranked_ids, list):
                raise ValueError("Response is not a list")
        except (json.JSONDecodeError, ValueError) as exc:
            logger.warning("get_ai_recommendations: failed to parse OpenAI response: %s", exc)
            return get_user_recommendations(user_id, limit)

        # 5.8 Fetch products, re-sort by AI rank, slice to limit
        products_qs = Product.objects.filter(
            id__in=ranked_ids,
            is_active=True,
            stock__gt=0,
        ).select_related('category', 'vendor').prefetch_related('images')

        id_to_rank = {str(pid): idx for idx, pid in enumerate(ranked_ids)}
        result = sorted(products_qs, key=lambda p: id_to_rank.get(str(p.id), len(ranked_ids)))
        return result[:limit]

    except Exception as exc:  # noqa: BLE001
        # 5.9 Any OpenAI exception → log and fall back
        logger.warning("get_ai_recommendations: OpenAI call failed: %s", exc)
        return get_user_recommendations(user_id, limit)


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
