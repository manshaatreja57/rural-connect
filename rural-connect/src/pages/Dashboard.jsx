import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const pieColors = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7']

const Dashboard = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    api
      .get('/api/stats')
      .then(({ data }) => {
        if (!mounted) return
        setStatsData(data)
      })
      .catch((err) => {
        if (!mounted) return
        console.error('Failed to load stats', err)
        setError('Unable to load dashboard data. Please try again later.')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const stats = statsData
    ? [
        { label: t('dashboard.stats.totalJobs'), value: statsData.totalJobs || 0, icon: '📋', color: 'from-rural-green-500 to-rural-green-600' },
        { label: t('dashboard.stats.totalWorkers'), value: statsData.totalWorkers || 0, icon: '👷', color: 'from-emerald-500 to-emerald-600' },
        { label: t('dashboard.stats.activeJobs'), value: statsData.activeJobs || 0, icon: '💼', color: 'from-sky-blue-500 to-sky-blue-600' },
        { label: t('dashboard.stats.completedJobs'), value: statsData.completedJobs || 0, icon: '✅', color: 'from-amber-500 to-amber-600' },
        { label: t('dashboard.stats.totalUsers'), value: statsData.totalUsers || 0, icon: '👥', color: 'from-purple-500 to-purple-600' },
      ]
    : []

  const skillGapsData = statsData?.skillGaps || []
  const workerDistributionData = (statsData?.workerDistribution || []).map((d) => ({ ...d, color: '#22c55e' }))
  const jobsBySkillData = (statsData?.jobsBySkill || []).map((item) => ({ name: item.skill || 'Other', count: item.count }))
  const usersByRoleData = statsData?.usersByRole || []
  const activityData = statsData?.activityMetrics || []
  const recentActivity = statsData?.recentJobs || []

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>
  )

  const formatDate = (value) => {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-earthy-beige-50 py-8">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-earthy-beige-50 py-8">
        <div className="container mx-auto px-4">
          <div className="card text-center py-12">
            <p className="text-lg font-semibold text-red-500 mb-4">{error}</p>
            <p className="text-gray-600">Please refresh the page to try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 py-8">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl font-bold text-gray-800 mb-8"
        >
          {t('dashboard.title')}
        </motion.h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`card bg-gradient-to-br ${stat.color} text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="text-5xl opacity-80">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Skill Gaps */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
              {t('dashboard.charts.skillGaps')}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillGapsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="carpenters" fill="#22c55e" />
                <Bar dataKey="plumbers" fill="#0ea5e9" />
                <Bar dataKey="tailors" fill="#ec4899" />
                <Bar dataKey="farmers" fill="#84cc16" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Worker Distribution */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
              {t('dashboard.charts.workerDistribution')}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workerDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {workerDistributionData.map((entry, index) => (
                    <Cell key={`worker-cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jobs by Skill */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">Jobs by Skill</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobsBySkillData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Users by Role */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">Users by Role</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersByRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="count"
                >
                  {usersByRoleData.map((entry, index) => (
                    <Cell key={`role-cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Activity Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
            {t('dashboard.charts.activityMetrics')}
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="jobs" stroke="#22c55e" strokeWidth={3} name="Jobs Posted" />
              <Line type="monotone" dataKey="workers" stroke="#0ea5e9" strokeWidth={3} name="Workers Joined" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent jobs found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((job) => (
                <li key={job._id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{job.skill || 'General Job'}</p>
                    <p className="text-sm text-gray-500">
                      {job.location || 'Unknown location'} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {job.status || 'pending'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
