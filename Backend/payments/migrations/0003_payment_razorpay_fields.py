# Migration to add core Razorpay fields to Payment model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0002_payment_razorpay_transfer_id_vendor_payout_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="razorpay_order_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="payment",
            name="razorpay_payment_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="payment",
            name="razorpay_signature",
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name="payment",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("card", "Card"),
                    ("upi", "UPI"),
                    ("wallet", "Wallet"),
                    ("cod", "Cash on Delivery"),
                    ("razorpay", "Razorpay"),
                ],
                max_length=20,
            ),
        ),
    ]
