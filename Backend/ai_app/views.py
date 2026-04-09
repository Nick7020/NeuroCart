from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from products.serializers import ProductListSerializer
from services import recommendation_service, analytics_service


def _get_bot_reply(message: str) -> str:
    """Rule-based intent matching mirroring frontend chatbot.js logic."""
    msg = message.lower()

    if 'cancel' in msg:
        return (
            "To cancel your order, please note:\n"
            "• Orders can only be cancelled before they are shipped.\n"
            "• Refund will be processed within 5-7 business days.\n\n"
            "Would you like to cancel a specific order?"
        )

    if 'return' in msg or 'refund' in msg:
        return (
            "Our Return Policy:\n"
            "• Items can be returned within 7 days of delivery.\n"
            "• Product must be unused and in original packaging.\n"
            "• Refund processed in 5-7 business days.\n\n"
            "Would you like to initiate a return?"
        )

    if 'payment' in msg or 'payout' in msg or 'cod' in msg:
        return (
            "For payment issues:\n"
            "• COD orders: Payment collected at delivery.\n"
            "• Online payments: Refund in 5-7 business days.\n"
            "• Failed payment: Amount auto-reversed in 3-5 days.\n\n"
            "Still facing issues? Raise a ticket below."
        )

    if 'track' in msg or 'status' in msg:
        return (
            "You can track your order from the Orders section in your profile.\n\n"
            "Order stages:\nPending → Confirmed → Processing → Shipped → Delivered"
        )

    if 'login' in msg or 'password' in msg or 'account' in msg:
        return (
            "For login issues:\n"
            "• Try resetting your password via Forgot Password.\n"
            "• Clear browser cache and try again.\n"
            "• Make sure you're using the registered email.\n\n"
            "Still stuck? Our support team can help!"
        )

    if 'order' in msg:
        return "I can help you with your order! What would you like to do?"

    if 'support' in msg or 'human' in msg or 'agent' in msg:
        return (
            "Connecting you to our support team...\n\n"
            "Phone: +91 98765 43210\n"
            "Email: support@neurocart.com\n"
            "Available: Mon-Sat, 9AM - 6PM"
        )

    if 'ticket' in msg:
        return (
            "Please raise a support ticket via our support page. "
            "Our team will respond within 24 hours."
        )

    if 'hi' in msg or 'hello' in msg or 'hey' in msg:
        return "Hello! Welcome to NeuroCart Support. How can I help you today?"

    return "I'm not sure I understood that. Could you please describe your issue in more detail?"


class ChatView(APIView):
    """POST /api/ai/chat — rule-based chatbot, authenticated users only."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'message': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        reply = _get_bot_reply(message)
        return Response({'reply': reply})


class RecommendationsView(APIView):
    """GET /api/ai/recommendations — product recommendations, authenticated users only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        product_id = request.query_params.get('product_id')

        if product_id:
            products = recommendation_service.get_also_bought(product_id, limit=5)
        else:
            raw = analytics_service.get_trending_products(limit=10)
            from products.models import Product
            ids = [entry['product_id'] for entry in raw]
            products = list(Product.objects.filter(id__in=ids, is_active=True))

        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
