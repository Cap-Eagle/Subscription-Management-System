
import { useState } from 'react'

const initialProducts = [
  {
    id: 1,
    name: 'Odoo Enterprise',
    type: 'Software',
    price: 12000,
    cost: 8000,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Cloud Storage',
    type: 'Service',
    price: 5000,
    cost: 2500,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Premium Support',
    type: 'Service',
    price: 3000,
    cost: 1500,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Analytics Suite',
    type: 'Software',
    price: 8500,
    cost: 4000,
    status: 'Inactive',
  },
]

function Products() {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    type: 'Software',
    price: '',
    cost: '',
  })

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAddForm = () => {
    setEditingId(null)
    setForm({ name: '', type: 'Software', price: '', cost: '' })
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      type: product.type,
      price: String(product.price),
      cost: String(product.cost),
    })
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const newProduct = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      type: form.type,
      price: Number(form.price),
      cost: Number(form.cost),
      status: 'Active',
    }

    if (editingId) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingId ? newProduct : product
        )
      )
    } else {
      setProducts((previous) => [...previous, newProduct])
    }

    setShowForm(false)
  }

  const deleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      )
    }
  }

  const formatPrice = (price) =>
    `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Products
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage your products, pricing and product information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Add Product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Products</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {products.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Active Products</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {products.filter((p) => p.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Inactive Products</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-500">
            {products.filter((p) => p.status === 'Inactive').length}
          </h3>
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">
            All Products
          </h3>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Sales Price</th>
                <th className="px-6 py-4">Cost Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {product.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {product.type}
                  </td>

                  <td className="px-6 py-5 font-medium text-slate-700">
                    {formatPrice(product.price)}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {formatPrice(product.cost)}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      product.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(product)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-7 shadow-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the product details below.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option>Software</option>
                <option>Service</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sales Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Products
