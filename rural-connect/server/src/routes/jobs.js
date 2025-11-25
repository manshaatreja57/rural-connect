import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import Job from '../models/Job.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { status, skill, location } = req.query
    const query = {}

    if (status) {
      query.status = status
    }

    if (skill) {
      query.skill = new RegExp(`^${skill}$`, 'i')
    }

    if (location) {
      const locationRegex = new RegExp(location, 'i')
      query.$or = [
        { location: locationRegex },
        { village: locationRegex },
        { description: locationRegex },
      ]
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email')

    res.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { skill, village, location, date, time, description, budget } = req.body
    
    if (!skill || !location || !date) {
      return res.status(400).json({ message: 'Missing required fields: skill, location, and date are required' })
    }

    const job = await Job.create({
      skill,
      village: village || location,
      location,
      date: new Date(date),
      time,
      description,
      budget: budget ? Number(budget) : undefined,
      status: 'pending',
      postedBy: req.user._id
    })

    res.status(201).json({ 
      success: true, 
      job: await Job.findById(job._id).populate('postedBy', 'name email')
    })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({ message: 'Failed to create job', error: error.message })
  }
})

export default router

