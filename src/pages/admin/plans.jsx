
import { useState } from 'react'

const initialPlans = [
  {
    id: 1,
    name: 'Basic Daily',
    cycle: 'Daily',
    price: 100,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Weekly Standard',
    cycle: 'Weekly',
    price: 500,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Monthly Premium',
    cycle: 'Monthly',
    price: 2000,
    minQuantity: 2,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Annual Enterprise',
    cycle: 'Yearly',
    price: 20000,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Inactive',
  },
]

function Plans() {
  const [plans, setPlans] = useState(initialPlans)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const emptyForm = {
    name: '',
    cycle: 'Monthly',
    price: '',
    minQuantity: '1',
    startDate: '',
    endDate: '',
  }

  const [form, setForm] = useState(emptyForm)

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (plan) => {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      cycle: plan.cycle,
      price: String(plan.price),
      minQuantity: String(plan.minQuantity),
      startDate: plan.startDate,
      endDate: plan.endDate,
    })
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.endDate < form.startDate) {
      alert('End date must be after the start date.')
      return
    }

    const updatedPlan = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      cycle: form.cycle,
      price: Number(form.price),
      minQuantity: Number(form.minQuantity),
      startDate: form.startDate,
      endDate: form.endDate,
      status: 'Active',
    }

    if (editingId) {
      setPlans((previous) =>
        previous.map((plan) =>
          plan.id === editingId ? updatedPlan : plan
        )
      )
    } else {
      setPlans((previous) => [...previous, updatedPlan])
    }

    setShowForm(false)
  }

  const deletePlan = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans((previous) => previous.filter((plan) => plan.id !== id))
    }
  }

  const formatPrice = (price) =>
    `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Subscription Plans
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage subscription billing plans.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Create Plan
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Plans</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {plans.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Active Plans</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {plans.filter((p) => p.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Billing Cycles</p>
          <h3 className="mt-3 text-3xl font-bold text-indigo-600">
            {new Set(plans.map((p) => p.cycle)).size}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">All Plans</h3>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Min Quantity</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {plan.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {plan.cycle}
                  </td>

                  <td className="px-6 py-5 font-medium text-slate-700">
                    {formatPrice(plan.price)}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {plan.minQuantity}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-xs text-slate-600">
                    {plan.startDate} to {plan.endDate}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      plan.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {plan.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(plan)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-8 w-full max-w-lg space-y-5 rounded-2xl bg-white p-7 shadow-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Plan' : 'Create Subscription Plan'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the plan configuration.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Plan Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter plan name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Billing Cycle
              </label>
              <select
                value={form.cycle}
                onChange={(e) => setForm({ ...form, cycle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price (₹)
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
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Available From
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
                  Available Until
                </label>
                <input
                  type="date"
                  required
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
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
                {editingId ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Plans
