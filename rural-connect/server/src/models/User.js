import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  area: String,
  street: String,
  city: String,
  state: String,
}, { _id: false })

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String },
    googleId: { type: String },

    // Add missing SKILL field
    skill: {
      type: String,
      enum: ['carpenter', 'plumber', 'tailor', 'farmer', 'other'],
    },

    location: addressSchema,
    role: { type: String, enum: ['worker', 'employer'], required: true },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
