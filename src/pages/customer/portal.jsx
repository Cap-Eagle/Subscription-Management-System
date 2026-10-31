import { useState } from 'react'

const subscriptions = [
  {
    id: 'SUB-1001',
    product: 'Premium Software',
    plan: 'Monthly',
    amount: 999,
    nextBilling: '15 Nov 2026',
    status: 'Active',
  },
  {
    id: 'SUB-1002',
    product: 'Cloud Storage',
    plan: 'Yearly',
    amount: 4999,
    nextBilling: '20 Dec 2026',
    status: 'Active',
  },
]

const invoices = [
  {
    id: 'INV-1001',
    date: '15 Oct 2026',
    amount: 999,
    status: 'Paid',
  },
  {
    id: 'INV-1002',
    date: '20 Oct 2026',
    amount: 4999,
    status: 'Pending',
  },
]

function Portal() {
  const [activeTab, setActiveTab] = useState('Overview')

  const tabs = ['Overview', 'My Subscriptions', 'My Invoices']

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-purple-600">
              BRIGHTLOOP CUSTOMER PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back, Alex!
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your subscriptions and billing in one place.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
            A
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Active Subscriptions</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              2
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Total Invoices</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              2
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Pending Payments</p>
            <h2 className="mt-3 text-3xl font-bold text-orange-500">
              ₹4,999
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Recent Subscriptions
            </h2>

            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {sub.product}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {sub.id} · {sub.plan}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    ₹{sub.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-green-600">{sub.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscriptions */}
        {activeTab === 'My Subscriptions' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                My Subscriptions
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Next Billing</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-t border-slate-100">
                      <td className="p-4 font-medium">{sub.id}</td>
                      <td className="p-4">{sub.product}</td>
                      <td className="p-4">{sub.plan}</td>
                      <td className="p-4">
                        ₹{sub.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">{sub.nextBilling}</td>
                      <td className="p-4 text-green-600">{sub.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'My Invoices' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                My Invoices
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-100">
                      <td className="p-4 font-medium">{invoice.id}</td>
                      <td className="p-4">{invoice.date}</td>
                      <td className="p-4">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </td>
                      <td className={`p-4 font-medium ${
                        invoice.status === 'Paid'
                          ? 'text-green-600'
                          : 'text-orange-500'
                      }`}>
                        {invoice.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Portal