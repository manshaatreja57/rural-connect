import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Home = () => {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const skillsRef = useRef(null)

  const skills = [
    { icon: '🔨', name: 'Carpenter', color: 'from-amber-400 to-amber-600' },
    { icon: '🔧', name: 'Plumber', color: 'from-blue-400 to-blue-600' },
    { icon: '✂️', name: 'Tailor', color: 'from-pink-400 to-pink-600' },
    { icon: '🌾', name: 'Farmer', color: 'from-green-400 to-green-600' },
    { icon: '🧱', name: 'Mason', color: 'from-orange-400 to-orange-600' },
    { icon: '⚡', name: 'Electrician', color: 'from-yellow-400 to-yellow-600' },
  ]

  const steps = [
    {
      number: '01',
      title: t('home.step1.title'),
      description: t('home.step1.description'),
      icon: '🔍',
    },
    {
      number: '02',
      title: t('home.step2.title'),
      description: t('home.step2.description'),
      icon: '🤝',
    },
    {
      number: '03',
      title: t('home.step3.title'),
      description: t('home.step3.description'),
      icon: '💼',
    },
  ]

  useEffect(() => {
    // Parallax effect for hero section
    gsap.to(heroRef.current, {
      y: 50,
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Animate skills on scroll
    gsap.from(skillsRef.current?.children || [], {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      scrollTrigger: {
        trigger: skillsRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }, [])

  return (
    <div className="relative">
      {/* Hero Section with Video Background */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />
          <div className="w-full h-full bg-gradient-to-br from-rural-green-400/30 via-sky-blue-400/30 to-earthy-beige-300/30 flex items-center justify-center">
            <div className="text-center text-white/20 text-9xl font-heading font-bold">
              RURAL CONNECT
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-5xl md:text-7xl font-bold text-white mb-6"
          >
            {t('home.tagline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-8"
          >
            {t('home.subtagline')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/search" className="btn-primary">
              {t('home.findWorker')}
            </Link>
            <Link to="/post-job" className="btn-secondary">
              {t('home.joinAsWorker')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Popular Skills Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl font-bold text-center text-gray-800 mb-12"
          >
            {t('home.popularSkills')}
          </motion.h2>
          <div ref={skillsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, y: -5 }}
                className="card text-center cursor-pointer"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${skill.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {skill.icon}
                </div>
                <h3 className="font-heading font-semibold text-gray-800">{skill.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-earthy-beige-50 to-sky-blue-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl font-bold text-center text-gray-800 mb-16"
          >
            {t('home.howItWorks')}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="card text-center h-full">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <div className="absolute top-4 right-4 text-6xl font-heading font-bold text-rural-green-200">
                    {step.number}
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-gray-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home





