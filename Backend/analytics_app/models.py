from django.db import models
from uuid import uuid4


class SalesRecord(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    vendor     = models.ForeignKey(
                   'vendors.VendorProfile',
                   on_delete=models.CASCADE,
                   related_name='sales_records'
                 )
    order_item = models.OneToOneField(
                   'orders.OrderItem',
                   on_delete=models.CASCADE
                 )
    revenue    = models.DecimalField(max_digits=12, decimal_places=2)
    date       = models.DateField()  # denormalized for fast date-range queries

    class Meta:
        indexes = [
            models.Index(fields=['vendor', 'date']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"SalesRecord({self.vendor}, {self.date}, {self.revenue})"
