import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

const PENDING_EMAIL_KEY = 'rc_pending_email'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState(() => localStorage.getItem(PENDING_EMAIL_KEY) || '')

  useEffect(() => {
    const token = localStorage.getItem('rc_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('rc_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('rc_token', data.token)
      localStorage.removeItem(PENDING_EMAIL_KEY)
      setPendingEmail('')
      setUser(data.user)
      return data
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        localStorage.setItem(PENDING_EMAIL_KEY, email)
        setPendingEmail(email)
      }
      throw error
    }
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    localStorage.setItem(PENDING_EMAIL_KEY, payload.email)
    setPendingEmail(payload.email)
    return data
  }

  const verifyOtp = async ({ email, otp }) => {
    const { data } = await api.post('/api/auth/verify-otp', { email, otp })
    localStorage.setItem('rc_token', data.token)
    localStorage.removeItem(PENDING_EMAIL_KEY)
    setPendingEmail('')
    setUser(data.user)
    return data
  }

  const resendOtp = async (email) => {
    const { data } = await api.post('/api/auth/resend-otp', { email })
    localStorage.setItem(PENDING_EMAIL_KEY, email)
    setPendingEmail(email)
    return data
  }

  const logout = () => {
    localStorage.removeItem('rc_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyOtp,
        resendOtp,
        pendingEmail,
        setPendingEmail: (email) => {
          if (email) {
            localStorage.setItem(PENDING_EMAIL_KEY, email)
          } else {
            localStorage.removeItem(PENDING_EMAIL_KEY)
          }
          setPendingEmail(email)
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


