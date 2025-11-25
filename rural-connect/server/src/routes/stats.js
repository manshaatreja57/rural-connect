import { Router } from 'express'
import User from '../models/User.js'
import Worker from '../models/Worker.js'
import Job from '../models/Job.js'

const router = Router()

router.get('/', async (_req, res) => {
  const [totalWorkers, totalJobs, activeJobs, completedJobs, totalUsers] = await Promise.all([
    Worker.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    Job.countDocuments({ status: 'completed' }),
    User.countDocuments(),
  ])

  const skillGaps = await Worker.aggregate([
    {
      $group: {
        _id: '$address.city',
        carpenters: { $sum: { $cond: [{ $eq: ['$skill', 'Carpenter'] }, 1, 0] } },
        plumbers: { $sum: { $cond: [{ $eq: ['$skill', 'Plumber'] }, 1, 0] } },
        tailors: { $sum: { $cond: [{ $eq: ['$skill', 'Tailor'] }, 1, 0] } },
        farmers: { $sum: { $cond: [{ $eq: ['$skill', 'Farmer'] }, 1, 0] } },
      },
    },
    { $project: { region: '$_id', carpenters: 1, plumbers: 1, tailors: 1, farmers: 1, _id: 0 } },
  ])

  const workerDistribution = await Worker.aggregate([
    { $group: { _id: '$skill', value: { $sum: 1 } } },
    { $project: { name: '$_id', value: 1, _id: 0 } },
  ])

  // Jobs by skill
  const jobsBySkill = await Job.aggregate([
    { $group: { _id: '$skill', count: { $sum: 1 } } },
    { $project: { skill: '$_id', count: 1, _id: 0 } },
  ])

  // Users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $project: { role: '$_id', count: 1, _id: 0 } },
  ])

  // Activity metrics - last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const activityData = await Job.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        jobs: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $limit: 6
    }
  ])

  const workerActivityData = await Worker.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        workers: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $limit: 6
    }
  ])

  // Merge activity data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const activityMap = new Map()
  
  activityData.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`
    activityMap.set(key, { month: monthNames[item._id.month - 1], jobs: item.jobs, workers: 0 })
  })
  
  workerActivityData.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`
    const existing = activityMap.get(key)
    if (existing) {
      existing.workers = item.workers
    } else {
      activityMap.set(key, { month: monthNames[item._id.month - 1], jobs: 0, workers: item.workers })
    }
  })

  const activityMetrics = Array.from(activityMap.values()).slice(-6)

  const recentJobs = await Job.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('skill location status createdAt')

  res.json({ 
    totalWorkers, 
    totalJobs,
    activeJobs, 
    completedJobs, 
    totalUsers, 
    skillGaps, 
    workerDistribution,
    jobsBySkill,
    usersByRole,
    activityMetrics,
    recentJobs
  })
})

export default router

