import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../lib/api'

const Search = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [debouncedLocation, setDebouncedLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [resultType, setResultType] = useState('jobs')
  const [viewMode, setViewMode] = useState('list')
  const [workers, setWorkers] = useState([])
  const [filteredWorkers, setFilteredWorkers] = useState([])
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [workersLoading, setWorkersLoading] = useState(false)
  const navigate = useNavigate()

  const skills = ['Carpenter', 'Plumber', 'Tailor', 'Farmer', 'Mason', 'Electrician']

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedLocation(locationInput.trim()), 400)
    return () => clearTimeout(handler)
  }, [locationInput])

  useEffect(() => {
    if (resultType !== 'workers') return

    let mounted = true
    setWorkersLoading(true)
    const params = {}
    if (selectedSkill) params.skill = selectedSkill
    if (debouncedLocation) params.location = debouncedLocation

    api
      .get('/api/workers', { params })
      .then(({ data }) => {
        if (!mounted) return
        const mapped = data.map((w) => {
          const address = `${w.address?.area || ''}, ${w.address?.street || ''}, ${w.address?.city || ''}, ${w.address?.state || ''}`
            .replaceAll(', ,', ',')
            .replace(/^, |, $/g, '')
            .replace(/(^, )|(, $)/g, '')
          return {
            id: w._id,
            userId: w.userId,
            name: w.name,
            skill: w.skill,
            location: address || 'Location not specified',
            rating: w.rating || 0,
            reviews: 0,
            image: '👷',
            lat: 19.076,
            lng: 72.8777,
            experience: w.experience || '',
          }
        })
        setWorkers(mapped)
      })
      .catch((error) => {
        console.error('Failed to load workers', error)
        if (mounted) setWorkers([])
      })
      .finally(() => mounted && setWorkersLoading(false))

    return () => {
      mounted = false
    }
  }, [resultType, selectedSkill, debouncedLocation])

  useEffect(() => {
    if (resultType !== 'jobs') return

    let mounted = true
    setJobsLoading(true)
    const params = { status: 'pending' }
    if (selectedSkill) params.skill = selectedSkill
    if (debouncedLocation) params.location = debouncedLocation

    api
      .get('/api/jobs', { params })
      .then(({ data }) => {
        if (!mounted) return
        const mapped = data.map((job) => ({
          id: job._id,
          skill: job.skill,
          location: job.location || job.village || 'Location not specified',
          description: job.description || '',
          budget: job.budget,
          status: job.status || 'pending',
          date: job.date,
          time: job.time,
          createdAt: job.createdAt,
          postedBy: job.postedBy?.name || 'Anonymous',
          jobOwnerId: job.postedBy?._id || job.postedBy,
        }))
        setJobs(mapped)
      })
      .catch((error) => {
        console.error('Failed to load jobs', error)
        if (mounted) setJobs([])
      })
      .finally(() => mounted && setJobsLoading(false))

    return () => {
      mounted = false
    }
  }, [resultType, selectedSkill, debouncedLocation])

  useEffect(() => {
    let filtered = workers

    if (searchQuery) {
      filtered = filtered.filter(
        (worker) =>
          worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worker.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worker.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedSkill) {
      filtered = filtered.filter((worker) => worker.skill === selectedSkill)
    }

    if (debouncedLocation) {
      const locationValue = debouncedLocation.toLowerCase()
      filtered = filtered.filter((worker) => worker.location.toLowerCase().includes(locationValue))
    }

    setFilteredWorkers(filtered)
  }, [searchQuery, selectedSkill, debouncedLocation, workers])

  useEffect(() => {
    let filtered = jobs

    if (searchQuery) {
      const lowered = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.skill.toLowerCase().includes(lowered) ||
          job.location.toLowerCase().includes(lowered) ||
          job.description.toLowerCase().includes(lowered)
      )
    }

    if (selectedSkill) {
      filtered = filtered.filter((job) => job.skill === selectedSkill)
    }

    if (debouncedLocation) {
      const locationValue = debouncedLocation.toLowerCase()
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(locationValue))
    }

    setFilteredJobs(filtered)
  }, [searchQuery, selectedSkill, debouncedLocation, jobs])

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
            setLocationInput(locality)
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  const formatDate = (value) => {
    if (!value) return 'Date TBD'
    try {
      return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Date TBD'
    }
  }

  const getStatusStyles = (status) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-amber-100 text-amber-700'
    }
  }

  const isLoading = resultType === 'jobs' ? jobsLoading : workersLoading

  const handleWorkerCardClick = (workerId) => {
    navigate(`/messages/${workerId}`)
  }

  const handleJobCardClick = (jobOwnerId) => {
    if (!jobOwnerId) {
      console.warn('Job owner ID missing; cannot open chat.')
      return
    }
    navigate(`/messages/${jobOwnerId}`)
  }

  return (
    <div className="min-h-screen bg-earthy-beige-50 py-8">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl font-bold text-gray-800 mb-8 text-center"
        >
          {t('search.title')}
        </motion.h1>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder={t('search.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12 pr-4 py-4 text-lg"
              aria-label="Search workers"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
              🔍
            </span>
          </div>
        </motion.div>

        {/* Result Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-8 space-x-3"
        >
          <button
            onClick={() => {
              setResultType('jobs')
              setViewMode('list')
            }}
            className={`px-5 py-2 rounded-full font-semibold transition-colors ${
              resultType === 'jobs'
                ? 'bg-rural-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('search.mode.jobs')}
          </button>
          <button
            onClick={() => setResultType('workers')}
            className={`px-5 py-2 rounded-full font-semibold transition-colors ${
              resultType === 'workers'
                ? 'bg-rural-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('search.mode.workers')}
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('search.filters.skill')}
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="input-field"
              >
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('search.filters.location')}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
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
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSkill('')
                  setLocationInput('')
                }}
                className="btn-secondary w-full"
              >
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        {resultType === 'workers' && (
          <div className="flex justify-end mb-6 space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-rural-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('search.viewMode.list')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'map'
                  ? 'bg-rural-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('search.viewMode.map')}
            </button>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rural-green-500"></div>
            <p className="mt-4 text-gray-600">
              {resultType === 'jobs' ? t('search.loadingJobs') : t('search.loading')}
            </p>
          </div>
        ) : resultType === 'jobs' ? (
          <AnimatePresence mode="wait">
            {filteredJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 card"
              >
                <p className="text-gray-600 text-lg">{t('search.noJobs')}</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="card cursor-pointer focus:outline-none focus:ring-2 focus:ring-rural-green-500"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleJobCardClick(job.jobOwnerId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleJobCardClick(job.jobOwnerId)
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('search.labels.postedBy')} {job.postedBy}
                        </p>
                        <h3 className="font-heading text-xl font-bold text-gray-800">
                          {job.skill || 'General Job'}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(job.status)}`}>
                        {job.status || 'pending'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>{t('search.filters.location')}</span>
                        <span className="font-semibold text-gray-800 text-right">{job.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('search.labels.schedule')}</span>
                        <span className="font-semibold text-gray-800 text-right">
                          {formatDate(job.date || job.createdAt)}
                          {job.time ? ` · ${job.time}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('search.labels.budget')}</span>
                        <span className="font-semibold text-gray-800">
                          {job.budget ? `₹${job.budget}` : t('search.labels.notSpecified')}
                        </span>
                      </div>
                    </div>
                    {job.description && (
                      <p className="mt-4 text-gray-700 text-sm bg-earthy-beige-100 rounded-xl p-4">
                        {job.description}
                      </p>
                    )}
                    <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        {t('search.labels.postedOn')} {formatDate(job.createdAt)}
                      </span>
                      <span className="font-semibold text-rural-green-600">Click to message owner →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        ) : viewMode === 'list' ? (
          <AnimatePresence mode="wait">
            {filteredWorkers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 card"
              >
                <p className="text-gray-600 text-lg">{t('search.noResults')}</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkers.map((worker, index) => (
                  <motion.div
                    key={worker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="card cursor-pointer focus:outline-none focus:ring-2 focus:ring-rural-green-500"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleWorkerCardClick(worker.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleWorkerCardClick(worker.id)
                    }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{worker.image}</div>
                      <h3 className="font-heading text-xl font-bold text-gray-800">
                        {worker.name}
                      </h3>
                      <p className="text-rural-green-600 font-semibold">{worker.skill}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('profile.location')}</span>
                        <span className="font-semibold">{worker.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('profile.rating')}</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(worker.rating)}
                          <span className="ml-2 font-semibold">{worker.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('profile.experience')}</span>
                        <span className="font-semibold">{worker.experience}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          {worker.reviews} {t('profile.reviews')}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                      <Link
                        to={`/profile/${worker.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-sm text-rural-green-600 hover:underline font-semibold"
                      >
                        View profile
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        ) : (
          <div className="card h-[600px]">
            <MapContainer
              center={[19.0760, 72.8777]}
              zoom={10}
              style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredWorkers.map((worker) => (
                <Marker key={worker.id} position={[worker.lat, worker.lng]}>
                  <Popup>
                    <div className="text-center">
                      <div className="text-4xl mb-2">{worker.image}</div>
                      <h3 className="font-bold">{worker.name}</h3>
                      <p className="text-rural-green-600">{worker.skill}</p>
                      <p className="text-sm text-gray-600">{worker.location}</p>
                      <div className="flex flex-col space-y-2 mt-3">
                        <Link
                          to={`/profile/${worker.id}`}
                          className="text-rural-green-600 hover:underline text-sm"
                        >
                          View Profile
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleWorkerCardClick(worker.id)}
                          className="btn-primary text-xs"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search

