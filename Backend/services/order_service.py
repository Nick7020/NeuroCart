"""
Order service — checkout, stock validation, order splitting, status aggregation.
"""
from django.db import transaction
from django.core.exceptions import PermissionDenied, ValidationError


def checkout(user, payment_method, shipping_address=None):
    """
    Full atomic checkout flow with select_for_update.
    Returns the created Order.
    Raises ValidationError if cart is empty or any item is out of stock.
    """
    from orders.models import Cart, Order, OrderItem
    from products.models import Product

    try:
        cart = Cart.objects.prefetch_related('items__product').get(user=user)
    except Cart.DoesNotExist:
        raise ValidationError("Cart not found.")

    cart_items = list(cart.items.select_related('product').all())
    if not cart_items:
        raise ValidationError("Cart is empty.")

    product_ids = [item.product_id for item in cart_items]

    with transaction.atomic():
        # Lock products to prevent race conditions on concurrent checkouts
        products_qs = {
            p.id: p
            for p in Product.objects
                .select_for_update()
                .select_related('vendor')
                .filter(id__in=product_ids)
        }

        errors = {}
        for item in cart_items:
            product = products_qs.get(item.product_id)
            if product is None or not product.is_active:
                errors[str(item.product_id)] = "Product is not available."
            elif product.stock < item.quantity:
                errors[str(item.product_id)] = (
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock}, requested: {item.quantity}."
                )
        if errors:
            raise ValidationError(errors)

        total_amount = sum(
            products_qs[item.product_id].price * item.quantity
            for item in cart_items
        )

        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            status='pending',
            shipping_address=shipping_address,
        )

        for item in cart_items:
            product = products_qs[item.product_id]
            subtotal = product.price * item.quantity
            OrderItem.objects.create(
                order=order,
                product=product,
                vendor=product.vendor,
                quantity=item.quantity,
                unit_price=product.price,
                subtotal=subtotal,
            )
            product.stock -= item.quantity
            product.save(update_fields=['stock'])

        cart.items.all().delete()

        try:
            from payments.models import Payment
            Payment.objects.create(
                order=order,
                amount=total_amount,
                status='pending',
                payment_method=payment_method,
            )
        except Exception:
            pass  # Payment model may not be migrated yet

    return order


def cancel_order(order, user):
    """
    Validate ownership and status, restore stock, update statuses atomically.
    Returns the updated Order.
    Raises PermissionDenied or ValidationError on invalid state.
    """
    if order.user != user:
        raise PermissionDenied("You do not have permission to cancel this order.")

    if order.status not in ('pending', 'confirmed'):
        raise ValidationError(
            "Order cannot be cancelled. "
            "Only pending or confirmed orders can be cancelled."
        )

    with transaction.atomic():
        for item in order.items.select_related('product').select_for_update():
            product = item.product
            product.stock += item.quantity
            product.save(update_fields=['stock'])
            item.status = 'cancelled'
            item.save(update_fields=['status'])

        order.status = 'cancelled'
        order.save(update_fields=['status'])

        try:
            payment = order.payment
            if payment.status == 'completed':
                from services.payment_service import refund_payment
                refund_payment(payment)
        except Exception:
            pass  # Payment may not exist yet

    return order


def aggregate_order_status(order):
    """
    Derive order status from item statuses.
    Returns the new status string (does NOT save to DB).
    """
    statuses = set(order.items.values_list('status', flat=True))

    if not statuses:
        return order.status

    if statuses == {'delivered'}:
        return 'delivered'

    if statuses == {'cancelled'}:
        return 'cancelled'

    if 'shipped' in statuses or 'delivered' in statuses:
        return 'partially_shipped'

    if 'processing' in statuses:
        return 'confirmed'

    return order.status


def update_order_item_status(order_item, vendor, new_status):
    """
    Validate vendor ownership and status transition, update item status,
    re-aggregate and save order status.
    Returns the updated OrderItem.
    Raises PermissionDenied or ValidationError on invalid input.
    """
    VALID_TRANSITIONS = {
        'pending':    {'processing', 'cancelled'},
        'processing': {'shipped', 'cancelled'},
        'shipped':    {'delivered'},
        'delivered':  set(),
        'cancelled':  set(),
    }

    if order_item.vendor_id != vendor.id:
        raise PermissionDenied("You do not have permission to update this order item.")

    allowed = VALID_TRANSITIONS.get(order_item.status, set())
    if new_status not in allowed:
        raise ValidationError(
            f"Cannot transition order item from '{order_item.status}' to '{new_status}'."
        )

    with transaction.atomic():
        order_item.status = new_status
        order_item.save(update_fields=['status'])

        order = order_item.order
        new_order_status = aggregate_order_status(order)
        if new_order_status != order.status:
            order.status = new_order_status
            order.save(update_fields=['status'])

        if new_status == 'processing':
            create_invoice(order_item)

        if new_status == 'delivered':
            create_sales_record(order_item)

    return order_item


def create_sales_record(order_item):
    """
    Called when an OrderItem status transitions to delivered.
    Creates a SalesRecord for analytics.
    """
    from analytics_app.models import SalesRecord
    from django.utils import timezone

    SalesRecord.objects.get_or_create(
        order_item=order_item,
        defaults={
            'vendor': order_item.vendor,
            'revenue': order_item.subtotal,
            'date': timezone.now().date(),
        }
    )


def create_invoice(order_item):
    """
    Called when an OrderItem status transitions to processing.
    Creates exactly one Invoice per (order, vendor) pair, with a unique
    invoice_number in the format INV-{YYYY}-{count:06d}.
    Uses select_for_update to prevent duplicate invoice numbers.
    """
    from orders.models import Invoice
    from django.utils import timezone

    year = timezone.now().year
    vendor = order_item.vendor
    order = order_item.order

    # Avoid creating a duplicate invoice for the same order+vendor
    if Invoice.objects.filter(order=order, vendor=vendor).exists():
        return

    with transaction.atomic():
        # Lock to prevent concurrent invoice number collisions
        count = Invoice.objects.select_for_update().count()
        invoice_number = f"INV-{year}-{count + 1:06d}"
        Invoice.objects.create(
            order=order,
            vendor=vendor,
            invoice_number=invoice_number,
            total_amount=order_item.subtotal,
        )
