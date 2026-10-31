
const stats = [
  {
    title: 'Total Customers',
    value: '128',
    description: 'Customers in the system',
  },
  {
    title: 'Active Subscriptions',
    value: '86',
    description: 'Currently active',
  },
  {
    title: 'Pending Invoices',
    value: '12',
    description: 'Awaiting payment',
  },
]

const activities = [
  {
    id: 'SUB-1024',
    customer: 'Alex Johnson',
    activity: 'New subscription',
    date: '31 Oct 2026',
    status: 'Active',
  },
  {
    id: 'INV-1042',
    customer: 'Sarah Williams',
    activity: 'Invoice generated',
    date: '30 Oct 2026',
    status: 'Pending',
  },
  {
    id: 'INV-1041',
    customer: 'David Thomas',
    activity: 'Payment received',
    date: '29 Oct 2026',
    status: 'Paid',
  },
]

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-600">
            BRIGHTLOOP STAFF WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Staff Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor customer activity and manage daily operations.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <p className="text-sm text-slate-500">{stat.title}</p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest customer and billing updates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Activity</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-4 font-medium text-slate-800">
                      {item.id}
                    </td>

                    <td className="p-4">{item.customer}</td>

                    <td className="p-4">{item.activity}</td>

                    <td className="p-4">{item.date}</td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === 'Active' || item.status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
