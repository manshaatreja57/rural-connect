import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/search', label: t('nav.search') },
    { path: '/post-job', label: t('nav.postJob') },
    { path: '/messages', label: t('nav.chat') },
    { path: '/dashboard', label: t('nav.dashboard') },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-rural-green-500 to-sky-blue-500 rounded-lg flex items-center justify-center"
          >
            <span className="text-white font-heading font-bold text-xl">R</span>
          </motion.div>
          <span className="font-heading text-xl font-bold text-rural-green-600">
            Rural Connect
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-rural-green-600 font-semibold' : 'text-gray-600 hover:text-rural-green-500'
                  }`}
                >
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-rural-green-500 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center space-x-4">
          <LanguageToggle />
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-semibold">{user.name}</span>
              <button className="btn-secondary" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  )
}

export default Header

