import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(email, password)
      nav('/dashboard')
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0]?.message || 'Invalid credentials')
      } else {
        setError('Invalid credentials')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const google = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="font-heading text-3xl font-bold">Login</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <input
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        <button type="button" className="btn-secondary w-full" onClick={google}>
          Sign in with Google
        </button>
      </form>
    </div>
  )
}

export default Login
