
import { useState } from 'react'

const initialSubscriptions = [
  {
    id: 'SUB-1001',
    customer: 'Alex Johnson',
    product: 'Premium Software',
    plan: 'Monthly',
    quantity: 1,
    amount: 999,
    startDate: '01 Oct 2026',
    nextBilling: '01 Nov 2026',
    status: 'Active',
  },
  {
    id: 'SUB-1002',
    customer: 'Sarah Williams',
    product: 'Cloud Storage',
    plan: 'Yearly',
    quantity: 2,
    amount: 4999,
    startDate: '15 Sep 2026',
    nextBilling: '15 Sep 2027',
    status: 'Active',
  },
  {
    id: 'SUB-1003',
    customer: 'David Thomas',
    product: 'Business Suite',
    plan: 'Monthly',
    quantity: 1,
    amount: 1499,
    startDate: '10 Aug 2026',
    nextBilling: '10 Sep 2026',
    status: 'Closed',
  },
  {
    id: 'SUB-1004',
    customer: 'Emma Wilson',
    product: 'Premium Software',
    plan: 'Weekly',
    quantity: 3,
    amount: 499,
    startDate: '20 Oct 2026',
    nextBilling: '27 Oct 2026',
    status: 'Draft',
  },
]

function Subscriptions() {
  const [subscriptions] = useState(initialSubscriptions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedSubscription, setSelectedSubscription] = useState(null)

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.id.toLowerCase().includes(search.toLowerCase()) ||
      sub.customer.toLowerCase().includes(search.toLowerCase()) ||
      sub.product.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusStyle = (status) => {
    if (status === 'Active') return 'bg-green-100 text-green-700'
    if (status === 'Closed') return 'bg-slate-100 text-slate-600'
    if (status === 'Draft') return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-purple-600">
          STAFF WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Subscriptions
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor customer subscriptions and billing schedules.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Subscriptions</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {subscriptions.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Subscriptions</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {subscriptions.filter((s) => s.status === 'Active').length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Draft Subscriptions</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-500">
            {subscriptions.filter((s) => s.status === 'Draft').length}
          </h2>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Subscription Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and view subscription records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search subscriptions..."
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
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Subscription ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Next Billing</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">{sub.id}</td>
                  <td className="p-4">{sub.customer}</td>
                  <td className="p-4">{sub.product}</td>
                  <td className="p-4">{sub.plan}</td>
                  <td className="p-4">
                    ₹{sub.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">{sub.nextBilling}</td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setSelectedSubscription(sub)}
                      className="font-medium text-purple-600 hover:text-purple-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Subscription Details
              </h2>

              <button
                onClick={() => setSelectedSubscription(null)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Subscription ID', selectedSubscription.id],
                ['Customer', selectedSubscription.customer],
                ['Product', selectedSubscription.product],
                ['Plan', selectedSubscription.plan],
                ['Quantity', selectedSubscription.quantity],
                ['Amount', `₹${selectedSubscription.amount.toLocaleString('en-IN')}`],
                ['Start Date', selectedSubscription.startDate],
                ['Next Billing', selectedSubscription.nextBilling],
                ['Status', selectedSubscription.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedSubscription(null)}
              className="mt-7 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
