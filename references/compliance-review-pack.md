# Vortextrade Compliance Review Pack

**Prepared:** 12 August 2026  
**Purpose:** provide a qualified financial-services compliance lawyer with an accurate record of the product, public claims, and decisions requiring external sign-off before paid launch or paid acquisition.

> This is a working product-compliance brief, not legal advice. It does not conclude whether Vortextrade is regulated, exempt, or authorised. A qualified adviser must assess the service, the operator, the target market, the distribution model, and the final wording.

## 1. Current Product Description

Vortextrade is a web application for retail investors interested in Trading 212-listed stocks. It currently provides watchlists, technical-indicator signal ranking, a signal dashboard, user alerts, a validation/backtesting area, and a timed **Signal Engine** that automatically selects and paper-trades a basket for one, three, or seven days. The Signal Engine does **not** connect to a broker or execute live trades. It opens and closes virtual positions in the simulator.

The current public product position is deliberately limited to the following statements:

| Topic | Current public position |
| --- | --- |
| Trading execution | No live broker execution. Signal Engine activity is simulated paper trading. |
| Data cadence | Daily end-of-day signal review is the stated public cadence until provider, quota, entitlement, and freshness controls are independently verified. |
| Advice | The product describes itself as decision-support software and includes risk language. |
| Paid subscriptions | Not available. The pricing page is an access-model preview; checkout is explicitly disabled. |
| Testimonials / guarantees | Unverified testimonials, refund promises, placeholder contact details, and static performance proof have been removed. |

## 2. Pages and Claims Requiring Review

The reviewer should assess the complete live site, plus at least the following paths and claim classes.

| Page or workflow | Review focus |
| --- | --- |
| `/` | “AI signals”, “auto trade”, signal descriptions, risk notice, product principles, any indication of performance or convenience. |
| `/pricing` | Planned-access language, future paid tiers, entitlement descriptions, transition from preview to a live commercial offer. |
| `/signals/today`, `/stocks/:ticker`, `/tools/signal-calculator` | Signal labelling, data freshness, buy/sell/hold language, consumer understanding, and risk disclosure placement. |
| `/simulator` and Signal Engine | Whether the presentation clearly distinguishes simulated positions from live trading; action labels; results and performance claims. |
| Emails, embedded widget, referral copy, blog, social posts and adverts | Whether short-form content preserves the necessary limitations and warnings. |
| Future Stripe checkout, terms, refunds, cancellation and support flows | Customer journey, operator identity, pricing, entitlement, records, complaints, and consumer terms. |

## 3. Decisions Required from the Operator

The following are business facts that cannot be inferred safely from the source code and must be supplied to the reviewer.

1. **Legal operator identity:** company or sole-trader name, registered address, jurisdiction, company number (if any), tax/VAT status, and customer-support contact channel.
2. **Target market:** countries served, investor category, minimum age, language, whether retail users are targeted, and any geographic exclusions.
3. **Service boundary:** whether any human produces or curates signals; whether alerts or auto-trading could be perceived as a recommendation; and whether broker/API connectivity is planned.
4. **Data rights:** named market-data providers, permitted display/use rights, delay status, exchange coverage, quota limitations, and calculation methodology.
5. **Commercial terms:** final prices, trial, refunds, cancellation mechanics, billing descriptor, support SLA, chargeback policy, and customer complaint process.
6. **Performance evidence:** methodology, lookback periods, assumptions, survivorship handling, transaction-cost assumptions, data source, and approval process for every published result.
7. **Privacy and security:** personal-data inventory, processors, email provider, analytics provider, retention/deletion policy, legal basis, privacy notice, cookie approach, and security incident process.

## 4. Questions for Qualified Review

The reviewer should give a written answer to the following questions before launch.

1. Does the product’s current or planned combination of technical signals, confidence ranking, alerts, simulator, and user-facing “buy/sell” language fall within a regulated or financial-promotion regime in each intended market?
2. Is the description “decision support, not personal investment advice” adequate for the actual functionality and acquisition channels?
3. Are “AI signals”, “auto trade”, “buy/sell”, “confidence”, and any performance display permissible terms, and what qualifications must accompany them?
4. What risk warning, prominence, record-keeping, approval, targeting, and promotion-sign-off process is required for the site, emails, embeds, blog, social media, affiliates, and paid adverts?
5. What consumer, subscription, refund, cancellation, complaint, privacy, cookie, and data-licensing terms are required before billing is activated?
6. What disclosures are required to ensure a simulated paper-trading outcome cannot reasonably be mistaken for live execution, live performance, or a future return?

## 5. Internal Release Gate

No paid acquisition, paid subscription, live checkout, affiliate campaign, quoted testimonial, performance marketing, or claim of real-time service should go live until the following are complete:

- Written external review of the final product and promotional language.
- Verified operator/support identity and published terms, privacy, cookies, and customer-support process.
- Data-source, freshness, methodology, and entitlement disclosures have been technically verified.
- Billing, refund/cancellation, customer entitlements, webhooks, and support are live-tested.
- Approval and version records exist for every public claim and performance figure.

## 6. Reference Material

The FCA Handbook provisions below are included as official background for the reviewer. They do not substitute for legal analysis of Vortextrade’s status.

- [COBS 4.2 — Fair, clear and not misleading communications](https://www.handbook.fca.org.uk/handbook/COBS/4/2.html)
- [CONC 3.3 — Clear, fair and not misleading rule and general requirements](https://www.handbook.fca.org.uk/handbook/CONC/3/3.html)
