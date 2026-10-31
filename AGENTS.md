# Project rules: Billing Engine (Subscription Management System)

You are helping build ONE module of a four-person hackathon project: the **billing engine**.
Read `docs/billing_engine_spec.md` before writing any code. It is the source of truth.
The original problem statement is in `source/Subscription_Management_System.pdf`.

## Rules
1. Build only the billing engine: subscriptions, quotation templates, invoices, discounts, billing job.
   Do NOT build auth, product/plan CRUD, payments, dashboard or UI. Other teammates own those.
2. Teammates' data (plans, products, taxes, customers) arrives later. Use the interfaces in spec section 2
   and the fixtures in spec section 11. Never invent extra fields on those interfaces.
3. Keep the core logic (state machines, period calculator, invoice calculator, discount evaluator) as PURE
   functions with no database or framework imports. Persistence and the billing job sit in a thin outer layer.
4. Money: never use floating point. Use the rounding rule in spec section 6.
5. Write tests first or alongside each module. Run them before saying a task is done.
6. Items marked OPEN in the spec are undecided. Do not silently pick; ask me, or use the PROPOSED default and
   list it in your reply under "Assumptions I made".
7. After each module, add a short plain-English note to `docs/notes/<module>.md` (what it does, why it is
   built that way, what edge cases it handles). I want to understand the logic, not just receive code.
8. Keep changes small and focused. Do not refactor files outside the current task.
