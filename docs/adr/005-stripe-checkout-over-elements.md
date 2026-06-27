# ADR-005: Stripe Checkout (Hosted) over Stripe Elements

**Date:** 2026-04-22  
**Status:** Accepted

## Context

The project needs to accept credit card payments. Stripe provides two integration approaches:
1. **Stripe Checkout** — Stripe-hosted payment page; redirect the user to `stripe.com`
2. **Stripe Elements** — embeddable UI components rendered inside the app's own pages

## Decision

Use **Stripe Checkout** (hosted redirect page).

## Consequences

**Positive:**
- PCI DSS compliance is handled entirely by Stripe — card data never touches our servers
- No custom payment form UI to build, test, or maintain
- Stripe handles internationalization, mobile optimization, and accessibility
- Checkout Sessions support multiple payment methods (Apple Pay, Google Pay, SEPA, etc.) automatically
- Webhook-driven state: order status is driven by `checkout.session.completed` event, not a client redirect — reliable even if the browser is closed mid-payment

**Negative / Trade-offs:**
- User leaves our domain during payment (branding interruption)
- No control over the checkout form layout or custom fields beyond `custom_text`
- Requires a working internet connection to Stripe's servers during checkout (not relevant for this project)

## Alternatives Considered

- **Stripe Elements**: Full control over payment form UI. Rejected because it requires handling raw card data in the browser (even via tokenization, the PCI scope increases), building and testing the payment form, and handling 3D Secure redirects manually. For an MVP ecommerce project, the complexity is not justified.
- **PayPal / Braintree**: Alternative payment processor. Rejected — Stripe's developer experience and test mode are superior for this educational project.
