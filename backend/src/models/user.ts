import mongoose from 'mongoose';
import config from '../config';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
},{
  timestamps: true
});

const User = mongoose.model('User', userSchema);


// Optionally, create admin user in dev mode (async, should be called from app init, not here)
import bcrypt from 'bcrypt';

export async function ensureAdminUser() {
  if (config.isDev) {
    const admin = {
      email: config.adminEmail,
      username: config.adminUser,
      passwordHash: await bcrypt.hash(config.adminPassword, 10)
    };
    const exists = await User.findOne({ email: admin.email });
    if (!exists) {
      await User.create(admin);
      console.log(`   \x1b[32m✓\x1b[0m \x1b[32mAdmin user created:\x1b[0m \x1b[36m${admin.email}\x1b[0m`);
    } else {
      console.log(`   \x1b[32m✓\x1b[0m \x1b[90mAdmin user verified:\x1b[0m \x1b[36m${admin.email}\x1b[0m`);
    }
  }
}

export default User;

//test1
