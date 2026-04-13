# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payments for Vortex Trade. Follow each step carefully to ensure proper integration.

---

## Step 1: Claim Your Stripe Test Sandbox

**Deadline:** June 11, 2026 (expires 90 days after creation)

### Instructions:

1. Click this link to claim your sandbox:
   ```
   https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVExBSDVFUWdVdE5mdlBjLDE3NzY1OTQwODgv100ihwvRDEt
   ```

2. You'll be redirected to Stripe's website. If you don't have a Stripe account, create one:
   - Go to https://dashboard.stripe.com
   - Click "Sign up"
   - Enter your email and create a password
   - Complete the account setup

3. Once logged in, you'll see a notification about claiming your test sandbox. Click "Claim" or follow the prompt.

4. After claiming, you'll have access to:
   - **Test API Keys** (for development)
   - **Test Mode** (indicated by a toggle in the top right)
   - **Test data** (test cards, test customers, etc.)

### Verification:
- You should see "Test mode" indicator in the top right of Stripe Dashboard
- Your account is ready for creating products and prices

---

## Step 2: Create Product and Price Objects

### 2.1 Create the Product

1. In Stripe Dashboard, go to **Products** (left sidebar → Catalog → Products)

2. Click **+ Add product**

3. Fill in the product details:
   - **Name:** `Vortex Trade Premium`
   - **Description:** `AI-powered trading signals and analytics platform`
   - **Image:** (optional - upload Vortex Trade logo if available)
   - **Type:** `Service`
   - **Tax code:** `txcd_10000000` (Software as a service)

4. Click **Save product**

### 2.2 Create Three Price Objects

For each price, follow these steps:

#### Price 1: Starter (£9.99/month)

1. In the product page, scroll to **Pricing** section
2. Click **+ Add price**
3. Fill in:
   - **Billing period:** `Monthly`
   - **Price:** `9.99` (Stripe will show it as £9.99)
   - **Currency:** `GBP` (British Pounds)
   - **Recurring:** Toggle ON
   - **Billing cycle:** `Monthly`
   - **Nickname:** `Starter Monthly` (optional but helpful)

4. Click **Save price**

5. **Copy the Price ID** (looks like `price_1234567890abcdef`)
   - You'll need this for configuration

#### Price 2: Professional (£29.99/month) - POPULAR

1. Click **+ Add price** again
2. Fill in:
   - **Billing period:** `Monthly`
   - **Price:** `29.99`
   - **Currency:** `GBP`
   - **Recurring:** Toggle ON
   - **Billing cycle:** `Monthly`
   - **Nickname:** `Professional Monthly`

3. Click **Save price**

4. **Copy the Price ID** and mark this as the POPULAR tier

#### Price 3: Elite (£99.99/month)

1. Click **+ Add price** again
2. Fill in:
   - **Billing period:** `Monthly`
   - **Price:** `99.99`
   - **Currency:** `GBP`
   - **Recurring:** Toggle ON
   - **Billing cycle:** `Monthly`
   - **Nickname:** `Elite Monthly`

3. Click **Save price**

4. **Copy the Price ID**

### Verification:
You should now have three prices with IDs like:
- `price_1234567890abcdef` (Starter)
- `price_1234567890abcde1` (Professional)
- `price_1234567890abcde2` (Elite)

---

## Step 3: Configure Price IDs in Environment Variables

Once you have all three price IDs, provide them to the development team:

```
STRIPE_PRICE_STARTER=price_1234567890abcdef
STRIPE_PRICE_PROFESSIONAL=price_1234567890abcde1
STRIPE_PRICE_ELITE=price_1234567890abcde2
```

These will be configured in the system settings.

---

## Step 4: Test Payment Processing

### 4.1 Get Test Card Numbers

Stripe provides test card numbers for different scenarios:

| Card Number | Expiry | CVC | Use Case |
|------------|--------|-----|----------|
| `4242 4242 4242 4242` | Any future date | Any 3 digits | Successful payment |
| `4000 0000 0000 0002` | Any future date | Any 3 digits | Payment declined |
| `4000 0025 0000 3155` | Any future date | Any 3 digits | Requires authentication |

### 4.2 Test Checkout Flow

1. Go to the Pricing page on Vortex Trade
2. Click "Upgrade" on the Professional tier (£29.99/month)
3. You'll be redirected to Stripe Checkout
4. Enter test card: `4242 4242 4242 4242`
5. Fill in test details:
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **Name:** Test Name
   - **Email:** test@example.com

6. Click **Pay**

### 4.3 Verify in Stripe Dashboard

1. Go to **Payments** in Stripe Dashboard
2. You should see your test payment with status `Succeeded`
3. Click on it to view details:
   - Amount: £29.99
   - Status: Succeeded
   - Customer email: test@example.com

### 4.4 Check Webhook Events

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. You should see webhook events like:
   - `checkout.session.completed`
   - `customer.created`
   - `invoice.created`
   - `invoice.payment_succeeded`

3. Click on each event to verify the payload was processed correctly

---

## Step 5: Verify Subscription in System

After successful payment:

1. Log in to Vortex Trade with the test email (test@example.com)
2. Check your subscription status:
   - Should show "Professional" tier
   - Should show subscription start date
   - Should show next billing date

3. Go to **Payment History** to see:
   - Transaction details
   - Amount: £29.99
   - Status: Succeeded
   - Invoice link

---

## Step 6: Test Trial Expiration Emails (Optional)

To test trial expiration emails:

1. Create a test user account
2. Set their trial expiration to tomorrow (via database or admin panel)
3. Wait for the email service to run (or trigger manually)
4. Check email for trial expiration reminder

---

## Step 7: Go Live (When Ready)

When you're ready to accept real payments:

1. Complete Stripe's KYC (Know Your Customer) verification
2. Upgrade to **Live Mode** in Stripe Dashboard
3. Get your **Live API Keys**
4. Update environment variables with live keys:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

5. Update price IDs with live versions

6. Test with real card (small amount like £0.50)

---

## Troubleshooting

### Issue: Checkout page shows error "Invalid price ID"

**Solution:** 
- Verify price IDs are correct in environment variables
- Make sure price IDs are from the same Stripe account
- Check that prices are in GBP currency

### Issue: Payment succeeded but subscription not created

**Solution:**
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is receiving events
- Check application logs for errors

### Issue: Test card declined

**Solution:**
- Use the correct test card: `4242 4242 4242 4242`
- Ensure expiry date is in the future
- Try a different test card from the table above

### Issue: Can't find Products section in Stripe Dashboard

**Solution:**
- Make sure you're in **Test Mode** (toggle in top right)
- Go to **Catalog** → **Products** in left sidebar
- If you don't see it, refresh the page

---

## Important Notes

- **Test Mode:** All prices and payments are in test mode until you go live
- **Test Data:** Test payments don't charge any real money
- **Sandbox Expiration:** Your sandbox expires 90 days after claiming (June 11, 2026)
- **Live Mode:** Requires Stripe KYC verification before going live
- **Minimum Amount:** Stripe requires minimum £0.50 for test transactions

---

## Next Steps

1. ✅ Claim sandbox
2. ✅ Create product and prices
3. ✅ Share price IDs with development team
4. ✅ Test checkout flow
5. ✅ Verify subscriptions in system
6. ✅ Go live when ready

For questions or issues, contact Stripe support at https://support.stripe.com

---

**Last Updated:** April 13, 2026
**Vortex Trade Version:** 1.0.0
