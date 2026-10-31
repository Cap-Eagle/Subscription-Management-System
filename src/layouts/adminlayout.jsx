
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', path: '/admin', icon: '▦' },
  { name: 'Products', path: '/admin/products', icon: '▣' },
  { name: 'Plans', path: '/admin/plans', icon: '◷' },
  { name: 'Customers', path: '/admin/customers', icon: '♙' },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: '↻' },
  { name: 'Subscription Lifecycle', path: '/admin/lifecycle' },
  { name: 'Invoices', path: '/admin/invoices', icon: '▤' },
  { name: 'Discounts', path: '/admin/discounts' },
  { name: 'Quotations', path: '/admin/quotations' },
  { name: 'Staff', path: '/admin/staff', icon: '♧' },
]

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">

      {/* Sidebar */}
      <aside className="w-full border-r border-slate-200 bg-white md:min-h-screen md:w-64">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            B
          </div>
          <span className="text-xl font-bold text-slate-900">
            Brightloop
          </span>
        </div>

        <div className="p-5">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-5">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="mt-1 font-semibold text-slate-800">Administrator</p>
          <p className="text-xs text-slate-500">admin@brightloop.com</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Brightloop Workspace
            </h1>
            <p className="text-xs text-slate-500">
              Subscription Management System
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
            A
          </div>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default AdminLayout
