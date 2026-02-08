import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this event.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  tagline: {
    type: String,
    maxlength: [200, 'Tagline cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  image: {
    type: String, // Emoji or placeholder
  },
  imagePath: {
    type: String, // Path to uploaded image
  },
  date: String,
  time: String,
  duration: String,
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Offline',
  },
  location: String,
  category: String,
  teamSize: String,
  registrationDeadline: String, // Display string
  deadline: String, // ISO String for automation
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  prizes: [String],
  requirements: [String],
  highlights: [String],
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
