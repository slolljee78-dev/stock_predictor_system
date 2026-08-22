# Ashenwick Rebrand Readiness Plan

> **Status:** Internal preparation only. The public-facing name remains **Vortextrade** until a qualified trademark and legal review is complete.

## Purpose

Ashenwick is the selected **working name** following an initial public-web conflict screen. This plan makes the project ready for an orderly rename without publishing the new identity, changing the current domain, or implying that legal clearance has been obtained.

## Current Brand Inventory

The inventory identified **44 tracked project files** containing Vortextrade references. They are grouped below so the eventual migration can be executed deliberately rather than by global search-and-replace.

| Touchpoint group | Examples | Migration risk | Planned treatment |
|---|---|---:|---|
| Public identity and navigation | `PublicSiteHeader`, `DashboardLayout`, `MobileAppShell`, onboarding, install prompt | High | Change together at launch so users see one identity. |
| Marketing and educational pages | Homepage, How It Works, FAQ, methodology, blog, community, stock pages | High | Replace brand copy and re-check claims, links, and structured data. |
| SEO, PWA, and sharing | `index.html`, manifest, service workers, embeds, social cards | High | Update title, descriptions, Open Graph copy, manifest labels, canonical links, and share text in one release. |
| Product, emails, and notifications | Product catalogue, newsletters, onboarding, weekly digest, email notifications | High | Update sender display names, templates, unsubscribe labels, and support wording. |
| Server and public API | Public API, server entry, embed output | Medium | Preserve endpoints and add a compatibility notice only if a public API name changes. |
| Tests and project records | Header, homepage, FAQ, system tests, README, metadata | Medium | Update expected copy and retain a transition record for traceability. |

The full file-level inventory is retained in `references/ashenwick-brand-touchpoint-files.txt`.

## Clearance Gate

> **Working analysis only, not legal advice.** A qualified UK trademark professional should confirm clearance before relying on Ashenwick as a public brand or purchasing/filing under it.

Before public launch, obtain written clearance that covers the exact word mark **Ashenwick** and relevant related activities, including software, SaaS, market-analysis tools, marketing, and any planned financial-services positioning. The review should cover UK and any priority international markets, confusingly similar marks, relevant company names, domains, social handles, and the final product description. No public rename should occur unless that review is affirmative.

## Controlled Migration Sequence

| Gate | Owner | Required outcome | Public change? |
|---|---|---|---|
| 1. Trademark and legal review | User and qualified adviser | Written go/no-go decision for Ashenwick | No |
| 2. Domain and social-handle decision | User | Primary domain and essential handles secured or alternative selected | No |
| 3. Brand approval | User | Final logo, public descriptor, and transition date approved | No |
| 4. Technical migration | Project | All touchpoints updated, redirects and metadata prepared, tests passing | Not yet |
| 5. Launch checkpoint | User | Explicit approval of public rename and domain change | Yes |
| 6. Post-launch monitoring | Project and user | Search Console, analytics, PWA, OAuth return paths, links, and email sender reviewed | Yes |

## Proposed Brand Architecture

| Layer | Working wording |
|---|---|
| Parent brand | **Ashenwick** |
| Public descriptor | **AI stock signals and paper-trading tools** |
| Flagship product | **Ashenwick Signal Engine** |
| Product explanation | **Signals, paper trades, and disciplined market research.** |
| Regulatory framing | Decision-support software; no personalised financial advice or performance guarantees. |

## Internal Safeguard

The application will contain an internal, non-rendered transition record that records Vortextrade as the active brand, Ashenwick as pending clearance, and blocks any automatic public rename. It will not be imported by public pages or used to alter customer-facing copy until the user approves launch after formal clearance.

## User Decision Required Before Public Rename

The next public branding change requires an explicit confirmation after clearance, stating that the project should replace Vortextrade with Ashenwick. Until then, the site, emails, metadata, PWA label, and live domains remain Vortextrade.
