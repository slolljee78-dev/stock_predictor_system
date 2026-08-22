# Website UX and Design Audit

**Author:** Manus AI  
**Project:** VortexTrade / Manus Stock Predictor  
**Audit date:** 2026-04-18

## Executive summary

The website already has a strong visual foundation. The homepage establishes a **premium trading-product identity** with a polished dark theme, restrained accent color, and a calm overall tone. The value proposition is also reasonably clear: the platform helps Trading 212 users review signals, manage watchlists, and make decisions faster [1].

That said, the experience becomes less cohesive once a visitor moves beyond the homepage. The strongest design work is concentrated in the hero and early landing-page sections, while secondary public pages such as pricing and FAQ feel more like internal product screens than extensions of the same marketing system [2] [3]. This weakens trust and flow at exactly the point where users need reassurance and consistency.

A second recurring issue is **journey clarity**. Some routes and controls imply a product experience that is not always directly available to a public visitor. For example, opening the dashboard route as a public user returns the landing page rather than a clearly explained sign-in or gated workspace state [4]. That creates avoidable confusion, especially for users who arrive deep-linked from saved links, search, or shared URLs.

Overall, the site is closer to a strong premium concept than to a fully refined conversion experience. The biggest gains will come from improving **cross-page consistency, conversion trust, clearer route behavior, and stronger mobile polishing**.

## What is already working well

Several parts of the experience are already effective and should be preserved.

| Area | What works | Why it matters |
|---|---|---|
| Brand tone | The dark palette, blue accents, and restrained gradients create a premium, modern feel. | This gives the product a distinct identity and fits the finance/trading category well. |
| Homepage hero | The headline, supporting copy, and mock product visuals communicate the core offer quickly. | Users can understand the product category within seconds [1]. |
| Feature framing | The workflow sections explain a sensible path from watchlist to signal review to validation. | This turns the product from a list of features into a usable mental model [1]. |
| Pricing simplicity | The three-tier structure is easy to understand at a glance. | Buyers can quickly identify the likely plan range [2]. |
| FAQ coverage | The FAQ answers many practical pre-purchase questions, including cancellation and trial questions. | This reduces friction for cautious prospects [3]. |

## Priority issues and recommendations

The following table ranks the most important UX and design issues observed during the audit.

| Priority | Issue | Where it appears | Why it matters | Recommendation |
|---|---|---|---|---|
| High | Secondary pages use a different visual language from the homepage | Pricing and FAQ [2] [3] | Users experience a drop in polish during the evaluation journey | Redesign secondary public pages with the same navigation system, spacing rhythm, typography scale, and section framing used on the homepage. |
| High | Dashboard entry behavior is ambiguous for public visitors | `/dashboard` route [4] | Deep links feel broken or misleading when they return to the homepage without explanation | Show a dedicated gated-state screen or clear sign-in message instead of silently returning users to the landing page. |
| High | Trust and proof are lighter than the product promise | Homepage [1] | A premium financial tool needs more credibility support before conversion | Add evidence layers such as sample signal cards, methodology summary, user proof, update cadence, and clearer explanation of confidence scoring. |
| Medium | Pricing comparison is readable but not decision-optimized | Pricing [2] | Users may struggle to understand upgrade differences fast enough | Add a more scannable comparison matrix, stronger plan differentiation, and clearer feature inclusion/exclusion patterns. |
| Medium | Product tour section feels underdeveloped | Homepage [1] | The page promises a walkthrough but currently feels partially placeholder-like | Replace placeholder framing with a real video preview or guided visual story with annotated screenshots. |
| Medium | FAQ is comprehensive but cognitively heavy | FAQ [3] | Users face a large wall of questions without enough prioritization | Start with a short “Top questions before you subscribe” group, then place categories below. |
| Medium | Mobile navigation and header consistency appear fragile | Public mobile experience and recent user feedback | Navigation problems reduce confidence fast on phones | Standardize mobile headers, menu patterns, spacing, and route behavior under one design system rather than per-page variations. |
| Low | CTA system could be more stable across states | Homepage and public flow [1] [2] | Variation between sign-in, dashboard, and plan actions may feel inconsistent | Define a primary CTA model by audience state: visitor, trial user, logged-in free user, subscriber. |

## Detailed findings

## 1. Homepage UX and messaging

The homepage has the most mature design on the site. The hero section is strong because it combines a sharp headline, category-specific language, and a visual product metaphor that feels relevant to Trading 212 users [1]. The supporting sections also reinforce a workflow-oriented product story rather than simply listing features.

However, the page still asks visitors to trust several strong product claims without enough immediate proof. The metrics and supporting numbers create energy, but they are not yet anchored by visible evidence, methodology context, or social reassurance. In a finance-adjacent product, this can limit conversion because users are likely to ask how signals are produced, how recent they are, and how much discretion they should apply.

> “Stock Predictor is an AI-powered trading signal platform designed specifically for Trading 212 investors.” [1]

That promise is strong, but it should be followed more quickly by a short explanation of **how the system works**, what “AI-powered” means in practical terms, and how a user should interpret signals responsibly.

| Strength | Risk | Suggested improvement |
|---|---|---|
| Clear value proposition | Promise may feel too abstract without proof | Add a compact “How signals are generated” explainer directly below the hero stats. |
| Strong visual tone | Tone implies maturity that later pages do not always match | Use the homepage as the design source of truth for all public pages. |
| Good feature framing | Users may still want concrete examples before sign-up | Add one real-looking annotated sample signal card and one stock-detail preview. |

## 2. Pricing and conversion flow

The pricing page is compact and understandable, but it currently feels more like a product subpage than a dedicated conversion page [2]. The top treatment uses “Back to menu” and “Back to dashboard,” which is functionally understandable but visually at odds with the polished public marketing header. That inconsistency makes the purchase moment feel less intentional.

The three plans are easy to parse, yet they are not differentiated strongly enough in terms of buyer psychology. The current content explains plan names and feature lists, but it does not clearly answer the question: **Who should choose which plan, and why now?** The “Most popular” label on Pro helps, but the overall comparison could still do much more work.

| Current condition | UX effect | Suggested improvement |
|---|---|---|
| Simple three-card plan layout | Easy to read, but only moderately persuasive | Add persona-oriented labels such as “Best for first-time signal users,” “Best for active reviewers,” and “Best for power users/API workflows.” |
| Limited comparison depth | Harder to compare the trade-off between Pro and Elite | Add a compact comparison table below the cards. |
| Secondary-page header style | Breaks continuity from homepage to checkout intent | Use the same top navigation shell and CTA logic as the homepage. |
| FAQ embedded below plans | Helpful, but under-leveraged | Expand it with billing examples, trial billing timing, and cancellation reassurance. |

## 3. FAQ usability and information architecture

The FAQ page covers a useful range of topics and includes search and category filters [3]. That is a good functional base. The issue is not lack of content; it is **content prioritization and visual rhythm**. New visitors are likely to care most about only a few questions at first: whether the product is suitable for them, how accurate it is, how risky it is to follow signals, whether it works on mobile, and whether they can cancel easily.

At present, the page exposes a very large number of accordions at once. This can make the screen feel dense and administrative rather than confident and curated.

A better structure would start with a short curated section such as **Top questions before you start**, followed by category filters and the full library. That would improve scanability while preserving depth.

## 4. Navigation and route clarity

The most important structural UX issue is route clarity. During the audit, visiting `/dashboard` as a public visitor did not produce a clearly explained app-entry state; it returned the landing-page experience instead [4]. That may be technically acceptable, but from a UX standpoint it is ambiguous.

Users do not necessarily infer intent from redirects. If someone opens a dashboard route and sees the homepage instead, they may conclude that the route is broken, that their session expired unexpectedly, or that the product is not available.

The fix does not need to be complicated. A dedicated access gate would immediately improve clarity. For example, the route could show a branded message like: **“Your workspace requires sign-in. Continue to your dashboard.”** That preserves security while improving comprehension.

## 5. Mobile experience and design system consistency

Based on the current public implementation patterns and the repeated mobile-specific issues already surfaced during review, the mobile experience needs more centralized design governance. The public site and in-app pages appear to have evolved through several iterations, which has improved individual screens but also created inconsistency in menu treatments, header spacing, and route behavior.

The site would benefit from a stricter mobile component system.

| Component type | Current risk | Improvement direction |
|---|---|---|
| Mobile menu trigger | Can feel visually separate from the brand system | Use a single icon style, surface treatment, and spacing rule across all public mobile headers. |
| Mobile drawers/menus | Risk of feeling generic or inconsistent between contexts | Define one premium sheet pattern with consistent corner radius, depth, typography, and navigation-card treatment. |
| Page headers | Spacing and button logic vary between pages | Create one shared mobile page-header component for all internal screens. |
| Route returns | “Back to menu” behavior has historically varied | Centralize route helpers and avoid page-level custom navigation logic. |

## Suggested roadmap

The fastest path to a more polished site is to treat the work in three waves.

| Wave | Time horizon | Focus | Outcome |
|---|---|---|---|
| Wave 1 | Immediate | Fix cross-page header consistency, dashboard route clarity, and pricing comparison clarity | Removes the most obvious UX friction in the public journey |
| Wave 2 | Short term | Upgrade trust content, product-tour quality, and FAQ prioritization | Improves conversion confidence and perceived maturity |
| Wave 3 | Medium term | Formalize mobile design system and shared in-app navigation components | Reduces regressions and creates stronger phone usability |

## Top 10 specific improvements to implement

| # | Improvement | Expected impact |
|---|---|---|
| 1 | Replace silent dashboard fallback with a clear authenticated access screen | High |
| 2 | Rebuild pricing and FAQ headers to match homepage navigation and visual rhythm | High |
| 3 | Add a feature comparison table under pricing cards | High |
| 4 | Add a concise “How signals work” section near the homepage hero | High |
| 5 | Replace the current product-tour placeholder framing with a real walkthrough asset | High |
| 6 | Add trust markers such as signal methodology, data freshness, and responsible-use language | Medium |
| 7 | Curate the FAQ into “Top questions” plus expandable full library | Medium |
| 8 | Standardize mobile menu, drawer, and internal page-header patterns | Medium |
| 9 | Stabilize CTA logic by audience state across public pages | Medium |
| 10 | Add more concrete in-product preview examples on the homepage | Medium |

## Final assessment

The website is already visually promising and commercially viable, but it is not yet fully unified. The homepage feels like a polished premium product brand, while the pricing, FAQ, and route-entry experiences still need refinement to reach the same level. If you focus first on **consistency, clarity, and proof**, the whole product will feel significantly more trustworthy and more conversion-ready.

## References

[1]: https://vortextrade.manus.space/ "VortexTrade homepage"
[2]: https://vortextrade.manus.space/pricing "VortexTrade pricing"
[3]: https://vortextrade.manus.space/faq "VortexTrade FAQ"
[4]: https://vortextrade.manus.space/dashboard "VortexTrade dashboard route audit"
