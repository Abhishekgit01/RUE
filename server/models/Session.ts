import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  id: string; // uuid
  title: string;
  rootPrompt: string;
  createdAt: Date;
  updatedAt: Date;
  nodeCount: number;
  previewTerms: string[];
  explorationSummary: string;
  thumbnail?: string;
  isFavorited: boolean;
  tags: string[];
}

const SessionSchema = new Schema<ISession>({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: "Untitled Exploration" },
  rootPrompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  nodeCount: { type: Number, default: 1 },
  previewTerms: [String],
  explorationSummary: { type: String, default: '' },
  thumbnail: String,
  isFavorited: { type: Boolean, default: false },
  tags: [String],
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
