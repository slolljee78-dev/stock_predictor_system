# Vortextrade Measurement Setup

## Implemented product-funnel events

The public application emits the following optional GA4 events when `gtag` is available. Events do not block navigation or product use.

| Event | Trigger | Key parameters |
|---|---|---|
| `login_cta_clicked` | Visitor selects a public sign-in action | `placement`, optional `tier` |
| `dashboard_cta_clicked` | Signed-in visitor opens the workspace | `placement` |
| `product_tour_opened` | Visitor opens the homepage product tour | `placement` |
| `signal_engine_cta_clicked` | Visitor selects the Signal Engine from the homepage | `placement` |
| `plan_preview_selected` | Visitor selects a planned access tier | `tier`, `authenticated` |

## Google Search Console hand-off

The site already includes the Google verification meta tag. A property owner should confirm the following in Google Search Console:

1. Open the URL-prefix property for `https://vortextrade.manus.space/`.
2. Confirm the existing HTML-tag verification remains valid.
3. Submit `https://vortextrade.manus.space/sitemap.xml`.
4. Review the Pages report after the next crawl and ensure protected workspace routes are not indexed.
5. Review the Performance report monthly alongside the GA4 funnel events above.

This hand-off is intentionally separate from product code because Search Console ownership and verification occur in the property owner’s Google account.
