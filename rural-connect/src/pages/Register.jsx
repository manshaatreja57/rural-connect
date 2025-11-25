import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employer'
  })

  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setGeneralError('')
    setErrors({})

    try {
      await register(form)

      // ⭐ No OTP – directly redirect to login
      nav('/login')

    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrs = {}
        error.response.data.errors.forEach((err) => {
          if (err.field) fieldErrs[err.field] = err.message
        })
        setErrors(fieldErrs)
        setGeneralError(
          error.response.data.errors[0]?.message ||
            'Please check the highlighted fields.'
        )
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="font-heading text-3xl font-bold">Sign Up</h1>

        {generalError && (
          <div className="text-red-600 text-sm">{generalError}</div>
        )}

        <div>
          <input
            className="input-field"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
          />
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <select
            className="input-field"
            value={form.role}
            onChange={(e) => setField('role', e.target.value)}
          >
            <option value="employer">Employer</option>
            <option value="worker">Worker</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-600 mt-1">{errors.role}</p>
          )}
        </div>

        <button
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default Register
