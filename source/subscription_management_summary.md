# Subscription Management System: Problem Summary

> Source: `Subscription_Management_System.pdf`. Anything not stated in the source is marked with an uppercase placeholder.

## 1. Overview and Objectives

Build **one unified platform** that runs the full life of a subscription business: product/plan setup, quotes, subscriptions, invoicing, payment collection and revenue reporting.

**Client scenario:** Brightloop Software sells business software on subscription (monthly or yearly), switchable add-ons, and products with variants. Customers range from small monthly shops to large yearly-contract companies.

**Current pain points (as-is):**

| Area | Today | Problem |
|---|---|---|
| Subscriptions | Spreadsheet | No single source of truth |
| Renewals | Remembered by whoever notices | Renewals missed |
| Invoices | Typed by hand monthly | Errors |
| Payments | Matched by scrolling bank statements | Slow, error-prone |
| Revenue reports | Manual, quarterly | No visibility into recurring revenue |

**Objective:** automate each step so nothing is missed, wrong, billed twice or skipped.

## 2. Roles

| Role | Access |
|---|---|
| Admin | Whole system; sole creator of staff, discount rules; configures products, plans, taxes |
| Internal staff | Day-to-day customer work, limited access |
| Customer (portal) | Only their own subscriptions and invoices; self-service management |

## 3. Functional Requirements

### 3.1 Accounts and Authentication
- Sign up with email and password; **one account per email**.
- Password: **more than 8 characters**, with an uppercase letter, a lowercase letter and a special character.
- Forgot-password: reset link sent to the registered email.
- Role-based access (above). Only the admin can add staff.

### 3.2 Products and Variants
- Product fields: name, type, sales price, cost price, notes.
- Variants (e.g. by brand), each with a price effect (example: Odoo brand adds **560** to price).

### 3.3 Plans
- Price and billing period: **daily, weekly, monthly or yearly**.
- Minimum quantity; availability dates.
- Per-plan admin choice of behaviour: auto-close at end, close early, pause, renew.

### 3.4 Quotation Templates and Subscriptions
- Quotation templates preloaded with plan and product lines, valid for a set number of days.
- Subscription fields: unique number, customer, plan, start date, expiry date, payment terms.
- Order lines: product, quantity, unit price, taxes, amount.
- Status flow: **Draft → Quotation → Confirmed → Active → Closed**, visible to the whole team.

### 3.5 Invoicing
- Generated automatically from subscriptions (customer details, lines, taxes, totals prefilled) in bulk on billing day.
- Taxes computed from admin-defined rules.
- Actions: confirm, cancel, send, print.
- Status flow: **Draft → Confirmed → Paid**.
- **No duplicate billing and no skipped billing.**

### 3.6 Discounts
- Admin-only creation. Type: fixed amount or percentage.
- Conditions: minimum purchase or quantity; start/end dates; usage limit.
- Scope: specific products or whole subscriptions.
- Applied automatically on the next invoice; stops on expiry or when the limit is reached.

### 3.7 Payments
- Record method, amount, date and note against the correct invoice.
- Multiple methods and dates supported.
- Visibility of paid vs outstanding invoices; overdue ones can be chased.

### 3.8 Reporting (Finance Lead)
- One place showing: active subscriptions, revenue received, amount still owed, payments, overdue invoices.
- Filters and a summary view.

## 4. Non-Functional / Technical Constraints

| Item | Detail |
|---|---|
| Performance | Every page responds in **under 2 seconds** with thousands of subscriptions |
| Scale | Hundreds of subscriptions invoiced at once; thousands on the books |
| Platform / language / APIs | **[TECH_STACK]** (not specified) |
| Payment gateway / email provider | **[PAYMENT_GATEWAY]**, **[EMAIL_PROVIDER]** (not specified) |
| Currency / tax jurisdiction | **[CURRENCY]**, **[TAX_RULES]** (not specified) |

## 5. Evaluation Criteria and Scoring

**[EVALUATION_CRITERIA]**: not provided in the source. **[SCORING_RUBRIC]**: not provided.

## 6. Deliverables and Timeline

- Required deliverable: a working platform covering the scenes above. Format: **[SUBMISSION_FORMAT]**.
- Deadline / milestones: **[TIMELINE]**. Prizes and sponsors: **[PRIZES]** (not provided).

## 7. Provided Data and Reference Material

- No datasets, sample inputs/outputs or diagrams in the source. Placeholders: **[DATASET_1]**, **[SAMPLE_IO_1]**, **[DIAGRAM_1]**.

## 8. Open Questions for the Team
1. Tech stack and hosting? 2. Payment gateway integration or manual recording only? 3. Tax rule model (per product, region, inclusive/exclusive)? 4. Rules for proration, paused-plan billing, and renewals? 5. How is "overdue" defined (payment terms)? 6. Scoring rubric and deadline?
