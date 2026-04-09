export const QUICK_OPTIONS = [
  { id: 'order',    label: 'Order Issues' },
  { id: 'payment',  label: 'Payment / Payout' },
  { id: 'return',   label: 'Return / Refund' },
  { id: 'cancel',   label: 'Cancel Order' },
  { id: 'track',    label: 'Track Order' },
  { id: 'login',    label: 'Login Issues' },
  { id: 'cod',      label: 'COD Issue' },
  { id: 'support',  label: 'Talk to Support' },
  { id: 'ticket',   label: 'Raise a Ticket' },
]

export const ORDER_ACTIONS = [
  { id: 'track',  label: 'Track Order' },
  { id: 'cancel', label: 'Cancel Order' },
  { id: 'return', label: 'Return Order' },
]

export function getBotReply(input) {
  const msg = input.toLowerCase()

  if (msg.includes('cancel'))
    return { text: "To cancel your order, please note:\n• Orders can only be cancelled before they are shipped.\n• Refund will be processed within 5-7 business days.\n\nWould you like to cancel a specific order?", options: ORDER_ACTIONS }

  if (msg.includes('return') || msg.includes('refund'))
    return { text: "Our Return Policy:\n• Items can be returned within 7 days of delivery.\n• Product must be unused and in original packaging.\n• Refund processed in 5-7 business days.\n\nWould you like to initiate a return?", options: ORDER_ACTIONS }

  if (msg.includes('payment') || msg.includes('payout') || msg.includes('cod'))
    return { text: "For payment issues:\n• COD orders: Payment collected at delivery.\n• Online payments: Refund in 5-7 business days.\n• Failed payment: Amount auto-reversed in 3-5 days.\n\nStill facing issues? Raise a ticket below.", options: null }

  if (msg.includes('track') || msg.includes('status'))
    return { text: "You can track your order from the Orders section in your profile.\n\nOrder stages:\nPending → Confirmed → Processing → Shipped → Delivered", options: ORDER_ACTIONS }

  if (msg.includes('login') || msg.includes('password') || msg.includes('account'))
    return { text: "For login issues:\n• Try resetting your password via Forgot Password.\n• Clear browser cache and try again.\n• Make sure you're using the registered email.\n\nStill stuck? Our support team can help!", options: null }

  if (msg.includes('order'))
    return { text: "I can help you with your order! What would you like to do?", options: ORDER_ACTIONS }

  if (msg.includes('support') || msg.includes('human') || msg.includes('agent'))
    return { text: "Connecting you to our support team...\n\nPhone: +91 98765 43210\nEmail: support@neurocart.com\nAvailable: Mon-Sat, 9AM - 6PM", options: null }

  if (msg.includes('ticket'))
    return { text: "Please fill the form below to raise a support ticket. Our team will respond within 24 hours.", options: null, action: 'ticket' }

  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey'))
    return { text: "Hello! Welcome to NeuroCart Support. How can I help you today? Please select an option below.", options: QUICK_OPTIONS }

  return { text: "I'm not sure I understood that. Please select one of the options below or describe your issue.", options: QUICK_OPTIONS }
}

export function getTimestamp() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
