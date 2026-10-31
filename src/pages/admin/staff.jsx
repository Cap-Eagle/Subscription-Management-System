
import { useState } from 'react'

const initialStaff = [
  {
    id: 1,
    name: 'Akhil Kumar',
    email: 'akhil@brightloop.com',
    phone: '9876543210',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Neha Sharma',
    email: 'neha@brightloop.com',
    phone: '9876543211',
    role: 'Billing Staff',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Vishnu Raj',
    email: 'vishnu@brightloop.com',
    phone: '9876543212',
    role: 'Support Staff',
    status: 'Inactive',
  },
]

function Staff() {
  const [staff, setStaff] = useState(initialStaff)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Billing Staff',
  }

  const [form, setForm] = useState(emptyForm)

  const filteredStaff = staff.filter((member) =>
    `${member.name} ${member.email} ${member.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (member) => {
    setEditingId(member.id)
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedEmail = form.email.trim().toLowerCase()

    const emailExists = staff.some(
      (member) =>
        member.email.toLowerCase() === normalizedEmail &&
        member.id !== editingId
    )

    if (emailExists) {
      setError('A staff member with this email already exists.')
      return
    }

    const updatedStaff = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      email: normalizedEmail,
      phone: form.phone.trim(),
      role: form.role,
      status: editingId
        ? staff.find((member) => member.id === editingId).status
        : 'Active',
    }

    if (editingId) {
      setStaff((previous) =>
        previous.map((member) =>
          member.id === editingId ? updatedStaff : member
        )
      )
    } else {
      setStaff((previous) => [...previous, updatedStaff])
    }

    setShowForm(false)
    setError('')
  }

  const toggleStatus = (id) => {
    setStaff((previous) =>
      previous.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === 'Active' ? 'Inactive' : 'Active',
            }
          : member
      )
    )
  }

  const deleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff account?')) {
      setStaff((previous) =>
        previous.filter((member) => member.id !== id)
      )
    }
  }

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Staff Management
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage your team members and their account information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Staff
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Staff</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {staff.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Active Staff</p>
          <h3 className="mt-3 text-3xl font-bold text-emerald-600">
            {staff.filter((member) => member.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Inactive Staff</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-500">
            {staff.filter((member) => member.status === 'Inactive').length}
          </h3>
        </div>
      </div>

      {/* Staff table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">
            All Staff Members
          </h3>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {member.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {member.email}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {member.phone}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {member.role}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      member.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openEditForm(member)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(member.id)}
                        className="font-semibold text-amber-600 hover:text-amber-800"
                      >
                        {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteStaff(member.id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No staff members found.
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
                {editingId ? 'Edit Staff Member' : 'Add New Staff'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the staff account details.
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
                placeholder="staff@brightloop.com"
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
                Staff Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option>Manager</option>
                <option>Billing Staff</option>
                <option>Support Staff</option>
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
                {editingId ? 'Save Changes' : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Staff
