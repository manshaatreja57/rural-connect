import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { auth } from '../middleware/auth.js'
import passport from '../config/passport.js'

const router = Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const formatErrors = (errors) =>
  errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }))

const sanitizeUser = (user) => {
  const data = user.toObject()
  delete data.password
  delete data.otpCode
  delete data.otpExpiresAt
  return data
}

// ------------------------------------------------------
// REGISTER (OTP removed – verified by default)
// ------------------------------------------------------
router.post(
  '/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['worker', 'employer'])
    .withMessage('Role must be worker or employer'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: formatErrors(errors) })
    }

    const { name, email, password, role } = req.body

    let user = await User.findOne({ email })
    if (user) {
      return res
        .status(400)
        .json({
          errors: [
            {
              field: 'email',
              message: 'An account with this email already exists.',
            },
          ],
        })
    }

    const hash = await bcrypt.hash(password, 10)

    user = await User.create({
      name,
      email,
      password: hash,
      role,
      isVerified: true, // ⭐ user verified instantly (no OTP)
    })

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      email,
    })
  }
)

// ------------------------------------------------------
// LOGIN (OTP check removed)
// ------------------------------------------------------
router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: formatErrors(errors) })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ field: 'email', message: 'Invalid credentials' }] })
    }

    const ok = await bcrypt.compare(password, user.password || '')
    if (!ok) {
      return res.status(400).json({
        errors: [{ field: 'password', message: 'Invalid credentials' }],
      })
    }

    // ⭐ No OTP verification required now
    const token = signToken(user._id)
    res.json({ token, user: sanitizeUser(user) })
  }
)

// ------------------------------------------------------
// ME route
// ------------------------------------------------------
router.get('/me', auth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) })
})

// ------------------------------------------------------
// GOOGLE AUTH (same as you had it)
// ------------------------------------------------------
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// You can enable callback later if needed
// router.get(
//   '/google/callback',
//   passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
//   async (req, res) => {
//     const token = signToken(req.user._id)
//     res.redirect(`${process.env.CLIENT_URL}/oauth-success#token=${token}`)
//   }
// )

export default router
