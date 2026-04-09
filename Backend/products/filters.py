import django_filters
from .models import Product, Category


def get_category_ids(category_id):
    """Recursively collect a category and all its descendant IDs."""
    try:
        root = Category.objects.get(pk=category_id)
    except Category.DoesNotExist:
        return []

    ids = [root.pk]
    queue = list(root.children.values_list('pk', flat=True))
    while queue:
        current_id = queue.pop()
        ids.append(current_id)
        children = Category.objects.filter(parent_category_id=current_id).values_list('pk', flat=True)
        queue.extend(children)
    return ids


class ProductFilter(django_filters.FilterSet):
    category = django_filters.UUIDFilter(method='filter_category')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    vendor_id = django_filters.UUIDFilter(field_name='vendor__id')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['category', 'price_min', 'price_max', 'vendor_id', 'in_stock']

    def filter_category(self, queryset, name, value):
        ids = get_category_ids(value)
        if not ids:
            return queryset.none()
        return queryset.filter(category_id__in=ids)

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
