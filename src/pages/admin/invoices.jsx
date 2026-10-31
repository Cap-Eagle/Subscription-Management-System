
import { useState } from 'react'

const initialInvoices = [
  {
    id: 'INV-2026-001',
    customer: 'Rahul Menon',
    email: 'rahul@example.com',
    product: 'Odoo Enterprise',
    amount: 24000,
    tax: 4320,
    total: 28320,
    issueDate: '2026-10-01',
    dueDate: '2026-11-01',
    status: 'Confirmed',
  },
  {
    id: 'INV-2026-002',
    customer: 'Ananya Sharma',
    email: 'ananya@example.com',
    product: 'Cloud Storage',
    amount: 5000,
    tax: 900,
    total: 5900,
    issueDate: '2026-10-20',
    dueDate: '2026-10-27',
    status: 'Paid',
  },
  {
    id: 'INV-2026-003',
    customer: 'Arjun Nair',
    email: 'arjun@example.com',
    product: 'Premium Support',
    amount: 3000,
    tax: 540,
    total: 3540,
    issueDate: '2026-10-25',
    dueDate: '2026-10-30',
    status: 'Draft',
  },
  {
    id: 'INV-2026-004',
    customer: 'Meera Krishnan',
    email: 'meera@example.com',
    product: 'Analytics Suite',
    amount: 20000,
    tax: 3600,
    total: 23600,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Overdue',
  },
]

function Invoices() {
  const [invoices] = useState(initialInvoices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      `${invoice.id} ${invoice.customer} ${invoice.product}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatPrice = (amount) =>
    `₹${amount.toLocaleString('en-IN')}`

  const statusStyle = {
    Draft: 'bg-slate-100 text-slate-600',
    Confirmed: 'bg-blue-50 text-blue-700',
    Paid: 'bg-emerald-50 text-emerald-700',
    Overdue: 'bg-red-50 text-red-600',
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Invoices
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          View, track and print customer invoices.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {invoices.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Paid Invoices</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {invoices.filter((i) => i.status === 'Paid').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Overdue Invoices</p>
          <h3 className="mt-3 text-3xl font-bold text-red-600">
            {invoices.filter((i) => i.status === 'Overdue').length}
          </h3>
        </div>
      </div>

      {/* Invoice table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">
            All Invoices
          </h3>

          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-56"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option>All</option>
              <option>Draft</option>
              <option>Confirmed</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-indigo-600">
                    {invoice.id}
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {invoice.customer}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                    {invoice.issueDate}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                    {invoice.dueDate}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800">
                    {formatPrice(invoice.total)}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice details modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">

            {/* Printable invoice */}
            <div className="invoice-print-area">

              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700">
                    Brightloop
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Subscription Management System
                  </p>
                </div>

                <div className="text-right">
                  <h3 className="text-2xl font-bold text-slate-900">
                    INVOICE
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedInvoice.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-7">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Bill To
                  </p>
                  <p className="mt-3 font-semibold text-slate-900">
                    {selectedInvoice.customer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInvoice.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Invoice Details
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Issue Date: {selectedInvoice.issueDate}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Due Date: {selectedInvoice.dueDate}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Status: {selectedInvoice.status}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4">Description</th>
                    <th className="px-4 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-5">
                      {selectedInvoice.product}
                    </td>
                    <td className="px-4 py-5 text-right">
                      {formatPrice(selectedInvoice.amount)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-4 text-slate-600">
                      Tax
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatPrice(selectedInvoice.tax)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="ml-auto mt-6 max-w-xs space-y-3">
                <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-indigo-700">
                    {formatPrice(selectedInvoice.total)}
                  </span>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
                Thank you for choosing Brightloop.
              </div>
            </div>

            {/* Modal buttons */}
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={printInvoice}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invoices
