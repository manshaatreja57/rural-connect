import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'

const WorkerProfile = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('about')
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.get(`/api/workers/${id}`).then(({ data }) => {
      if (!mounted) return
      const address = `${data.address?.area || ''}, ${data.address?.street || ''}, ${data.address?.city || ''}, ${data.address?.state || ''}`
        .replaceAll(', ,', ',')
        .replace(/^, |, $/g, '')
      setWorker({
        id: data._id,
        name: data.name,
        skill: data.skill,
        location: address,
        rating: data.rating || 0,
        reviews: 0,
        image: '👷',
        experience: data.experience || '',
        about: '',
        availability: true,
        phone: '',
        email: data.email || '',
        reviewList: [],
      })
    }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [id])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-earthy-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rural-green-500"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-earthy-beige-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Worker not found</p>
          <Link to="/search" className="text-rural-green-600 hover:underline mt-4 inline-block">
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-8xl bg-gradient-to-br from-rural-green-400 to-sky-blue-400 rounded-full w-32 h-32 flex items-center justify-center shadow-lg"
            >
              {worker.image}
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading text-3xl font-bold text-gray-800 mb-2">
                {worker.name}
              </h1>
              <p className="text-rural-green-600 font-semibold text-lg mb-4">{worker.skill}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(worker.rating)}
                  <span className="ml-2 font-semibold text-gray-800">{worker.rating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{worker.reviews} {t('profile.reviews')}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{worker.experience}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    worker.availability
                      ? 'bg-rural-green-100 text-rural-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {worker.availability ? t('profile.available') : t('profile.notAvailable')}
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                className="btn-primary text-center"
                onClick={() => navigate(`/messages/${worker.id}`)}
              >
                {t('profile.contact')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {['about', 'reviews', 'availability'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === tab
                  ? 'text-rural-green-600'
                  : 'text-gray-600 hover:text-rural-green-500'
              }`}
            >
              {t(`profile.${tab}`)}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rural-green-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                {t('profile.about')}
              </h2>
              <p className="text-gray-700 leading-relaxed">{worker.about}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600">{t('profile.location')}</span>
                  <p className="font-semibold text-gray-800">{worker.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">{t('profile.experience')}</span>
                  <p className="font-semibold text-gray-800">{worker.experience}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="font-semibold text-gray-800">{worker.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-semibold text-gray-800">{worker.email}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                {t('profile.reviews')} ({worker.reviewList.length})
              </h2>
              <div className="space-y-4">
                {worker.reviewList.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-earthy-beige-50 rounded-xl p-4 border-l-4 border-rural-green-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-rural-green-200 rounded-full flex items-center justify-center font-semibold">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{review.name}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                {t('profile.availability')}
              </h2>
              <div className="bg-earthy-beige-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-800">Current Status</span>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${
                      worker.availability
                        ? 'bg-rural-green-100 text-rural-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {worker.availability ? t('profile.available') : t('profile.notAvailable')}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Monday - Friday</span>
                    <span className="font-semibold text-rural-green-600">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Saturday</span>
                    <span className="font-semibold text-rural-green-600">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Sunday</span>
                    <span className="font-semibold text-gray-500">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default WorkerProfile


