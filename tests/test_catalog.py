import pytest

PRODUCT = {"name": "CRM Suite", "type": "service", "sales_price": "1000.00", "cost_price": "400.00", "notes": "core"}


@pytest.fixture
def product(client, admin_headers):
    response = client.post("/api/products", json=PRODUCT, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def make_plan(client, headers, product_id, **overrides):
    body = {"name": "Monthly", "product_id": product_id, "price": "99.00", "billing_period": "monthly", **overrides}
    return client.post("/api/plans", json=body, headers=headers)


# --- products -------------------------------------------------------------------------------

def test_product_crud(client, admin_headers, product):
    pid = product["id"]
    assert client.get(f"/api/products/{pid}", headers=admin_headers).json()["name"] == "CRM Suite"

    patched = client.patch(f"/api/products/{pid}", json={"sales_price": "1200.50", "notes": None}, headers=admin_headers)
    assert patched.status_code == 200
    assert patched.json()["sales_price"] == "1200.50" and patched.json()["notes"] is None
    assert patched.json()["name"] == "CRM Suite"  # untouched fields stay as they were

    assert client.patch(f"/api/products/{pid}", json={"name": None}, headers=admin_headers).status_code == 422
    assert client.delete(f"/api/products/{pid}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/products/{pid}", headers=admin_headers).status_code == 404


def test_product_rejects_negative_prices(client, admin_headers):
    assert client.post("/api/products", json={**PRODUCT, "sales_price": "-1"}, headers=admin_headers).status_code == 422


# --- variants -------------------------------------------------------------------------------

def test_variant_is_rejected_when_its_product_does_not_exist(client, admin_headers):
    response = client.post(
        "/api/products/9999/variants",
        json={"attribute": "Brand", "value": "Odoo", "price_effect": "560"},
        headers=admin_headers,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"
    assert client.get("/api/products/9999/variants", headers=admin_headers).status_code == 404


def test_variant_crud_and_price_effect(client, admin_headers, product):
    pid = product["id"]
    created = client.post(
        f"/api/products/{pid}/variants",
        json={"attribute": "Brand", "value": "Odoo", "price_effect": "560"},
        headers=admin_headers,
    )
    assert created.status_code == 201
    variant = created.json()
    assert variant["product_id"] == pid and variant["price_effect"] == "560.00"

    # the same attribute/value twice on one product is a conflict
    dup = client.post(f"/api/products/{pid}/variants", json={"attribute": "Brand", "value": "Odoo"}, headers=admin_headers)
    assert dup.status_code == 409

    assert len(client.get(f"/api/products/{pid}/variants", headers=admin_headers).json()) == 1
    patched = client.patch(f"/api/variants/{variant['id']}", json={"price_effect": "-50"}, headers=admin_headers)
    assert patched.json()["price_effect"] == "-50.00"

    # a variant cannot be moved to another product
    moved = client.patch(f"/api/variants/{variant['id']}", json={"product_id": 2}, headers=admin_headers)
    assert moved.status_code == 422
    assert client.delete(f"/api/variants/{variant['id']}", headers=admin_headers).status_code == 204


def test_deleting_a_product_deletes_its_variants(client, admin_headers, product):
    pid = product["id"]
    variant = client.post(f"/api/products/{pid}/variants", json={"attribute": "Brand", "value": "A"}, headers=admin_headers).json()
    assert client.delete(f"/api/products/{pid}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/variants/{variant['id']}", headers=admin_headers).status_code == 404


# --- taxes and plans ------------------------------------------------------------------------

def test_plan_references_a_tax_and_follows_rate_changes(client, admin_headers, product):
    tax = client.post("/api/taxes", json={"name": "GST", "rate_percent": "18"}, headers=admin_headers)
    assert tax.status_code == 201
    tax_id = tax.json()["id"]

    created = make_plan(client, admin_headers, product["id"], tax_ids=[tax_id])
    assert created.status_code == 201, created.text
    plan = created.json()
    assert [t["id"] for t in plan["taxes"]] == [tax_id]
    assert plan["taxes"][0]["rate_percent"] == "18.00"

    # the reference is stored: reading the plan back shows the tax
    fetched = client.get(f"/api/plans/{plan['id']}", headers=admin_headers).json()
    assert [t["name"] for t in fetched["taxes"]] == ["GST"]

    # changing the tax rate is reflected on every plan that references it
    assert client.patch(f"/api/taxes/{tax_id}", json={"rate_percent": "12.5"}, headers=admin_headers).status_code == 200
    refreshed = client.get(f"/api/plans/{plan['id']}", headers=admin_headers).json()
    assert refreshed["taxes"][0]["rate_percent"] == "12.50"


def test_plan_tax_attachment_can_be_replaced_and_cleared(client, admin_headers, product):
    gst = client.post("/api/taxes", json={"name": "GST", "rate_percent": "18"}, headers=admin_headers).json()
    vat = client.post("/api/taxes", json={"name": "VAT", "rate_percent": "5"}, headers=admin_headers).json()
    plan = make_plan(client, admin_headers, product["id"], tax_ids=[gst["id"]]).json()

    swapped = client.patch(f"/api/plans/{plan['id']}", json={"tax_ids": [vat["id"], gst["id"]]}, headers=admin_headers).json()
    assert [t["name"] for t in swapped["taxes"]] == ["GST", "VAT"]
    cleared = client.patch(f"/api/plans/{plan['id']}", json={"tax_ids": []}, headers=admin_headers).json()
    assert cleared["taxes"] == []
    untouched = client.patch(f"/api/plans/{plan['id']}", json={"price": "120"}, headers=admin_headers).json()
    assert untouched["price"] == "120.00" and untouched["taxes"] == []


def test_plan_rejects_unknown_tax_and_tax_rate_limits(client, admin_headers, product):
    response = make_plan(client, admin_headers, product["id"], tax_ids=[4242])
    assert response.status_code == 422 and "4242" in response.json()["detail"]
    assert client.post("/api/taxes", json={"name": "Bad", "rate_percent": "101"}, headers=admin_headers).status_code == 422
    assert client.post("/api/taxes", json={"name": "Bad", "rate_percent": "-1"}, headers=admin_headers).status_code == 422


def test_tax_in_use_cannot_be_deleted_until_detached(client, admin_headers, product):
    tax = client.post("/api/taxes", json={"name": "GST", "rate_percent": "18"}, headers=admin_headers).json()
    plan = make_plan(client, admin_headers, product["id"], tax_ids=[tax["id"]]).json()

    assert client.delete(f"/api/taxes/{tax['id']}", headers=admin_headers).status_code == 409
    client.patch(f"/api/plans/{plan['id']}", json={"tax_ids": []}, headers=admin_headers)
    assert client.delete(f"/api/taxes/{tax['id']}", headers=admin_headers).status_code == 204


def test_deleting_a_plan_keeps_its_taxes(client, admin_headers, product):
    tax = client.post("/api/taxes", json={"name": "GST", "rate_percent": "18"}, headers=admin_headers).json()
    plan = make_plan(client, admin_headers, product["id"], tax_ids=[tax["id"]]).json()
    assert client.delete(f"/api/plans/{plan['id']}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/taxes/{tax['id']}", headers=admin_headers).status_code == 200


def test_tax_names_are_unique(client, admin_headers):
    assert client.post("/api/taxes", json={"name": "GST", "rate_percent": "18"}, headers=admin_headers).status_code == 201
    assert client.post("/api/taxes", json={"name": "GST", "rate_percent": "5"}, headers=admin_headers).status_code == 409


# --- plan relationships ---------------------------------------------------------------------

def test_plan_requires_an_existing_product(client, admin_headers):
    assert make_plan(client, admin_headers, 9999).status_code == 422


def test_plan_variant_must_belong_to_the_plans_product(client, admin_headers, product):
    other = client.post("/api/products", json={**PRODUCT, "name": "Other"}, headers=admin_headers).json()
    variant = client.post(f"/api/products/{other['id']}/variants", json={"attribute": "Brand", "value": "X"}, headers=admin_headers).json()

    wrong = make_plan(client, admin_headers, product["id"], variant_id=variant["id"])
    assert wrong.status_code == 422
    right = make_plan(client, admin_headers, other["id"], variant_id=variant["id"])
    assert right.status_code == 201 and right.json()["variant_id"] == variant["id"]
    assert make_plan(client, admin_headers, product["id"], variant_id=9999).status_code == 422


def test_changing_a_plans_product_requires_a_matching_variant(client, admin_headers, product):
    other = client.post("/api/products", json={**PRODUCT, "name": "Other"}, headers=admin_headers).json()
    variant = client.post(f"/api/products/{product['id']}/variants", json={"attribute": "Brand", "value": "X"}, headers=admin_headers).json()
    plan = make_plan(client, admin_headers, product["id"], variant_id=variant["id"]).json()

    # moving the plan to another product while keeping the old variant would break consistency
    assert client.patch(f"/api/plans/{plan['id']}", json={"product_id": other["id"]}, headers=admin_headers).status_code == 422
    moved = client.patch(f"/api/plans/{plan['id']}", json={"product_id": other["id"], "variant_id": None}, headers=admin_headers)
    assert moved.status_code == 200 and moved.json()["variant_id"] is None


def test_product_and_variant_in_use_by_a_plan_cannot_be_deleted(client, admin_headers, product):
    variant = client.post(f"/api/products/{product['id']}/variants", json={"attribute": "Brand", "value": "X"}, headers=admin_headers).json()
    plan = make_plan(client, admin_headers, product["id"], variant_id=variant["id"]).json()

    assert client.delete(f"/api/variants/{variant['id']}", headers=admin_headers).status_code == 409
    assert client.delete(f"/api/products/{product['id']}", headers=admin_headers).status_code == 409
    # nothing was lost by the refused deletes
    assert client.get(f"/api/variants/{variant['id']}", headers=admin_headers).status_code == 200

    client.delete(f"/api/plans/{plan['id']}", headers=admin_headers)
    assert client.delete(f"/api/products/{product['id']}", headers=admin_headers).status_code == 204


def test_plan_field_rules(client, admin_headers, product):
    assert make_plan(client, admin_headers, product["id"], billing_period="hourly").status_code == 422
    assert make_plan(client, admin_headers, product["id"], min_quantity=0).status_code == 422
    assert make_plan(client, admin_headers, product["id"], price="-5").status_code == 422
    backwards = make_plan(client, admin_headers, product["id"], available_from="2026-12-31", available_to="2026-01-01")
    assert backwards.status_code == 422

    good = make_plan(client, admin_headers, product["id"], billing_period="daily", min_quantity=2, allow_pause=True,
                     available_from="2026-01-01", available_to="2026-12-31")
    assert good.status_code == 201
    body = good.json()
    assert body["billing_period"] == "daily" and body["min_quantity"] == 2 and body["allow_pause"] is True
    assert body["allow_renew"] is True and body["auto_close"] is False  # defaults
