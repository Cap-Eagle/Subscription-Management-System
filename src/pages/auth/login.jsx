
import { useState } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const handleLogin = (event) => {
    event.preventDefault()

    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length <= 8) {
      newErrors.password = 'Password must contain more than 8 characters.'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Include at least one uppercase letter.'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Include at least one lowercase letter.'
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'Include at least one special character.'
    }

    setErrors(newErrors)
    setMessage('')

    if (Object.keys(newErrors).length === 0) {
      setMessage('Validation successful! Backend authentication will be connected next.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Branding section */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-3xl font-bold">
                B
              </div>
              <span className="text-3xl font-bold">Brightloop</span>
            </div>

            <div className="mt-28">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
                Subscription Management
              </p>

              <h1 className="text-4xl font-bold leading-tight">
                Manage your business subscriptions with confidence.
              </h1>

              <p className="mt-8 max-w-sm text-lg leading-8 text-indigo-100">
                One platform to manage customers, subscriptions, invoices,
                and payments.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            <p className="text-sm leading-7 text-indigo-100">
              "Everything your subscription business needs, organized in one place."
            </p>
            <p className="mt-5 font-semibold">Brightloop Platform</p>
          </div>
        </div>

        {/* Login section */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-14 lg:px-16">
          <div className="mb-10 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white">
                B
              </div>
              <span className="text-2xl font-bold text-slate-900">
                Brightloop
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Welcome back
            </p>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-4 text-sm text-slate-500">
              Enter your details to access your workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-12 space-y-7" noValidate>

            {/* Email */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((prev) => ({ ...prev, email: '' }))
                  setMessage('')
                }}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <Link
                 to="/forgot-password"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                    Forgot password?
                </Link>
                
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: '' }))
                    setMessage('')
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 pr-20 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Sign In
            </button>

            {message && (
              <p className="rounded-xl bg-indigo-50 p-4 text-center text-sm text-indigo-700">
                {message}
              </p>
            )}
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <span className="font-bold text-indigo-600">
              Contact your administrator
            </span>
          </div>

          <p className="mt-16 text-center text-xs text-slate-400">
            © 2026 Brightloop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login