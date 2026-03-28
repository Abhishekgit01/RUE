import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface UserProfile {
  userId: string;
  displayName: string;
  handle?: string;
  tagline?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  accentColor: string;
  fontPreference: string;
  canvasDensity: string;
  createdAt: string;
  preferences: {
    defaultDepthLimit: number | null;
    defaultTermCount: number;
    defaultTemperature: number;
    autoScroll: boolean;
    animateConnections: boolean;
  };
}

interface SettingsState {
  userId: string;
  profile: UserProfile | null;
  isLoading: boolean;
  initSettings: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setAccentColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  userId: localStorage.getItem('rue_user_id') || '',
  profile: null,
  isLoading: false,

  initSettings: async () => {
    let uid = get().userId;
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem('rue_user_id', uid);
      set({ userId: uid });
    }

    set({ isLoading: true });
    try {
      const { data } = await axios.get(`http://localhost:3001/api/rue/users/${uid}`);
      set({ profile: data, isLoading: false });
      
      // Apply initial theme
      if (data.accentColor) {
        document.documentElement.style.setProperty('--accent', data.accentColor);
      }
      if (data.fontPreference) {
        document.documentElement.setAttribute('data-font', data.fontPreference);
      }
    } catch (error) {
      console.error('Failed to init settings:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const uid = get().userId;
    if (!uid) return;

    // Optimistic update
    const oldProfile = get().profile;
    if (oldProfile) {
      set({ profile: { ...oldProfile, ...updates } });
    }

    try {
      const { data } = await axios.patch(`http://localhost:3001/api/rue/users/${uid}`, updates);
      set({ profile: data });

      // Apply changes reactively
      if (updates.accentColor) {
        document.documentElement.style.setProperty('--accent', updates.accentColor);
      }
      if (updates.fontPreference) {
        document.documentElement.setAttribute('data-font', updates.fontPreference);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Rollback
      set({ profile: oldProfile });
    }
  },

  setAccentColor: (color: string) => {
    document.documentElement.style.setProperty('--accent', color);
    get().updateProfile({ accentColor: color });
  }
}));
