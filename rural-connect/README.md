# Rural Work Connector - Frontend

A professional, interactive, and fully responsive frontend for a MERN-based project called "Rural Work Connector." This platform connects villagers seeking skilled help (like carpenters, plumbers, tailors, or farmers) with local workers nearby.

## 🎨 Design Theme

The website features a "modern rural" blend with:
- **Colors**: Light earthy beige, soft sky blue, green gradients, and white overlays
- **Typography**: Poppins for headings, Inter/Nunito for body text
- **Layout**: Grid-based structure with rounded corners, soft shadows, and plenty of white space

## 🚀 Tech Stack

- **React.js** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for page transitions and animations
- **GSAP** with ScrollTrigger for scroll reveals and parallax effects
- **i18next** for multilingual support (English, Hindi, Marathi)
- **Recharts** for data visualization
- **React Router DOM** for routing
- **React Leaflet** for map integration
- **Socket.IO Client** (ready for real-time chat integration)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rural-connect
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx      # Navigation header with language toggle
│   ├── Footer.jsx      # Footer with animated icons
│   └── LanguageToggle.jsx  # Language switcher
├── pages/              # Page components
│   ├── Home.jsx        # Homepage with hero section
│   ├── Search.jsx      # Worker search with filters and map
│   ├── JobPosting.jsx  # Multi-step job posting form
│   ├── WorkerProfile.jsx  # Worker profile with tabs
│   ├── Chat.jsx        # Chat interface (Socket.IO ready)
│   └── Dashboard.jsx   # Analytics dashboard
├── i18n/               # Internationalization
│   ├── config.js       # i18next configuration
│   └── locales/        # Translation files
│       ├── en.json     # English
│       ├── hi.json     # Hindi
│       └── mr.json     # Marathi
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles with Tailwind
```

## 🎯 Features

### Home Page
- Cinematic background with gradient overlay
- Animated tagline and call-to-action buttons
- Popular skills showcase with hover effects
- "How it Works" section with animated cards
- Smooth scroll animations using GSAP

### Search Page
- Advanced search with filters (skill, location, rating)
- Animated worker profile cards
- Toggle between list and map view
- Real-time filtering
- Map integration with Leaflet

### Job Posting Page
- Multi-step form with Framer Motion transitions
- Step-by-step validation
- Success animation on submission
- Responsive design

### Worker Profile Page
- Tabbed interface (About, Reviews, Availability)
- Animated rating system
- Review sliders
- Contact options

### Chat Page
- Clean sidebar for conversations
- Main chat window
- Socket.IO ready (commented code for integration)
- Attachment and call icons
- Real-time messaging interface

### Dashboard Page
- Key statistics cards
- Analytics charts using Recharts
- Skill gaps by region visualization
- Worker distribution pie chart
- Activity metrics line chart
- Skeleton loaders for better UX

### Additional Features
- **Language Toggle**: Top-right globe icon for switching between English, Hindi, and Marathi
- **Accessibility**: ARIA labels, keyboard navigation, proper color contrast
- **Responsive Design**: Fully responsive across all devices
- **Animations**: Subtle, performance-optimized animations throughout

## 🌐 Internationalization

The app supports three languages:
- English (en)
- Hindi (hi)
- Marathi (mr)

Language preference is saved in localStorage and persists across sessions.

## 🗺️ Map Integration

The search page includes a map view using Leaflet. To use a different map provider (like Mapbox), update the `Search.jsx` component.

## 💬 Socket.IO Integration

The chat page is ready for Socket.IO integration. Uncomment the Socket.IO code in `src/pages/Chat.jsx` and connect to your backend:

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000') // Your backend URL
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
- `earthy-beige`: Beige tones
- `sky-blue`: Blue tones
- `rural-green`: Green tones

### Fonts
Google Fonts are imported in `src/index.css`. Modify the font imports to change typography.

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Proper color contrast ratios
- Focus indicators

## 🚀 Performance Optimizations

- Lazy loading for images
- Code splitting with React Router
- Optimized animations
- Skeleton loaders for better perceived performance

## 📝 License

This project is part of the Rural Work Connector platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ for rural communities
