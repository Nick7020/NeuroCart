from django.db.models.signals import post_save, post_delete
from django.db.models import Avg
from django.dispatch import receiver

from .models import Review


def recalculate_vendor_rating(vendor):
    avg = Review.objects.filter(
        product__vendor=vendor
    ).aggregate(avg_rating=Avg('rating'))['avg_rating']

    vendor.rating = avg if avg is not None else 0.00
    vendor.save(update_fields=['rating'])


@receiver(post_save, sender=Review)
def update_vendor_rating_on_save(sender, instance, **kwargs):
    recalculate_vendor_rating(instance.product.vendor)


@receiver(post_delete, sender=Review)
def update_vendor_rating_on_delete(sender, instance, **kwargs):
    recalculate_vendor_rating(instance.product.vendor)
