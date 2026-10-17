/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PlayerProfile, SchoolLevel } from './types/game';
import { AVATARS } from './data/characters';
import { RhythmGame } from './components/RhythmGame';
import { LevelSelector } from './components/LevelSelector';
import { CollectionModal } from './components/CollectionModal';
import { ProfileSelector } from './components/ProfileSelector';
import { ArcadeBackground } from './components/ArcadeBackground';
import { rockSynth } from './audio/rockSynth';
import { Volume2, VolumeX } from 'lucide-react';

const STORAGE_PROFILES_KEY = 'fraction_rock_profiles_v2';
const STORAGE_ACTIVE_ID_KEY = 'fraction_rock_active_id_v2';

const DEFAULT_PROFILES: PlayerProfile[] = [
  {
    id: 'prof_default_1',
    name: 'Musicien',
    avatarId: 0,
    coins: 150,
    unlockedCharacters: [1, 2, 6],
    highScores: { CP: 0, CE1: 0, CE2: 0, CM1: 0, CM2: 0, '6E': 0 },
    starsPerLevel: { CP: 0, CE1: 0, CE2: 0, CM1: 0, CM2: 0, '6E': 0 },
    colorblindMode: false,
    soundEnabled: true,
    selectedLevel: 'CE1',
    adaptiveStats: {},
  },
];

export default function App() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_PROFILES[0].id;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [showProfiles, setShowProfiles] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];
  const activeAvatar = AVATARS[activeProfile.avatarId] || AVATARS[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProfileId);
    } catch {
      // ignore
    }
  }, [activeProfileId]);

  const updateActiveProfile = (updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfile.id) {
          return updater(p);
        }
        return p;
      })
    );
  };

  const handleCreateProfile = (name: string, avatarId: number, level: SchoolLevel) => {
    const newProf: PlayerProfile = {
      id: 'prof_' + Math.random().toString(36).substring(2, 9),
      name,
      avatarId,
      coins: 100,
      unlockedCharacters: [1, 2],
      highScores: { CP: 0, CE1: 0, CE2: 0, CM1: 0, CM2: 0, '6E': 0 },
      starsPerLevel: { CP: 0, CE1: 0, CE2: 0, CM1: 0, CM2: 0, '6E': 0 },
      colorblindMode: activeProfile.colorblindMode,
      soundEnabled: !soundMuted,
      selectedLevel: level,
      adaptiveStats: {},
    };
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newProf.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    setProfiles((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId(filtered[0].id);
      }
      return filtered;
    });
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    rockSynth.setMute(next);
    updateActiveProfile((prev) => ({ ...prev, soundEnabled: !next }));
  };

  const toggleColorblind = () => {
    const next = !activeProfile.colorblindMode;
    updateActiveProfile((prev) => ({ ...prev, colorblindMode: next }));
  };

  if (isPlaying) {
    return (
      <RhythmGame
        level={activeProfile.selectedLevel}
        profile={activeProfile}
        onUpdateProfile={updateActiveProfile}
        onExitGame={() => setIsPlaying(false)}
        onOpenShop={() => {
          setIsPlaying(false);
          setShowCollection(true);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-display overflow-hidden">
      {/* Ultra-Colorful Addictive Anime Arcade Background */}
      <ArcadeBackground />

      {/* 3D Neo-Arcade Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b-2 border-slate-900 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30 gap-3">
        {/* Top-Left: Much Bigger Avatar and Player Name */}
        <button
          type="button"
          onClick={() => setShowProfiles(true)}
          className="flex items-center gap-3 sm:gap-4 p-2 sm:p-2.5 pr-4 sm:pr-5 rounded-3xl bg-slate-900/95 border-[3px] border-cyan-400 shadow-[0_6px_0_#0e7490,0_0_25px_rgba(6,182,212,0.35)] hover:border-cyan-300 hover:shadow-[0_6px_0_#0891b2,0_0_35px_rgba(6,182,212,0.5)] active:translate-y-1 active:shadow-none transition-all cursor-pointer group text-left shrink-0"
          title="Clique pour changer de profil ou d'avatar"
        >
          {/* Much Bigger Avatar Image */}
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-lg bg-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center"
            style={{ backgroundColor: activeAvatar.avatarColor }}
          >
            <img
              src={activeAvatar.imageSrc}
              alt={activeAvatar.animal}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Much Bigger Player Name & Info */}
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors drop-shadow">
              {activeProfile.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-300 text-xs font-black uppercase tracking-wider">
                {activeProfile.selectedLevel}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                {activeAvatar.animal}
              </span>
            </div>
          </div>
        </button>

        {/* Top-Right: Game title & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <span className="hidden lg:inline-block text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-300 to-cyan-300 drop-shadow-md mr-1">
            Fraction Rock
          </span>

          <button
            onClick={() => setShowCollection(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900 border-2 border-amber-500/60 shadow-[0_4px_0_#78350f] text-amber-300 font-black text-xs sm:text-sm hover:brightness-110 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span className="text-base">🎁</span>
            <span>{activeProfile.coins} 🪙</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-[0_4px_0_#0f172a] active:translate-y-1 active:shadow-none text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Son"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-center">
        {/* Worlds: 1-Click Direct Play */}
        <LevelSelector
          profile={activeProfile}
          onPlayLevel={(lvl) => {
            rockSynth.init();
            updateActiveProfile((prev) => ({ ...prev, selectedLevel: lvl }));
            setIsPlaying(true);
          }}
        />
      </main>

      <footer className="py-3 text-center text-xs font-semibold text-slate-600">
        Fraction Rock · CP à la 6e
      </footer>

      {showCollection && (
        <CollectionModal
          profile={activeProfile}
          onUpdateProfile={updateActiveProfile}
          onClose={() => setShowCollection(false)}
        />
      )}

      {showProfiles && (
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfile.id}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            setShowProfiles(false);
          }}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfiles(false)}
        />
      )}
    </div>
  );
}
