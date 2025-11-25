import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  area: String,
  street: String,
  city: String,
  state: String,
}, { _id: false })

const workerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  rating: { type: Number, default: 0 },
  experience: { type: String },
  address: addressSchema,
}, { timestamps: true })

export default mongoose.model('Worker', workerSchema)

