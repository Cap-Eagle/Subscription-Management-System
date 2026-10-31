
import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    // Frontend prototype: actual reset email is sent by the backend.
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <Link
          to="/"
          className="text-sm font-semibold text-purple-600 hover:text-purple-800"
        >
          ← Back to Login
        </Link>

        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-700">
            B
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your registered email address. If your account is eligible,
            you'll receive instructions to reset your password.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Send Reset Instructions
            </button>

          </form>
        ) : (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
            <h2 className="font-semibold text-green-800">
              Request submitted
            </h2>

            <p className="mt-2 text-sm text-green-700">
              If an account exists for this email, password reset instructions
              will be sent.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/" className="font-semibold text-purple-600">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default ForgotPassword
