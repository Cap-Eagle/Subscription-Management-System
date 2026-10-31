# Billing Engine Specification

Module owner: billing engine (subscriptions, quotation templates, invoices, discounts, billing job).
Source: `source/Subscription_Management_System.pdf` (Brightloop Software). Tech stack: **[TECH_STACK]**.

Status labels used below:
- **SOURCE**: stated in the problem statement.
- **PROPOSED**: a default chosen here because the source is silent. Change it if the team decides otherwise.
- **OPEN**: undecided; ask before relying on it.

## 1. Scope

In scope: quotation templates, subscriptions and their lines, subscription status flow, invoice generation from
subscriptions, invoice lines, taxes applied to invoices, discount application, invoice status flow, the billing job.

Out of scope (owned by teammates): signup/login/roles, product/variant/plan/tax-rule CRUD, payment recording,
finance dashboard, UI, seed data at scale.

SOURCE requirements this module must satisfy:
- Subscription has a unique number, customer, plan, start date, expiry date, payment terms, and lines
  (product, quantity, unit price, taxes, amount).
- Subscription status: Draft -> Quotation -> Confirmed -> Active -> Closed.
- Quotation templates carry plan and product lines and stay valid a set number of days.
- Invoices are created automatically from subscriptions with customer details, lines, taxes and totals filled in.
- Taxes are calculated automatically from admin-defined rules.
- Invoice actions: confirm, cancel, send, print. Invoice status: Draft -> Confirmed -> Paid.
- Nothing is billed twice or skipped.
- Discounts: fixed amount or percentage; minimum purchase or quantity; start and end dates; usage limit;
  apply to specific products or whole subscriptions; appear on the next invoice automatically; stop when
  expired or used up.
- Hundreds of subscriptions may be due at once; thousands exist; pages respond in under 2 seconds.

## 2. Inputs from teammates (interfaces to code against)

Define these as plain data types in one `contracts` file. Teammates' real data must match these shapes later.
Field names are placeholders; rename once the team agrees the API contract.

- **Plan**: id, name, billing_period (daily | weekly | monthly | yearly), min_quantity, available_from,
  available_to, price, and per-plan flags: auto_close_at_end, closable_early, pausable, renewable.
- **Product**: id, name, type, sales_price, variant price extra (optional).
- **TaxRule**: id, name, rate_percent. How a rule attaches to a product or line is OPEN (see section 3).
- **Customer**: id, name, email, billing address fields **[CUSTOMER_FIELDS]**.
- **Payment-terms**: label and days until due, e.g. "Net 15" = 15 days. Exact list is OPEN.

Provide in-memory lookup functions for each (get_plan(id), get_product(id), get_tax_rules_for(line),
get_customer(id)) that read from fixtures now. Teammates' real code replaces them later with no change to the core.

## 3. Decisions

| # | Topic | Status | Decision |
|---|---|---|---|
| D1 | Money type | PROPOSED | Decimal or integer minor units; never float. |
| D2 | Rounding | PROPOSED | Round each line's tax half-up to 2 decimals; invoice total is the sum of rounded line values. |
| D3 | Tax mode | PROPOSED | Tax-exclusive: tax is added on top of line amount after discount. |
| D4 | Tax order | PROPOSED | Discount first, then tax on the discounted amount. |
| D5 | Billing timing | PROPOSED | Bill in advance: the invoice for a period is due on that period's start date. |
| D6 | Month/year stepping | PROPOSED | Anchor to the start date's day; compute each period from the anchor (not from the previous period) and clamp to month end (start on the 31st gives Feb 28/29, Apr 30). |
| D7 | Which subscriptions bill | PROPOSED | Only status Active. Periods starting on or after expiry date are not billed. |
| D8 | Pause | OPEN | PROPOSED default: paused periods are skipped, not shifted. Model pause as a flag on an Active subscription, not a new status. |
| D9 | Invoice due date | PROPOSED | Period start date + payment-terms days. |
| D10 | Discount stacking | OPEN | PROPOSED default: all eligible discounts apply, each computed on the original base amount; total discount capped at the base. |
| D11 | Fixed discount scope | PROPOSED | Whole-subscription fixed amount applies once per invoice; product-scoped fixed amount applies once per matching line, capped at that line's amount. |
| D12 | Discount date check | PROPOSED | Use the invoice's period start date, not the date the job runs. |
| D13 | Min purchase / quantity | PROPOSED | Min purchase compares to the pre-discount subtotal of the scoped lines; min quantity to the scoped lines' total quantity. |
| D14 | Cancelled invoice | OPEN | PROPOSED default: a cancelled invoice keeps its (subscription, period) key, so the job does not re-bill that period; re-issuing is a manual action. |
| D15 | Invoice numbering | PROPOSED | Sequential, unique, generated inside the creating transaction. |
| D16 | Subscription closing | PROPOSED | Auto-close at expiry only when the plan's auto_close_at_end flag is true. Early close allowed only if closable_early is true. |
| D17 | Sent / printed | PROPOSED | "Sent" is a timestamp field on the invoice, not a status. Print is a view/export, not a state change. |

## 4. State machines

Implement as a transition table plus one function per entity that returns the new state or raises a clear error.

**Subscription**

| From | Allowed to |
|---|---|
| Draft | Quotation, Closed |
| Quotation | Confirmed, Draft, Closed |
| Confirmed | Active, Closed |
| Active | Closed |
| Closed | (none) |

Also: `renew` behaves per plan flags; `pause` / `resume` toggles the flag when plan.pausable. OPEN: exact renew behaviour.

**Invoice**

| From | Allowed to |
|---|---|
| Draft | Confirmed, Cancelled |
| Confirmed | Paid, Cancelled |
| Paid | (none) |
| Cancelled | (none) |

Paid is set by the payments module through one function you expose: `mark_invoice_paid(invoice_id)`, which only
succeeds from Confirmed. You do not record payments.

## 5. Period calculator

Pure function(s), dates only. Inputs: start_date, expiry_date, billing_period, as_of_date.
Outputs: ordered list of billing periods (period_index, period_start, period_end) and the subset due as of a date.

Rules:
- Period k start = anchor-based date for start_date plus k periods (D6). Period end = next period start minus one day,
  capped at expiry_date.
- Due as of date X: period_start <= X and period_start < expiry_date (D5, D7).
- Catch-up: "due" means every period up to X, not just X's period. The job subtracts already-invoiced periods.
- Daily and weekly add 1 day and 7 days. Yearly from Feb 29 clamps to Feb 28 in non-leap years.

## 6. Invoice calculator

Pure function. Input: subscription lines (product, quantity, unit price), the matching tax rate per line, applicable
discounts. Output: invoice lines with line_amount, discount_amount, taxable_amount, tax_amount, line_total, plus
invoice subtotal, total discount, total tax, grand total.

Steps per line: amount = quantity x unit_price; apply discount (section 7); tax = round_half_up(taxable x rate, 2);
line_total = taxable + tax. Invoice totals are sums of line values. Totals must always reconcile exactly.

## 7. Discount evaluator

Pure function: given a discount rule, the invoice context (period_start, lines), and the rule's current usage_count,
return whether it applies and the discount amount per affected line.

Rule fields (this module owns the table): id, name, kind (fixed | percent), value, min_purchase (optional),
min_quantity (optional), start_date, end_date, usage_limit (optional), usage_count, scope (products | subscription),
product_ids (when scope = products), and optionally a subscription target **[DISCOUNT_TARGETING]**.

Applies when ALL hold: period_start within [start_date, end_date]; min conditions met (D13);
usage_count < usage_limit (or no limit); scope matches (some line matches). Percent value is 0-100.
A discount never makes a line negative. Admin-only creation is enforced by the auth layer, not here.

Usage counting: increment usage_count in the same database transaction that creates the invoice, using an atomic
conditional update so two concurrent runs cannot exceed the limit. What counts as one "use" is OPEN;
PROPOSED: one use per invoice.

## 8. Persistence and constraints

Tables (names are suggestions): quotation_templates (+ lines, validity_days), subscriptions (+ lines),
invoices (+ lines), discount_rules, invoice_discount_applications (which rule applied to which invoice).

Required constraints:
- subscriptions.number unique.
- **invoices UNIQUE (subscription_id, period_start)**: the guard against double billing. Enforce it in the
  database, not only in code.
- invoices.number unique.
- Status columns restricted to the allowed values.
- Indexes for the job and the dashboard: subscriptions(status, next billing date), invoices(status, due_date),
  invoices(subscription_id).

Quotation template -> subscription: copy template lines into a new Draft or Quotation subscription; reject templates
past their validity window (created_at + validity_days).

## 9. Billing job

Function `run_billing(as_of_date)`:
1. Find Active, non-paused subscriptions.
2. For each, compute due periods (section 5) and remove periods that already have an invoice (any status, D14).
3. For each remaining period, in its own transaction: evaluate discounts, build the invoice, insert invoice and lines,
   increment discount usage. Create as Draft.
4. A failure on one subscription is recorded (subscription id, period, error) and does not stop the rest.
5. Return a report: created, skipped-already-billed, failed (with reasons).
6. Running it twice with the same date must create nothing new the second time.
7. Process in batches so hundreds or thousands of subscriptions stay fast; avoid one query per subscription where a
   single query can fetch many.

Auto-close: after billing, close subscriptions at expiry when D16 allows.

## 10. Tests required

Period calculator: each period type; start on the 31st through Feb; leap-year Feb 29 yearly; expiry cutting the last
period; as_of before start (nothing due); catch-up after a missed run.
State machines: every allowed transition succeeds; every disallowed one raises.
Invoice calculator: multi-line, multi-rate invoice reconciles to the cent; rounding edge (x.xx5); zero tax; discounted lines.
Discount evaluator: percent and fixed; below minimums; before start and after end; at usage limit; product vs
subscription scope; discount larger than line is capped; stacking per D10.
Billing job: run twice creates no duplicates; skipped run is caught up; one failing subscription does not block others;
paused subscription is not billed; closed or draft subscription is not billed; concurrent runs cannot double-bill
(unique constraint holds); discount usage limit holds under repeated runs.
Template: valid template copies lines; expired template rejected.
Performance: generate a large set (for example 5,000 subscriptions, **[TARGET_VOLUME]**) and report the job's runtime.

## 11. Fixtures (fake data to create for tests and demos)

- 3 plans: monthly, yearly, weekly (one with pausable true, one with auto_close_at_end true).
- 4 products, one with a variant price extra (the source's example: a brand variant adding 560).
- 2 tax rules (for example 0% and a non-zero rate **[TAX_RATE_EXAMPLE]**).
- 5 customers; subscriptions in every status; a few with several lines and mixed tax rates.
- Discounts: one percent, one fixed, one near its usage limit, one expired, one future-dated.
- Payment terms: e.g. Net 0, Net 15, Net 30.

## 12. Definition of done

All tests in section 10 pass; running the job twice is a no-op the second time; the unique constraint rejects a manual
duplicate insert; every module has a note in `docs/notes/`; the contracts file lists exactly what teammates must provide;
the PROPOSED and OPEN decisions that were chosen or changed are recorded in `docs/decisions_log.md`.
