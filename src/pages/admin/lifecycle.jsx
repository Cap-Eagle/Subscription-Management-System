
import { useState } from 'react'

const initialSubscriptions = [
  {
    id: 'SUB-1001',
    customer: 'Alex Johnson',
    product: 'Premium Software',
    plan: 'Monthly',
    amount: 999,
    nextBilling: '2026-11-15',
    status: 'Active',
  },
  {
    id: 'SUB-1002',
    customer: 'Sarah Williams',
    product: 'Cloud Storage',
    plan: 'Yearly',
    amount: 4999,
    nextBilling: '2027-09-15',
    status: 'Active',
  },
  {
    id: 'SUB-1003',
    customer: 'David Thomas',
    product: 'Business Suite',
    plan: 'Monthly',
    amount: 1499,
    nextBilling: '2026-11-10',
    status: 'Paused',
  },
]

function Lifecycle() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const openAction = (subscription, actionName) => {
    setSelectedSubscription(subscription)
    setAction(actionName)
    setReason('')
    setMessage('')
  }

  const closeModal = () => {
    setSelectedSubscription(null)
    setAction('')
    setReason('')
  }

  const handleAction = (e) => {
    e.preventDefault()

    if (!selectedSubscription) return

    if (['Pause', 'Early Close'].includes(action) && !reason.trim()) {
      setMessage('Please enter a reason for this action.')
      return
    }

    const newStatus = {
      Pause: 'Paused',
      Resume: 'Active',
      Renew: 'Active',
      'Early Close': 'Closed',
    }[action]

    setSubscriptions((previous) =>
      previous.map((sub) =>
        sub.id === selectedSubscription.id
          ? {
              ...sub,
              status: newStatus,
              nextBilling:
                action === 'Renew'
                  ? new Date(
                      new Date(sub.nextBilling).setMonth(
                        new Date(sub.nextBilling).getMonth() + 1
                      )
                    ).toISOString().slice(0, 10)
                  : sub.nextBilling,
            }
          : sub
      )
    )

    setMessage(`${action} action completed successfully.`)

    setTimeout(() => {
      closeModal()
    }, 900)
  }

  const statusStyle = (status) => {
    if (status === 'Active') return 'bg-green-100 text-green-700'
    if (status === 'Paused') return 'bg-orange-100 text-orange-700'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-purple-600">
          ADMIN WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Subscription Lifecycle
        </h1>

        <p className="mt-2 text-slate-500">
          Manage subscription pauses, renewals and closures.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        {[
          {
            title: 'Active',
            value: subscriptions.filter((s) => s.status === 'Active').length,
            color: 'text-green-600',
          },
          {
            title: 'Paused',
            value: subscriptions.filter((s) => s.status === 'Paused').length,
            color: 'text-orange-500',
          },
          {
            title: 'Closed',
            value: subscriptions.filter((s) => s.status === 'Closed').length,
            color: 'text-slate-600',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.title} Subscriptions</p>
            <h2 className={`mt-2 text-2xl font-bold ${item.color}`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Subscription Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Manage Subscriptions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select an action for each subscription.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Subscription</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Next Billing</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold">{sub.id}</td>
                  <td className="p-4">{sub.customer}</td>
                  <td className="p-4">{sub.product}</td>
                  <td className="p-4">{sub.plan}</td>
                  <td className="p-4">{sub.nextBilling}</td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {sub.status === 'Active' && (
                        <button
                          onClick={() => openAction(sub, 'Pause')}
                          className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
                        >
                          Pause
                        </button>
                      )}

                      {sub.status === 'Paused' && (
                        <button
                          onClick={() => openAction(sub, 'Resume')}
                          className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700"
                        >
                          Resume
                        </button>
                      )}

                      {sub.status !== 'Closed' && (
                        <>
                          <button
                            onClick={() => openAction(sub, 'Renew')}
                            className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700"
                          >
                            Renew
                          </button>

                          <button
                            onClick={() => openAction(sub, 'Early Close')}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                          >
                            Early Close
                          </button>
                        </>
                      )}

                      {sub.status === 'Closed' && (
                        <span className="text-xs text-slate-400">
                          No actions available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleAction}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-900">
              {action} Subscription
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {selectedSubscription.id} — {selectedSubscription.customer}
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Current Status</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedSubscription.status}
              </p>
            </div>

            {['Pause', 'Early Close'].includes(action) && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason for {action}
                </label>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Enter the reason..."
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>
            )}

            {action === 'Renew' && (
              <p className="mt-5 text-sm text-slate-600">
                Confirm that you want to renew this subscription.
              </p>
            )}

            {action === 'Resume' && (
              <p className="mt-5 text-sm text-slate-600">
                Confirm that you want to resume this paused subscription.
              </p>
            )}

            {message && (
              <p className={`mt-4 text-sm ${
                message.includes('successfully')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {message}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-5 py-3 text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Confirm {action}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Lifecycle
