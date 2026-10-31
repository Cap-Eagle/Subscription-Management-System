
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/auth/login.jsx'
import AdminLayout from './layouts/adminlayout.jsx'
import Products from './pages/admin/products.jsx'
import Plans from './pages/admin/plans.jsx'
import Customers from './pages/admin/customers.jsx'
import Subscriptions from './pages/admin/subscriptions.jsx'
import Invoices from './pages/admin/invoices.jsx'
import Staff from './pages/admin/staff.jsx'
import Portal from './pages/customer/portal.jsx'
import StaffDashboard from './pages/staff/dashboard.jsx'
import StaffLayout from './layouts/stafflayout.jsx'
import StaffCustomers from './pages/staff/customers.jsx'
import StaffSubscriptions from './pages/staff/subscriptions.jsx'
import StaffInvoices from './pages/staff/invoices.jsx'
import Discounts from './pages/admin/discounts.jsx'
import Quotations from './pages/admin/quotations.jsx'
import Lifecycle from './pages/admin/lifecycle.jsx'
import ForgotPassword from './pages/auth/forgotpassword.jsx'

function AdminHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        Admin Dashboard
      </h2>
      <p className="mt-2 text-slate-500">
        Welcome to your Brightloop workspace.
      </p>
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-500">
        This section is under development.
      </p>
    </div>
  )
}

function StaffPage() {
  return <h1 className="p-10 text-3xl font-bold">Staff Dashboard</h1>
}

function CustomerPage() {
  return <h1 className="p-10 text-3xl font-bold">Customer Portal</h1>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="products" element={<Products />} />
        <Route path="plans" element={<Plans />} />
        <Route path="customers" element={<Customers />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="lifecycle" element={<Lifecycle />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="staff" element={<Staff />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="quotations" element={<Quotations />} />
      </Route>

      <Route path="/staff" element={<StaffLayout />}>
  <Route index element={<StaffDashboard />} />
  <Route path="customers" element={<StaffCustomers />} />
  <Route path="subscriptions" element={<StaffSubscriptions />} />
  <Route path="invoices" element={<StaffInvoices />} />
</Route>
      <Route path="/customer" element={<Portal />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
