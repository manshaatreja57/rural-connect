import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  village: String,
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: String,
  description: String,
  budget: Number,

  // Fix status mismatch
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true })

export default mongoose.model('Job', jobSchema)
