from django.db import models
from django.conf import settings
from uuid import uuid4


class VendorProfile(models.Model):
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user                = models.OneToOneField(
                            settings.AUTH_USER_MODEL,
                            on_delete=models.CASCADE,
                            related_name='vendor_profile'
                          )
    shop_name           = models.CharField(max_length=255, unique=True)
    description         = models.TextField(blank=True)
    verification_status = models.CharField(
                            max_length=20,
                            choices=VERIFICATION_STATUS_CHOICES,
                            default='pending'
                          )
    rating              = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sales         = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['verification_status']),
        ]

    def __str__(self):
        return self.shop_name
