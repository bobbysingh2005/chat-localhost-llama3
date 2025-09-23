// tools/userTools.js
import { User } from "../models/User.js";

export const tools = {
  // Find user by email
  findUserByEmail: async ({ email }) => {
    const user = await User.findOne({ email });
    return user || null;
  },

  // Insert a new user
  createUser: async ({ name, email, role }) => {
    const user = new User({ name, email, role });
    await user.save();
    return user;
  },

  // Update user role
  updateUserRole: async ({ email, role }) => {
    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );
    return user || null;
  },
};
