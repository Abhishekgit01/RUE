import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  displayName: string;
  handle?: string;
  tagline?: string;
  bio?: string;
  website?: string;
  avatar?: string; // base64
  accentColor: string;
  fontPreference: string;
  canvasDensity: string;
  preferences: {
    defaultDepthLimit: number | null;
    defaultTermCount: number;
    defaultTemperature: number;
    autoScroll: boolean;
    animateConnections: boolean;
  };
  createdAt: Date;
}

const UserProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, default: "Explorer" },
  handle: String,
  tagline: String,
  bio: String,
  website: String,
  avatar: String,
  accentColor: { type: String, default: "#d0bcff" },
  fontPreference: { type: String, default: "default" },
  canvasDensity: { type: String, default: "spacious" },
  preferences: {
    defaultDepthLimit: { type: Number, default: null },
    defaultTermCount: { type: Number, default: 5 },
    defaultTemperature: { type: Number, default: 0.7 },
    autoScroll: { type: Boolean, default: true },
    animateConnections: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
