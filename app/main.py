from fastapi import APIRouter, FastAPI

from app.routers import auth, customers, payment_terms, plans, products, staff, taxes, variants

app = FastAPI(title="Subscription Management: Platform and Auth")

api = APIRouter(prefix="/api")
for module in (auth, staff, products, variants, plans, taxes, customers, payment_terms):
    api.include_router(module.router)
app.include_router(api)
