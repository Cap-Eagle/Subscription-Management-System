
import { useState } from 'react'

const initialTemplates = [
  {
    id: 'QT-001',
    name: 'Standard Subscription Quote',
    description: 'Default quotation for subscription services.',
    validity: 15,
    terms: 'Payment must be completed before the subscription begins.',
    status: 'Active',
  },
  {
    id: 'QT-002',
    name: 'Premium Service Quote',
    description: 'Quotation template for premium services.',
    validity: 30,
    terms: 'Premium services are subject to the agreed service conditions.',
    status: 'Active',
  },
  {
    id: 'QT-003',
    name: 'Annual Subscription Quote',
    description: 'Quotation for yearly subscription plans.',
    validity: 7,
    terms: 'Annual subscription fees must be paid before activation.',
    status: 'Inactive',
  },
]

const emptyForm = {
  name: '',
  description: '',
  validity: '15',
  terms: '',
}

function Quotations() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.id.toLowerCase().includes(search.toLowerCase())
  )

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (template) => {
    setEditingId(template.id)
    setForm({
      name: template.name,
      description: template.description,
      validity: String(template.validity),
      terms: template.terms,
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.validity ||
      !form.terms.trim()
    ) {
      setError('Please complete all fields.')
      return
    }

    const validity = Number(form.validity)

    if (!Number.isInteger(validity) || validity <= 0) {
      setError('Validity must be a positive whole number of days.')
      return
    }

    const templateData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      terms: form.terms.trim(),
      validity,
    }

    if (editingId) {
      setTemplates((previous) =>
        previous.map((template) =>
          template.id === editingId
            ? { ...template, ...templateData }
            : template
        )
      )
    } else {
      setTemplates((previous) => [
        ...previous,
        {
          id: `QT-${String(Date.now()).slice(-5)}`,
          ...templateData,
          status: 'Active',
        },
      ])
    }

    setShowForm(false)
    setForm(emptyForm)
    setError('')
  }

  const deleteTemplate = (id) => {
    if (window.confirm('Delete this quotation template?')) {
      setTemplates((previous) =>
        previous.filter((template) => template.id !== id)
      )
    }
  }

  const toggleStatus = (id) => {
    setTemplates((previous) =>
      previous.map((template) =>
        template.id === id
          ? {
              ...template,
              status: template.status === 'Active' ? 'Inactive' : 'Active',
            }
          : template
      )
    )
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
            Quotation Templates
          </h1>

          <p className="mt-2 text-slate-500">
            Create reusable quotation templates for customers.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
        >
          + Create Template
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Templates</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {templates.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Templates</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {templates.filter((t) => t.status === 'Active').length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactive Templates</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-500">
            {templates.filter((t) => t.status === 'Inactive').length}
          </h2>
        </div>
      </div>

      {/* Template Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Saved Templates
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage quotation formats and validity periods.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Template</th>
                <th className="p-4">Description</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {template.name}
                    </p>
                    <p className="text-xs text-slate-500">{template.id}</p>
                  </td>

                  <td className="max-w-xs p-4 text-slate-600">
                    {template.description}
                  </td>

                  <td className="p-4">{template.validity} days</td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      template.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {template.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="font-medium text-slate-600 hover:text-slate-900"
                      >
                        View
                      </button>

                      <button
                        onClick={() => openEditForm(template)}
                        className="font-medium text-purple-600 hover:text-purple-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(template.id)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {template.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No quotation templates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-6 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Template' : 'Create Template'}
              </h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Template Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Standard Subscription Quote"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe this quotation template..."
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Validity Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.validity}
                  onChange={(e) => updateField('validity', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Number of days the quotation remains valid.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Terms and Conditions
                </label>
                <textarea
                  value={form.terms}
                  onChange={(e) => updateField('terms', e.target.value)}
                  placeholder="Enter quotation terms and conditions..."
                  rows="4"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
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
                {editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Template Details
              </h2>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-xl text-slate-400"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              {selectedTemplate.name}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {selectedTemplate.description}
            </p>

            <div className="mt-5">
              <p className="text-sm text-slate-500">Validity</p>
              <p className="font-medium">{selectedTemplate.validity} days</p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-500">Terms and Conditions</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {selectedTemplate.terms}
              </p>
            </div>

            <button
              onClick={() => setSelectedTemplate(null)}
              className="mt-7 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quotations
