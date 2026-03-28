import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

const ACCENT_PRESETS = [
  '#d0bcff', // default violet
  '#7dd3fc', // sky
  '#86efac', // green
  '#fda4af', // rose
  '#fdba74', // orange
  '#e879f9', // fuchsia
];

export default function ProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profile, updateProfile, setAccentColor } = useSettingsStore();
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSaved = (field: string) => {
    setSavedStatus(field);
    setTimeout(() => setSavedStatus(null), 1500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateProfile({ avatar: base64 });
      showSaved('avatar');
    };
    reader.readAsDataURL(file);
  };

  const handleBlur = (field: string, value: any) => {
    updateProfile({ [field]: value });
    showSaved(field);
  };

  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed top-0 left-0 w-[320px] h-full bg-[#080f1f] border-r border-white/10 z-[101] flex flex-col shadow-2xl overflow-y-auto custom-scrollbar"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-white/90 font-[Manrope]">Profile settings</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40">
                  <X size={20} />
                </button>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[var(--accent)]/40 to-[#6d28d9]/40 border-2 border-white/10 flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Large Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white font-[Manrope]">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                  />
                  {savedStatus === 'avatar' && (
                    <div className="absolute -bottom-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                
                <input 
                  type="text"
                  defaultValue={profile.displayName}
                  onBlur={(e) => handleBlur('displayName', e.target.value)}
                  className="mt-4 text-xl font-bold text-white bg-transparent text-center border-b border-transparent focus:border-[var(--accent)]/50 outline-none w-full"
                />
              </div>

              {/* Personal Info */}
              <div className="space-y-4 mb-10">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5 ml-1">Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">@</span>
                    <input 
                      type="text" 
                      defaultValue={profile.handle || ''}
                      onBlur={(e) => handleBlur('handle', e.target.value)}
                      placeholder="username"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 pl-7 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--accent)]/30"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5 ml-1">Tagline</label>
                  <input 
                    type="text" 
                    defaultValue={profile.tagline || ''}
                    onBlur={(e) => handleBlur('tagline', e.target.value)}
                    placeholder="Short biological tagline"
                    maxLength={60}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--accent)]/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5 ml-1">Bio</label>
                  <textarea 
                    defaultValue={profile.bio || ''}
                    onBlur={(e) => handleBlur('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--accent)]/30 resize-none"
                  />
                </div>
              </div>

              {/* Appearance */}
              <div className="mb-10">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/25 mb-4 px-1">APPEARANCE</h3>
                
                <div className="mb-6">
                  <label className="block text-xs text-white/40 mb-3 ml-1">Accent color</label>
                  <div className="flex flex-wrap gap-2 px-1">
                    {ACCENT_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${profile.accentColor === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input 
                      type="color"
                      value={profile.accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs text-white/40 mb-3 ml-1">Font preference</label>
                  <select 
                    value={profile.fontPreference}
                    onChange={(e) => updateProfile({ fontPreference: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[var(--accent)]/30"
                  >
                    <option value="default">Manrope + Inter (Default)</option>
                    <option value="system">System UI</option>
                    <option value="mono">Mono (JetBrains Mono)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-3 ml-1">Canvas density</label>
                  <div className="flex bg-white/[0.04] rounded-xl p-1">
                    <button 
                      onClick={() => updateProfile({ canvasDensity: 'compact' })}
                      className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${profile.canvasDensity === 'compact' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-white/30 hover:text-white/50'}`}
                    >
                      Compact
                    </button>
                    <button 
                      onClick={() => updateProfile({ canvasDensity: 'spacious' })}
                      className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${profile.canvasDensity === 'spacious' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-white/30 hover:text-white/50'}`}
                    >
                      Spacious
                    </button>
                  </div>
                </div>
              </div>

              {/* Exploration Defaults */}
              <div className="mb-10">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/25 mb-4 px-1">EXPLORATION DEFAULTS</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Depth limit</span>
                    <input 
                      type="number"
                      min={1}
                      max={20}
                      value={profile.preferences.defaultDepthLimit || ''}
                      onChange={(e) => updateProfile({ preferences: { ...profile.preferences, defaultDepthLimit: e.target.value ? parseInt(e.target.value) : null } })}
                      className="w-16 bg-white/[0.04] border border-white/[0.08] rounded-lg py-1 px-2 text-sm text-white text-right outline-none focus:border-[var(--accent)]/30"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Terms per response</span>
                      <span className="text-sm text-[var(--accent)]">{profile.preferences.defaultTermCount}</span>
                    </div>
                    <input 
                      type="range"
                      min={3}
                      max={8}
                      value={profile.preferences.defaultTermCount}
                      onChange={(e) => updateProfile({ preferences: { ...profile.preferences, defaultTermCount: parseInt(e.target.value) } })}
                      className="accent-[var(--accent)]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Auto-scroll to new nodes</span>
                    <button 
                      onClick={() => updateProfile({ preferences: { ...profile.preferences, autoScroll: !profile.preferences.autoScroll } })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${profile.preferences.autoScroll ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: profile.preferences.autoScroll ? 22 : 2 }}
                        className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-20 pt-10 border-t border-red-500/10 mb-10">
                 <button className="w-full py-3 rounded-xl border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm font-medium">
                   Clear all session data
                 </button>
                 <p className="text-[10px] text-white/20 text-center mt-4">
                   Member since {new Date(profile.createdAt).toLocaleDateString()}
                 </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
