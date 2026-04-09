from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from uuid import uuid4


class Category(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name            = models.CharField(max_length=200)
    slug            = models.SlugField(unique=True)
    parent_category = models.ForeignKey(
                        'self',
                        null=True,
                        blank=True,
                        on_delete=models.SET_NULL,
                        related_name='children'
                      )
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    vendor      = models.ForeignKey(
                    'vendors.VendorProfile',
                    on_delete=models.CASCADE,
                    related_name='products'
                  )
    category    = models.ForeignKey(
                    Category,
                    on_delete=models.SET_NULL,
                    null=True,
                    related_name='products'
                  )
    name        = models.CharField(max_length=500)
    description = models.TextField()
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount    = models.PositiveSmallIntegerField(default=0, help_text='Discount percentage 0-100')
    stock       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['vendor']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['price']),
            models.Index(fields=['vendor', 'is_active']),
            models.Index(fields=['is_active', 'category']),
        ]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url  = models.URLField()
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name} (primary={self.is_primary})"


class Review(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user       = models.ForeignKey(
                   settings.AUTH_USER_MODEL,
                   on_delete=models.CASCADE,
                   related_name='reviews'
                 )
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    order_item = models.ForeignKey(
                   'orders.OrderItem',
                   on_delete=models.SET_NULL,
                   null=True,
                   blank=True
                 )
    rating     = models.PositiveSmallIntegerField(
                   validators=[MinValueValidator(1), MaxValueValidator(5)]
                 )
    comment    = models.TextField(max_length=1000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product')
        indexes = [
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"Review by {self.user} on {self.product.name} ({self.rating}/5)"
