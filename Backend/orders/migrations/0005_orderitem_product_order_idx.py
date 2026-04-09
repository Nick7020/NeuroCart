from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0004_add_invoice_model"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="orderitem",
            index=models.Index(
                fields=["product", "order"],
                name="orderitem_product_order_idx",
            ),
        ),
    ]
