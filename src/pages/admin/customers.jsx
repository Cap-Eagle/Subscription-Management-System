
import { useState } from 'react'

const initialCustomers = [
  {
    id: 1,
    name: 'Rahul Menon',
    email: 'rahul@example.com',
    phone: '9876543210',
    company: 'Tech Solutions',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    phone: '9876543211',
    company: 'Digital Works',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Arjun Nair',
    email: 'arjun@example.com',
    phone: '9876543212',
    company: 'Nair Technologies',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Meera Krishnan',
    email: 'meera@example.com',
    phone: '9876543213',
    company: 'Creative Labs',
    status: 'Active',
  },
]

function Customers() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
  }

  const [form, setForm] = useState(emptyForm)

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.company}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (customer) => {
    setEditingId(customer.id)
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedEmail = form.email.trim().toLowerCase()

    const emailExists = customers.some(
      (customer) =>
        customer.email.toLowerCase() === normalizedEmail &&
        customer.id !== editingId
    )

    if (emailExists) {
      setError('A customer with this email already exists.')
      return
    }

    const updatedCustomer = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      email: normalizedEmail,
      phone: form.phone.trim(),
      company: form.company.trim(),
      status: editingId
        ? customers.find((c) => c.id === editingId).status
        : 'Active',
    }

    if (editingId) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingId ? updatedCustomer : customer
        )
      )
    } else {
      setCustomers((previous) => [...previous, updatedCustomer])
    }

    setShowForm(false)
    setError('')
  }

  const deleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers((previous) =>
        previous.filter((customer) => customer.id !== id)
      )
    }
  }

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Customers
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage customer information and account details.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Customers</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {customers.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Active Customers</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {customers.filter((c) => c.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Inactive Customers</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-500">
            {customers.filter((c) => c.status === 'Inactive').length}
          </h3>
        </div>
      </div>

      {/* Customer table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">
            All Customers
          </h3>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">

                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {customer.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {customer.email}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {customer.phone}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {customer.company || '—'}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      customer.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(customer)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No customers found.
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
            className="my-8 w-full max-w-lg space-y-5 rounded-2xl bg-white p-7 shadow-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the customer information below.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value })
                  setError('')
                }}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                required
                pattern="[0-9+ -]{7,15}"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Company Name
              </label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Enter company name (optional)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
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
                {editingId ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Customers
