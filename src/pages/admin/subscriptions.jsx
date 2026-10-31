
import { useState } from 'react'

const initialSubscriptions = [
  {
    id: 1,
    customer: 'Rahul Menon',
    product: 'Odoo Enterprise',
    plan: 'Monthly Premium',
    quantity: 2,
    startDate: '2026-10-01',
    nextBilling: '2026-11-01',
    status: 'Active',
  },
  {
    id: 2,
    customer: 'Ananya Sharma',
    product: 'Cloud Storage',
    plan: 'Weekly Standard',
    quantity: 1,
    startDate: '2026-10-20',
    nextBilling: '2026-10-27',
    status: 'Confirmed',
  },
  {
    id: 3,
    customer: 'Arjun Nair',
    product: 'Premium Support',
    plan: 'Basic Daily',
    quantity: 1,
    startDate: '2026-10-25',
    nextBilling: '2026-10-26',
    status: 'Draft',
  },
  {
    id: 4,
    customer: 'Meera Krishnan',
    product: 'Analytics Suite',
    plan: 'Annual Enterprise',
    quantity: 1,
    startDate: '2026-01-01',
    nextBilling: '2027-01-01',
    status: 'Closed',
  },
]

const customers = [
  'Rahul Menon',
  'Ananya Sharma',
  'Arjun Nair',
  'Meera Krishnan',
]

const products = [
  'Odoo Enterprise',
  'Cloud Storage',
  'Premium Support',
  'Analytics Suite',
]

const plans = [
  'Basic Daily',
  'Weekly Standard',
  'Monthly Premium',
  'Annual Enterprise',
]

const statuses = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed']

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const emptyForm = {
    customer: '',
    product: '',
    plan: '',
    quantity: '1',
    startDate: '',
    nextBilling: '',
    status: 'Draft',
  }

  const [form, setForm] = useState(emptyForm)

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      `${sub.customer} ${sub.product} ${sub.plan}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (sub) => {
    setEditingId(sub.id)
    setForm({
      customer: sub.customer,
      product: sub.product,
      plan: sub.plan,
      quantity: String(sub.quantity),
      startDate: sub.startDate,
      nextBilling: sub.nextBilling,
      status: sub.status,
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.nextBilling < form.startDate) {
      setError('Next billing date cannot be before the start date.')
      return
    }

    const updatedSubscription = {
      id: editingId ?? Date.now(),
      ...form,
      quantity: Number(form.quantity),
    }

    if (editingId) {
      setSubscriptions((previous) =>
        previous.map((sub) =>
          sub.id === editingId ? updatedSubscription : sub
        )
      )
    } else {
      setSubscriptions((previous) => [
        ...previous,
        updatedSubscription,
      ])
    }

    setShowForm(false)
    setError('')
  }

  const updateStatus = (id, status) => {
    setSubscriptions((previous) =>
      previous.map((sub) =>
        sub.id === id ? { ...sub, status } : sub
      )
    )
  }

  const deleteSubscription = (id) => {
    if (window.confirm('Delete this subscription?')) {
      setSubscriptions((previous) =>
        previous.filter((sub) => sub.id !== id)
      )
    }
  }

  const statusStyle = {
    Draft: 'bg-slate-100 text-slate-600',
    Quotation: 'bg-amber-50 text-amber-700',
    Confirmed: 'bg-blue-50 text-blue-700',
    Active: 'bg-emerald-50 text-emerald-700',
    Closed: 'bg-red-50 text-red-600',
  }

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Subscriptions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage customer subscriptions and their billing lifecycle.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Create Subscription
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Subscriptions</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {subscriptions.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Active Subscriptions</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {subscriptions.filter((s) => s.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Closed Subscriptions</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-500">
            {subscriptions.filter((s) => s.status === 'Closed').length}
          </h3>
        </div>
      </div>

      {/* Subscription table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">
            All Subscriptions
          </h3>

          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-56"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option>All</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Next Billing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {sub.customer}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {sub.product}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {sub.plan}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {sub.quantity}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                    {sub.nextBilling}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openEditForm(sub)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      {sub.status !== 'Closed' && (
                        <button
                          onClick={() => updateStatus(sub.id, 'Closed')}
                          className="font-semibold text-red-500 hover:text-red-700"
                        >
                          Close
                        </button>
                      )}

                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        className="font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-8 w-full max-w-xl space-y-5 rounded-2xl bg-white p-7 shadow-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Subscription' : 'Create Subscription'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the subscription details.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Customer
              </label>
              <select
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer}>{customer}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product
                </label>
                <select
                  required
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product}>{product}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Plan
                </label>
                <select
                  required
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Select plan</option>
                  {plans.map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Next Billing Date
                </label>
                <input
                  type="date"
                  required
                  min={form.startDate || undefined}
                  value={form.nextBilling}
                  onChange={(e) => setForm({ ...form, nextBilling: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

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
                {editingId ? 'Save Changes' : 'Create Subscription'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
