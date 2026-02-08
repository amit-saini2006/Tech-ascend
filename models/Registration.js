import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true, // Legacy numeric ID for compatibility
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
  },
  course: String,
  year: String,
  college: String,
  phone: String,
  eventId: {
    type: Number,
    required: true,
  },
  eventName: String,
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate registrations for same event
RegistrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
