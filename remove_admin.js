const mongoose = require('mongoose');

// Simple Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// Force URI from .env.local without dotenv parsing issues
const MONGODB_URI = 'mongodb+srv://82clashofclan_db_user:hbqC8YXLPyGXuoeA@techascend.s0zdsmh.mongodb.net/?retryWrites=true&w=majority&appName=TechAscend';

async function removeAdmin() {
  const emailToRemove = '82amitsaini2@gmail.com';
  console.log(`Checking database...`);

  try {
    await mongoose.connect(MONGODB_URI);
    
    const admin = await Admin.findOne({ email: emailToRemove });
    
    if (admin) {
      await Admin.deleteOne({ email: emailToRemove });
      console.log(`SUCCESS: Removed ${emailToRemove} from database.`);
    } else {
      console.log(`INFO: ${emailToRemove} is NOT in the database.`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
}

removeAdmin();
