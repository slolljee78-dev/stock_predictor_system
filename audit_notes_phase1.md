# UX Audit Notes – Phase 1

## Pages reviewed
- Homepage: https://vortextrade.manus.space/
- Pricing: https://vortextrade.manus.space/pricing

## Key observations

### Homepage
The visual design is strong and premium, with a coherent dark palette, blue accent color, and a high-end SaaS feel. The hero communicates value quickly, and the simulated product tiles support the message well.

The main UX weaknesses are conversion clarity and information hierarchy. The primary call to action changes depending on authentication state, which can make the top-right action feel less stable. There is also no immediately visible trust layer near the top beyond numeric claims; visitors may want proof points such as how signals are generated, sample outputs, or credibility indicators.

The navigation reads clearly, but the site may be slightly over-reliant on one long landing page. Several sections feel polished visually yet still a bit abstract. In particular, the product tour section reserves space for a walkthrough video, but the page text suggests placeholder framing rather than a fully persuasive demonstration section.

### Pricing page
The pricing page is readable and compact, but its top navigation style is inconsistent with the public homepage. Instead of feeling like a continuation of the marketing site, it feels closer to an internal tool page. That weakens visual continuity in the purchase flow.

The plans are understandable, but comparison depth is limited. Users can see tier names and some features, yet the absence of a clearer comparison structure may make upgrade decisions slower. The FAQ helps, but the page would benefit from stronger reassurance around cancellation, billing mechanics, and what happens during the trial.

## Priority concerns emerging so far
1. Inconsistent design language between homepage and pricing flow.
2. Limited trust-building and proof content near key conversion areas.
3. Product tour area appears underdeveloped relative to the rest of the landing page.
4. Pricing comparison could make plan differences more scannable.

## Additional observations

### FAQ page
The FAQ page is useful, searchable, and broad enough to answer many adoption questions. However, its page chrome again feels closer to an internal product screen than to the public marketing site. The two-button header treatment is functional but visually disconnected from the polished homepage header.

The content is comprehensive, yet the page is very dense. On first view, the number of accordion items creates a heavy cognitive load. The category filters help, but there is little editorial prioritization for new visitors who likely only care about a few key questions first: trial, accuracy, risk, mobile support, and cancellation.

### Dashboard route
Opening `/dashboard` as a public visitor appears to return the landing page instead of surfacing a clearer product-entry state. This creates an ambiguity problem. A user expecting a dashboard may feel disoriented because there is no explicit explanation that sign-in is required or that the route is redirecting intentionally.

## Additional priority concerns
5. The FAQ page is useful but visually inconsistent with the public marketing system.
6. Direct entry to the dashboard route lacks a clear authenticated-state explanation.
7. Public pages beyond the homepage are less polished in narrative structure and conversion framing than the hero section.
