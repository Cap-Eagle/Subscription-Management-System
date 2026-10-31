
import { NavLink, Outlet } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', path: '/staff', icon: '▦', end: true },
  { name: 'Customers', path: '/staff/customers', icon: '♙' },
  { name: 'Subscriptions', path: '/staff/subscriptions', icon: '↻' },
  { name: 'Invoices', path: '/staff/invoices', icon: '▤' },
]

function StaffLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white">
            B
          </div>

          <span className="text-xl font-bold text-slate-900">
            Brightloop
          </span>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400">
            STAFF MENU
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-200 p-5">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="mt-1 font-semibold text-slate-800">Staff Member</p>
          <p className="text-xs text-slate-500">staff@brightloop.com</p>
        </div>

      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1">

        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Brightloop Workspace
            </h2>
            <p className="text-sm text-slate-500">
              Staff Management Portal
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
            S
          </div>
        </header>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default StaffLayout
