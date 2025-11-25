import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authSocketMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Unauthorized'))
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id).select('-password')
    if (!user) return next(new Error('Unauthorized'))
    socket.user = user
    next()
  } catch {
    next(new Error('Unauthorized'))
  }
}

