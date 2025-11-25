import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import Worker from '../models/Worker.js'

const router = Router()

router.get('/', async (req, res) => {
  const { skill, location } = req.query
  const query = {}

  if (skill) {
    query.skill = skill
  }

  if (location) {
    const regex = new RegExp(location, 'i')
    query.$or = [
      { 'address.area': regex },
      { 'address.street': regex },
      { 'address.city': regex },
      { 'address.state': regex },
    ]
  }

  const workers = await Worker.find(query).populate('userId', 'name role email')
  res.json(
    workers.map((w) => ({
      _id: w._id,
      userId: w.userId?._id,
      name: w.userId?.name,
      email: w.userId?.email,
      skill: w.skill,
      rating: w.rating,
      experience: w.experience,
      address: w.address,
    }))
  )
})

router.get('/:id', async (req, res) => {
  const w = await Worker.findById(req.params.id).populate('userId', 'name role email')
  if (!w) return res.status(404).json({ message: 'Worker not found' })
  res.json({
    _id: w._id,
    name: w.userId?.name,
    email: w.userId?.email,
    skill: w.skill,
    rating: w.rating,
    experience: w.experience,
    address: w.address,
  })
})

router.post('/', auth, async (req, res) => {
  const exists = await Worker.findOne({ userId: req.user._id })
  if (exists) return res.status(400).json({ message: 'Worker already exists' })
  const worker = await Worker.create({ userId: req.user._id, ...req.body })
  res.json(worker)
})

export default router

