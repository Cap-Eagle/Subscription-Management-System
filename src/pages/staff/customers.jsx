
import { useState } from 'react'

const initialCustomers = [
  {
    id: 'CUS-1001',
    name: 'Alex Johnson',
    email: 'alex@gmail.com',
    phone: '+91 9876543210',
    company: 'Tech Solutions',
    subscriptions: 2,
    status: 'Active',
  },
  {
    id: 'CUS-1002',
    name: 'Sarah Williams',
    email: 'sarah@gmail.com',
    phone: '+91 9876543211',
    company: 'Digital Works',
    subscriptions: 1,
    status: 'Active',
  },
  {
    id: 'CUS-1003',
    name: 'David Thomas',
    email: 'david@gmail.com',
    phone: '+91 9876543212',
    company: 'Creative Studio',
    subscriptions: 3,
    status: 'Inactive',
  },
  {
    id: 'CUS-1004',
    name: 'Emma Wilson',
    email: 'emma@gmail.com',
    phone: '+91 9876543213',
    company: 'Cloud Systems',
    subscriptions: 1,
    status: 'Active',
  },
]

function Customers() {
  const [customers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-purple-600">
          STAFF WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-2 text-slate-500">
          View customer information and subscription activity.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {customers.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {customers.filter((c) => c.status === 'Active').length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-500">
            {customers.filter((c) => c.status === 'Inactive').length}
          </h2>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Customer Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and view registered customers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search customers..."
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Company</th>
                <th className="p-4">Subscriptions</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {customer.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {customer.email}
                    </p>
                  </td>

                  <td className="p-4 font-medium">
                    {customer.id}
                  </td>

                  <td className="p-4">{customer.company}</td>

                  <td className="p-4">
                    {customer.subscriptions}
                  </td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      customer.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="font-medium text-purple-600 hover:text-purple-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Customer Details
              </h2>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Customer Name</p>
                <p className="font-semibold text-slate-900">
                  {selectedCustomer.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Customer ID</p>
                <p className="font-medium">{selectedCustomer.id}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="font-medium">{selectedCustomer.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Phone Number</p>
                <p className="font-medium">{selectedCustomer.phone}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Company</p>
                <p className="font-medium">{selectedCustomer.company}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Subscriptions</p>
                <p className="font-medium">
                  {selectedCustomer.subscriptions}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Account Status</p>
                <p className="font-semibold">{selectedCustomer.status}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
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

export default Customers
