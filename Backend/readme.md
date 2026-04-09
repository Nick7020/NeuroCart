```
python -m venv venv
```

```
venv\Scripts\activate
```
mustafa@gmail.com
200418

## Razorpay Setup

### 1. Obtain Test API Keys

1. Sign up or log in at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Switch to **Test Mode** using the toggle in the top-right corner.
3. Go to **Settings → API Keys → Generate Key**.
4. Copy the **Key ID** (starts with `rzp_test_`) and **Key Secret** — the secret is shown only once.

---

### 2. Environment Variables

Add the following to your `.env` file (see `.env.example` for reference):

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
RAZORPAY_MODE=test
```

| Variable                  | Description                                                  |
|---------------------------|--------------------------------------------------------------|
| `RAZORPAY_KEY_ID`         | Public key ID from the Razorpay dashboard (test or live).    |
| `RAZORPAY_KEY_SECRET`     | Secret key — never commit this to version control.           |
| `RAZORPAY_WEBHOOK_SECRET` | Secret set when configuring the webhook in the dashboard.    |
| `RAZORPAY_MODE`           | `test` for sandbox, `live` for production. Defaults to `test`. |

> The app will raise `ImproperlyConfigured` at startup if `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` are missing.

---

### 3. Configure Webhooks in the Razorpay Dashboard

1. In the Razorpay dashboard, go to **Settings → Webhooks → Add New Webhook**.
2. Set the **Webhook URL** to:
   ```
   https://<your-domain>/api/payments/razorpay/webhook/
   ```
   For local development, use a tunnelling tool like [ngrok](https://ngrok.com) to expose your local server.
3. Set a **Secret** — copy this value into `RAZORPAY_WEBHOOK_SECRET` in your `.env`.
4. Under **Active Events**, subscribe to:
   - `payment.captured`
   - `payment.failed`
5. Save the webhook. Razorpay will send a test ping to verify the URL is reachable.

---

### 4. Test Credentials

Use these in **Test Mode** to simulate payment flows without real transactions.

**Card payment (successful)**

| Field      | Value                  |
|------------|------------------------|
| Card number | `4111 1111 1111 1111` |
| Expiry     | Any future date        |
| CVV        | Any 3 digits           |

**UPI payment**

| Scenario | UPI ID               |
|----------|----------------------|
| Success  | `success@razorpay`   |
| Failure  | `failure@razorpay`   |
