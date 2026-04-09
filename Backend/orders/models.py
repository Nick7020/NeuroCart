from django.db import models
from uuid import uuid4


# Stub models — full implementation in Task 5 (Cart) and Task 6 (Orders)

class Cart(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user       = models.OneToOneField(
                   'users.User',
                   on_delete=models.CASCADE,
                   related_name='cart'
                 )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart({self.user})"


class CartItem(models.Model):
    id       = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"CartItem({self.product}, qty={self.quantity})"


ORDER_STATUS = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('partially_shipped', 'Partially Shipped'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
    ('refunded', 'Refunded'),
]

ORDER_ITEM_STATUS = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
]


class Order(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user         = models.ForeignKey(
                     'users.User',
                     on_delete=models.PROTECT,
                     related_name='orders'
                   )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status       = models.CharField(choices=ORDER_STATUS, default='pending', max_length=20)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Order({self.id}, {self.user}, {self.status})"


class OrderItem(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    order      = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    vendor     = models.ForeignKey('vendors.VendorProfile', on_delete=models.PROTECT)
    quantity   = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal   = models.DecimalField(max_digits=12, decimal_places=2)
    status     = models.CharField(choices=ORDER_ITEM_STATUS, default='pending', max_length=20)

    class Meta:
        indexes = [
            models.Index(fields=['vendor', 'status']),
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"OrderItem({self.product}, qty={self.quantity}, {self.status})"


class Invoice(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    order_item      = models.OneToOneField(OrderItem, on_delete=models.CASCADE, related_name='invoice')
    invoice_number  = models.CharField(max_length=50, unique=True)
    vendor          = models.ForeignKey('vendors.VendorProfile', on_delete=models.PROTECT)
    customer        = models.ForeignKey('users.User', on_delete=models.PROTECT)
    product         = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    quantity        = models.PositiveIntegerField()
    unit_price      = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal        = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount    = models.DecimalField(max_digits=12, decimal_places=2)
    status          = models.CharField(max_length=20, default='generated', choices=[
        ('generated', 'Generated'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ])
    generated_at    = models.DateTimeField(auto_now_add=True)
    due_date        = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['vendor', 'status']),
            models.Index(fields=['customer']),
            models.Index(fields=['invoice_number']),
        ]

    def __str__(self):
        return f"Invoice({self.invoice_number}, {self.vendor}, {self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number: INV + timestamp + order_item_id suffix
            import time
            timestamp = str(int(time.time()))
            suffix = str(self.order_item.id)[:8]
            self.invoice_number = f"INV{timestamp}{suffix}"
        super().save(*args, **kwargs)
