import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import User from './src/models/User.js'
import Worker from './src/models/Worker.js'
import Job from './src/models/Job.js'

await mongoose.connect(process.env.MONGO_URI)

await User.deleteMany({})
await Worker.deleteMany({})
await Job.deleteMany({})

const users = await User.insertMany([
  { name: 'Anita Singh', email: 'anita@example.com', role: 'worker', location: { area: 'Sector 5', street: 'Main Rd', city: 'Pune', state: 'MH' } },
  { name: 'Ravi Verma', email: 'ravi@example.com', role: 'employer', location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' } },
  { name: 'Saira Khan', email: 'saira@example.com', role: 'worker', location: { area: 'DLF Phase 1', street: 'Park St', city: 'Gurugram', state: 'HR' } },
])

await Worker.insertMany([
  { userId: users[0]._id, skill: 'Carpenter', rating: 4.6, experience: '5 years', address: { area: 'Sector 5', street: 'Main Rd', city: 'Pune', state: 'MH' } },
  { userId: users[2]._id, skill: 'Plumber', rating: 4.3, experience: '3 years', address: { area: 'DLF Phase 1', street: 'Park St', city: 'Gurugram', state: 'HR' } },
])

await Job.insertMany([
  { title: 'Fix door hinges', description: 'Bedroom door hinges noisy', status: 'active', postedBy: users[1]._id, location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' }, budget: 800 },
  { title: 'Kitchen sink leak', description: 'Leak under sink', status: 'completed', postedBy: users[1]._id, location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' }, budget: 1200 },
])

console.log('Seeded.')
process.exit(0)

import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import User from './src/models/User.js'
import Worker from './src/models/Worker.js'
import Job from './src/models/Job.js'

await mongoose.connect(process.env.MONGO_URI)

await User.deleteMany({})
await Worker.deleteMany({})
await Job.deleteMany({})

const users = await User.insertMany([
  { name: 'Anita Singh', email: 'anita@example.com', role: 'worker', location: { area: 'Sector 5', street: 'Main Rd', city: 'Pune', state: 'MH' } },
  { name: 'Ravi Verma', email: 'ravi@example.com', role: 'employer', location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' } },
  { name: 'Saira Khan', email: 'saira@example.com', role: 'worker', location: { area: 'DLF Phase 1', street: 'Park St', city: 'Gurugram', state: 'HR' } },
])

await Worker.insertMany([
  { userId: users[0]._id, skill: 'Carpenter', rating: 4.6, experience: '5 years', address: { area: 'Sector 5', street: 'Main Rd', city: 'Pune', state: 'MH' } },
  { userId: users[2]._id, skill: 'Plumber', rating: 4.3, experience: '3 years', address: { area: 'DLF Phase 1', street: 'Park St', city: 'Gurugram', state: 'HR' } },
])

await Job.insertMany([
  { title: 'Fix door hinges', description: 'Bedroom door hinges noisy', status: 'active', postedBy: users[1]._id, location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' }, budget: 800 },
  { title: 'Kitchen sink leak', description: 'Leak under sink', status: 'completed', postedBy: users[1]._id, location: { area: 'MG Road', street: '1st Ave', city: 'Pune', state: 'MH' }, budget: 1200 },
])

console.log('Seeded.')
process.exit(0)


