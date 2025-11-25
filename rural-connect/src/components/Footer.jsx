import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  const icons = ['🚜', '🔨', '✂️', '🌾', '🛠️', '🏡']

  return (
    <footer className="bg-gradient-to-br from-earthy-beige-200 to-earthy-beige-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-heading text-xl font-bold text-rural-green-600 mb-4">
              Rural Connect
            </h3>
            <p className="text-gray-700 text-sm">
              {t('home.subtagline')}
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-gray-800 mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link to="/" className="hover:text-rural-green-600 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-rural-green-600 transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-gray-800 mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link to="/chat" className="hover:text-rural-green-600 transition-colors">
                  {t('nav.chat')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-gray-800 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a href="#" className="hover:text-rural-green-600 transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rural-green-600 transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-700 text-sm mb-4 md:mb-0">
            © 2024 Rural Connect. {t('footer.rights')}
          </p>
          <div className="flex space-x-4">
            {icons.map((icon, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="text-2xl"
              >
                {icon}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer





