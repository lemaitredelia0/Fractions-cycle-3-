import React from 'react';
import { SchoolLevel, PlayerProfile } from '../types/game';
import { Star, Play } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel?: SchoolLevel;
  profile: PlayerProfile;
  onPlayLevel: (level: SchoolLevel) => void;
}

interface WorldMeta {
  id: SchoolLevel;
  title: string;
  theme: string;
  colorBorder: string;
  colorAccent: string;
  colorBg: string;
  shadow3D: string;
  btnBg: string;
  icon: string;
}

const WORLDS: WorldMeta[] = [
  {
    id: 'CP',
    title: 'Village Pastel',
    theme: 'Partages & Moitiés',
    colorBorder: 'border-pink-500',
    colorAccent: 'text-pink-400',
    colorBg: 'from-pink-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#9d174d,0_0_25px_rgba(236,72,153,0.3)]',
    btnBg: 'bg-pink-500 text-slate-950',
    icon: '🧁',
  },
  {
    id: 'CE1',
    title: 'Boulangerie Néon',
    theme: 'Fractions d’un tout',
    colorBorder: 'border-cyan-400',
    colorAccent: 'text-cyan-400',
    colorBg: 'from-cyan-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#0e7490,0_0_25px_rgba(6,182,212,0.3)]',
    btnBg: 'bg-cyan-400 text-slate-950',
    icon: '🍰',
  },
  {
    id: 'CE2',
    title: 'Studio Rock',
    theme: 'Bandes & Égalités',
    colorBorder: 'border-amber-400',
    colorAccent: 'text-amber-400',
    colorBg: 'from-amber-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#a16207,0_0_25px_rgba(245,158,11,0.3)]',
    btnBg: 'bg-amber-400 text-slate-950',
    icon: '🎸',
  },
  {
    id: 'CM1',
    title: 'Arène Cyber',
    theme: 'Fractions > 1 & Décimales',
    colorBorder: 'border-purple-400',
    colorAccent: 'text-purple-400',
    colorBg: 'from-purple-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#7e22ce,0_0_25px_rgba(168,85,247,0.3)]',
    btnBg: 'bg-purple-400 text-slate-950',
    icon: '⚡',
  },
  {
    id: 'CM2',
    title: 'Stade Électro',
    theme: 'Quantités & Multiples',
    colorBorder: 'border-emerald-400',
    colorAccent: 'text-emerald-400',
    colorBg: 'from-emerald-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#065f46,0_0_25px_rgba(52,211,153,0.3)]',
    btnBg: 'bg-emerald-400 text-slate-950',
    icon: '🏟️',
  },
  {
    id: '6E',
    title: 'Académie Galaxie',
    theme: 'Nombres Décimaux',
    colorBorder: 'border-rose-400',
    colorAccent: 'text-rose-400',
    colorBg: 'from-rose-950/60 via-slate-900 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#9f1239,0_0_25px_rgba(244,63,94,0.3)]',
    btnBg: 'bg-rose-400 text-slate-950',
    icon: '🌌',
  },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  profile,
  onPlayLevel,
}) => {
  return (
    <div className="w-full flex flex-col items-center font-display">
      {/* 6 Level Cards: 1-CLICK DIRECT PLAY! */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-4">
        {WORLDS.map((w) => {
          const stars = profile.starsPerLevel[w.id] || 0;

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onPlayLevel(w.id)}
              className={`group p-3 sm:p-4 rounded-3xl border-[3.5px] cursor-pointer transition-all bg-gradient-to-b ${w.colorBg} ${w.colorBorder} ${w.shadow3D} flex flex-col justify-between text-left hover:brightness-115 active:translate-y-1.5 active:shadow-[0_2px_0_rgba(0,0,0,0.8)]`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-3xl sm:text-4xl drop-shadow-md group-hover:scale-110 transition-transform">
                    {w.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-950 border-2 border-white/20 text-white font-mono shadow-sm">
                    {w.id}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors">
                  {w.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 sm:mt-1 font-semibold line-clamp-1">{w.theme}</p>
              </div>

              {/* Bottom: Stars & Big Instant Play Button */}
              <div className="mt-3 pt-2 border-t border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-yellow-400 shrink-0">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${
                          s <= stars ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-slate-700 stroke-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-yellow-400/90 drop-shadow">
                    {stars}/3
                  </span>
                </div>

                <div className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-black text-xs sm:text-sm ${w.btnBg} shadow-md group-hover:scale-[1.02] active:scale-95 transition-transform`}>
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>JOUER</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
