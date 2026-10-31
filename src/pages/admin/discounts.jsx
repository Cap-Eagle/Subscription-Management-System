
import { useState } from 'react'

const initialDiscounts = [
  {
    id: 'DIS-001',
    name: 'Welcome Offer',
    type: 'Percentage',
    value: 10,
    scope: 'All Subscriptions',
    minimum: 500,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    usageLimit: 100,
    used: 24,
    status: 'Active',
  },
  {
    id: 'DIS-002',
    name: 'Festive Special',
    type: 'Fixed',
    value: 500,
    scope: 'Premium Software',
    minimum: 2000,
    startDate: '2026-10-15',
    endDate: '2026-11-30',
    usageLimit: 50,
    used: 12,
    status: 'Active',
  },
  {
    id: 'DIS-003',
    name: 'Old Customer Offer',
    type: 'Percentage',
    value: 15,
    scope: 'All Products',
    minimum: 1000,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    usageLimit: 30,
    used: 30,
    status: 'Expired',
  },
]

const emptyForm = {
  name: '',
  type: 'Percentage',
  value: '',
  scope: 'All Products',
  minimum: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
}

function Discounts() {
  const [discounts, setDiscounts] = useState(initialDiscounts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.name.toLowerCase().includes(search.toLowerCase()) ||
      discount.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || discount.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (discount) => {
    setEditingId(discount.id)
    setForm({
      name: discount.name,
      type: discount.type,
      value: String(discount.value),
      scope: discount.scope,
      minimum: String(discount.minimum),
      startDate: discount.startDate,
      endDate: discount.endDate,
      usageLimit: String(discount.usageLimit),
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const value = Number(form.value)
    const minimum = Number(form.minimum)
    const usageLimit = Number(form.usageLimit)

    if (
      !form.name.trim() ||
      !form.value ||
      !form.minimum ||
      !form.usageLimit ||
      !form.startDate ||
      !form.endDate
    ) {
      setError('Please complete all fields.')
      return
    }

    if (
      !Number.isFinite(value) ||
      !Number.isFinite(minimum) ||
      !Number.isInteger(usageLimit) ||
      value <= 0 ||
      minimum < 0 ||
      usageLimit <= 0
    ) {
      setError('Enter valid positive discount and usage values.')
      return
    }

    if (form.type === 'Percentage' && value > 100) {
      setError('Percentage discount cannot exceed 100%.')
      return
    }

    if (form.endDate < form.startDate) {
      setError('End date must be after the start date.')
      return
    }

    const discountData = {
      ...form,
      name: form.name.trim(),
      value,
      minimum,
      usageLimit,
      used: 0,
      status: 'Active',
    }

    if (editingId) {
      setDiscounts((previous) =>
        previous.map((discount) =>
          discount.id === editingId
            ? { ...discount, ...discountData }
            : discount
        )
      )
    } else {
      setDiscounts((previous) => [
        ...previous,
        {
          id: `DIS-${String(previous.length + 1).padStart(3, '0')}`,
          ...discountData,
        },
      ])
    }

    setShowForm(false)
    setForm(emptyForm)
    setError('')
  }

  const deleteDiscount = (id) => {
    if (window.confirm('Delete this discount?')) {
      setDiscounts((previous) =>
        previous.filter((discount) => discount.id !== id)
      )
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple-600">
            ADMIN WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Discount Management
          </h1>

          <p className="mt-2 text-slate-500">
            Create and manage promotional discount rules.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
        >
          + Create Discount
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Discounts</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {discounts.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Discounts</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {discounts.filter((d) => d.status === 'Active').length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Expired Discounts</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-500">
            {discounts.filter((d) => d.status === 'Expired').length}
          </h2>
        </div>
      </div>

      {/* Discount Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Discount Rules
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage discount values, validity and usage limits.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search discounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Discount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Scope</th>
                <th className="p-4">Minimum Purchase</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDiscounts.map((discount) => (
                <tr key={discount.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {discount.name}
                    </p>
                    <p className="text-xs text-slate-500">{discount.id}</p>
                  </td>

                  <td className="p-4">{discount.type}</td>

                  <td className="p-4 font-semibold">
                    {discount.type === 'Percentage'
                      ? `${discount.value}%`
                      : `₹${discount.value.toLocaleString('en-IN')}`}
                  </td>

                  <td className="p-4">{discount.scope}</td>

                  <td className="p-4">
                    ₹{discount.minimum.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4">
                    {discount.used}/{discount.usageLimit}
                  </td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      discount.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {discount.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(discount)}
                        className="font-medium text-purple-600 hover:text-purple-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteDiscount(discount.id)}
                        className="font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDiscounts.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No discounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Discount' : 'Create Discount'}
              </h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Discount Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Welcome Offer"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Discount Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                >
                  <option>Percentage</option>
                  <option>Fixed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => updateField('value', e.target.value)}
                  placeholder={form.type === 'Percentage' ? '10' : '500'}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Applicable To
                </label>
                <select
                  value={form.scope}
                  onChange={(e) => updateField('scope', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                >
                  <option>All Products</option>
                  <option>All Subscriptions</option>
                  <option>Premium Software</option>
                  <option>Cloud Storage</option>
                  <option>Business Suite</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Purchase (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.minimum}
                  onChange={(e) => updateField('minimum', e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End Date
                </label>
                <input
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Maximum Usage
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(e) => updateField('usageLimit', e.target.value)}
                  placeholder="100"
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
              >
                {editingId ? 'Save Changes' : 'Create Discount'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Discounts
