import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const JobPosting = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    skill: '',
    location: '',
    date: '',
    time: '',
    description: '',
    budget: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const skills = ['Carpenter', 'Plumber', 'Tailor', 'Farmer', 'Mason', 'Electrician']

  const steps = [
    { number: 1, title: t('jobPosting.step1') },
    { number: 2, title: t('jobPosting.step2') },
    { number: 3, title: t('jobPosting.step3') },
    { number: 4, title: t('jobPosting.step4') },
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.skill || !formData.location || !formData.date) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/jobs', {
        skill: formData.skill,
        village: formData.location,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        budget: formData.budget
      })

      if (response.data.success || response.data.job) {
        setShowSuccess(true)
        setTimeout(() => {
          navigate('/search')
        }, 2000)
      } else {
        setError('Failed to post job. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error posting job:', err)
      setError(err.response?.data?.message || 'Failed to post job. Please try again.')
      setLoading(false)
    }
  }

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
            { headers: { 'Accept': 'application/json' } }
          )
          const data = await response.json()
          const locality =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            ''
          if (locality) {
            setFormData((prev) => ({ ...prev, location: locality }))
          }
        } catch (error) {
          console.error('Unable to fetch live location', error)
        } finally {
          setIsLocating(false)
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-earthy-beige-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-6"
          >
            ✅
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-heading text-4xl font-bold text-rural-green-600 mb-4"
          >
            {t('jobPosting.success')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Redirecting to search page...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl font-bold text-center text-gray-800 mb-8"
        >
          {t('jobPosting.title')}
        </motion.h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      currentStep >= step.number
                        ? 'bg-rural-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </motion.div>
                  <span className="mt-2 text-sm font-semibold text-gray-700 hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-rural-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="card min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                  {t('jobPosting.step1')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <motion.button
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, skill })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.skill === skill
                          ? 'border-rural-green-500 bg-rural-green-50 text-rural-green-700'
                          : 'border-gray-200 hover:border-rural-green-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {skill === 'Carpenter' && '🔨'}
                        {skill === 'Plumber' && '🔧'}
                        {skill === 'Tailor' && '✂️'}
                        {skill === 'Farmer' && '🌾'}
                        {skill === 'Mason' && '🧱'}
                        {skill === 'Electrician' && '⚡'}
                      </div>
                      <div className="font-semibold">{skill}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                  {t('jobPosting.step2')}
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('search.filters.location')}
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter village / town / city"
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={handleUseLiveLocation}
                      disabled={isLocating}
                      className="btn-secondary text-sm w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLocating ? 'Detecting…' : 'Use Live Location'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                  {t('jobPosting.step3')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="input-field"
                    placeholder="Describe your job requirements..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="input-field"
                    placeholder="Enter your budget"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <h2 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                  {t('jobPosting.step4')}
                </h2>
                <div className="bg-earthy-beige-100 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skill:</span>
                    <span className="font-semibold">{formData.skill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold">{formData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">₹{formData.budget}</span>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-gray-600 block mb-2">Description:</span>
                      <p className="text-gray-800">{formData.description}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('jobPosting.previous')}
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.skill) ||
                  (currentStep === 2 && !formData.location) ||
                  (currentStep === 3 && (!formData.date || !formData.time))
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('jobPosting.next')}
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary">
                {t('jobPosting.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobPosting





