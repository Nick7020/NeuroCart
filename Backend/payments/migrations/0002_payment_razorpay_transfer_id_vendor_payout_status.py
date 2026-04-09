# Generated migration for razorpay_transfer_id and vendor_payout_status fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="razorpay_transfer_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="payment",
            name="vendor_payout_status",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
