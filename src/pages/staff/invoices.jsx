
import { useState } from 'react'

const initialInvoices = [
  {
    id: 'INV-1001',
    customer: 'Alex Johnson',
    subscription: 'SUB-1001',
    date: '15 Oct 2026',
    dueDate: '01 Nov 2026',
    amount: 999,
    status: 'Paid',
  },
  {
    id: 'INV-1002',
    customer: 'Sarah Williams',
    subscription: 'SUB-1002',
    date: '20 Oct 2026',
    dueDate: '05 Nov 2026',
    amount: 4999,
    status: 'Pending',
  },
  {
    id: 'INV-1003',
    customer: 'David Thomas',
    subscription: 'SUB-1003',
    date: '10 Sep 2026',
    dueDate: '20 Sep 2026',
    amount: 1499,
    status: 'Overdue',
  },
  {
    id: 'INV-1004',
    customer: 'Emma Wilson',
    subscription: 'SUB-1004',
    date: '25 Oct 2026',
    dueDate: '10 Nov 2026',
    amount: 1999,
    status: 'Draft',
  },
]

function Invoices() {
  const [invoices] = useState(initialInvoices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(search.toLowerCase()) ||
      invoice.subscription.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusStyle = (status) => {
    if (status === 'Paid') return 'bg-green-100 text-green-700'
    if (status === 'Pending') return 'bg-orange-100 text-orange-700'
    if (status === 'Overdue') return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-purple-600">
          STAFF WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Invoices
        </h1>

        <p className="mt-2 text-slate-500">
          View customer invoices and monitor payment status.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {invoices.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Paid Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {invoices.filter((i) => i.status === 'Paid').length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Overdue Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {invoices.filter((i) => i.status === 'Overdue').length}
          </h2>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Invoice Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and view customer invoice records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search invoices..."
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
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subscription</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">{invoice.id}</td>
                  <td className="p-4">{invoice.customer}</td>
                  <td className="p-4">{invoice.subscription}</td>
                  <td className="p-4">{invoice.date}</td>
                  <td className="p-4">{invoice.dueDate}</td>
                  <td className="p-4 font-medium">
                    ₹{invoice.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="font-medium text-purple-600 hover:text-purple-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Invoice Details
              </h2>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Invoice ID', selectedInvoice.id],
                ['Customer', selectedInvoice.customer],
                ['Subscription', selectedInvoice.subscription],
                ['Invoice Date', selectedInvoice.date],
                ['Due Date', selectedInvoice.dueDate],
                ['Amount', `₹${selectedInvoice.amount.toLocaleString('en-IN')}`],
                ['Status', selectedInvoice.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
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

export default Invoices
