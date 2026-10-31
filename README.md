# Brightloop: Subscription Management System

> Hackathon project for the **Subscription Management System** problem statement (Brightloop Software scenario).
> Team: **[TEAM_NAME]**

One platform that runs the full life of a subscription business: products and plans, quotations, subscriptions,
automated recurring invoicing, payment tracking and revenue reporting.

## Problem in brief

Brightloop Software sells on subscription (monthly or yearly plans, add-ons, product variants). Today subscriptions live in a
spreadsheet, renewals are remembered by hand, invoices are typed monthly, payments are matched against bank statements, and revenue
reports are built manually each quarter. Renewals get missed, invoices go out wrong, and nobody knows the real recurring revenue.

## What we are building

| Area | Scope |
|---|---|
| Accounts and roles | Signup (unique email, password rules), password reset by email, roles: Admin, Internal staff, Customer portal |
| Products and plans | Products with variants and prices; plans with billing period (daily, weekly, monthly, yearly), minimum quantity, availability dates, close/pause/renew options |
| Quotations and subscriptions | Quotation templates; subscriptions with a number, customer, plan, dates, payment terms and lines; status Draft, Quotation, Confirmed, Active, Closed |
| Invoicing | Invoices generated automatically from subscriptions, automatic taxes, confirm/cancel/send/print, status Draft, Confirmed, Paid; no double or skipped billing |
| Discounts | Admin-created fixed or percentage rules with minimums, dates and usage limits; applied automatically on the next invoice |
| Payments | Record method, amount, date and note against an invoice; paid vs outstanding vs overdue |
| Reporting | Active subscriptions, revenue, amount owed, payments and overdue invoices, with filters and a summary view |
| Performance | Pages respond in under 2 seconds with thousands of subscriptions |

## Tech stack

- Frontend: **[]**
- Backend: **[]**
- Database: **[]**
- Other tools: **[}**

## Team and ownership

| Member | Area | Main parts |
|---|---|---|
| [MEMBER_1_NAME] | Platform and auth | Users, roles, products, variants, plans, taxes |
| [MEMBER_2_NAME] | Billing engine | Quotation templates, subscriptions, invoices, discounts, billing job |
| [MEMBER_3_NAME] | Frontend | Admin, staff and customer portal screens |
| [MEMBER_4_NAME] | Payments and reporting | Payments, finance dashboard, seed data, performance testing |

## Repository layout

```
[REPO_LAYOUT]   (fill in once the folder structure is agreed)
```

## Getting started

```
[SETUP_STEPS]   (clone, install, configure environment, run)
```

- Environment variables: **[ENV_VARIABLES]**
- Test accounts (admin, staff, customer): **[TEST_ACCOUNTS]**
- Run the tests: **[TEST_COMMAND]**

## Team workflow

- One repository; all latest code lives on the `main` branch.
- Every team member pushes at least once every hour.
- Pull before you push; keep commits small; work mainly inside your own area to avoid conflicts.

## Progress

- [ ] Database schema and API contract agreed
- [ ] Auth and roles
- [ ] Products, variants, plans, taxes
- [ ] Quotation templates and subscriptions
- [ ] Invoice generation and billing job
- [ ] Discounts
- [ ] Payments
- [ ] Customer portal
- [ ] Finance dashboard
- [ ] Performance check (under 2 seconds with thousands of subscriptions)
- [ ] Demo walkthrough

## Demo

- Demo link / video: **[DEMO_LINK]**

## Documentation

- Problem statement summary and specs: `docs/` **[DOCS_LOCATION]**
