import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
},{
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
