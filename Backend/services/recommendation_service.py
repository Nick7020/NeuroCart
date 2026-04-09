"""
Recommendation service — co-occurrence recommendations, vendor scoring.
"""


def get_also_bought(product_id, limit=5):
    """Return products frequently ordered together with the given product."""
    raise NotImplementedError


def get_vendor_performance_score(vendor):
    """Return weighted vendor performance score: (rating * 0.4) + (normalized_sales * 0.6)."""
    raise NotImplementedError
