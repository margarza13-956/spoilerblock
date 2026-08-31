# 💰 SpoilerBlock Monetization Setup Guide

This guide walks you through setting up your live payment links so money from **SpoilerBlock Pro** goes directly to your bank account.

---

## ⚡ Option 1: Stripe (Recommended — Lowest Fees)

1. Open **[dashboard.stripe.com/register](https://dashboard.stripe.com/register)** and create your free Stripe account.
2. Go to **[dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)** and click **"+ New"**.
3. Set the product details:
   * **Title:** `SpoilerBlock Pro`
   * **Price:** `$2.99 / month` (Recurring) or `$19.99 / year`
4. Under **"After Payment"** $\rightarrow$ select **"Don't show confirmation page"** or **"Show custom message"**:
   * Custom message:
     ```
     Thank you for subscribing! Your Pro License Key is: PRO-VIP-ACCESS
     Enter this key in the SpoilerBlock extension popup to unlock Pro features instantly.
     ```
5. Click **"Create Link"** $\rightarrow$ Copy the link (e.g. `https://buy.stripe.com/test_123456`).

---

## ⚡ Option 2: Gumroad (Instant Setup — No Merchant Approval)

If you don't want to set up Stripe billing yourself, **Gumroad** generates license keys automatically for every buyer:

1. Sign up at **[gumroad.com](https://gumroad.com)**.
2. Click **Products** $\rightarrow$ **New Product**.
3. Set Name: `SpoilerBlock Pro`, Price: `$2.99/month` or `$19.99 Lifetime`.
4. Turn on the **"Generate a unique license key for each sale"** toggle.
5. Copy your Gumroad link (`https://gumroad.com/l/spoilerblock`).

---

## ⚡ Option 3: Buy Me a Coffee / One-Time Support

1. Sign up at **[buymeacoffee.com](https://buymeacoffee.com)** (username: `margarza13956`).
2. Add your link (`https://buymeacoffee.com/margarza13956`) to accept direct support tips and donations.

---

## 🔧 Where to Put Your Link:

Once you have your link, replace `https://buy.stripe.com/test_spoilerblock_pro` in:
* **`popup.html`** (Line 377)
* **`index.html`** (Hero CTA & Pricing buttons)
