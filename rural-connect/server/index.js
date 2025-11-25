import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { Server as SocketIOServer } from 'socket.io'
import connectDB from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/users.js'
import workerRoutes from './src/routes/workers.js'
import jobRoutes from './src/routes/jobs.js'
import messageRoutes from './src/routes/messages.js'
import statsRoutes from './src/routes/stats.js'
import locationRoutes from './src/routes/locations.js'
import { authSocketMiddleware } from './src/middleware/authSocket.js'
import passport from './src/config/passport.js'

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})

connectDB()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use(passport.initialize())

app.get('/', (_req, res) => res.send('Rural Connect API running'))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/chat', messageRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/locations', locationRoutes)

io.use(authSocketMiddleware)
io.on('connection', (socket) => {
  const userId = socket.user._id.toString()
  socket.join(userId)

  socket.on('message:send', ({ receiverId, message }) => {
    const payload = {
      _id: Date.now().toString(),
      senderId: userId,
      receiverId,
      message,
      timestamp: new Date().toISOString(),
    }
    io.to(receiverId).emit('message:receive', payload)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server listening on ${PORT}`))
