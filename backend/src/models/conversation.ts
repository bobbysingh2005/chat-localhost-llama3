import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, default: 'New conversation' },
  messages: { type: [messageSchema], default: [] },
  vector: { type: [Number], default: [] }, // Embedding vector for semantic search
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

  conversationSchema.pre('save' as any, function (this: any, next: () => void) {
  this.updatedAt = new Date();
  next();
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
