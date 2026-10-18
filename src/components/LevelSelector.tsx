import React from 'react';
import { SchoolLevel, PlayerProfile } from '../types/game';
import { Star } from 'lucide-react';
import { LEVEL_BACKGROUNDS } from '../data/levelBackgrounds';

interface LevelSelectorProps {
  currentLevel?: SchoolLevel;
  profile: PlayerProfile;
  onPlayLevel: (level: SchoolLevel) => void;
  onHoverLevel?: (level: SchoolLevel | null) => void;
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
  bgImage: string;
}

const WORLDS: WorldMeta[] = [
  {
    id: 'CP',
    title: 'Village Pastel',
    theme: 'Partages & Moitiés',
    colorBorder: 'border-pink-500',
    colorAccent: 'text-pink-400',
    colorBg: 'from-pink-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#9d174d,0_0_25px_rgba(236,72,153,0.3)]',
    btnBg: 'bg-pink-500 text-slate-950',
    icon: '🧁',
    bgImage: LEVEL_BACKGROUNDS.CP.imageSrc,
  },
  {
    id: 'CE1',
    title: 'Boulangerie Néon',
    theme: 'Fractions d’un tout',
    colorBorder: 'border-cyan-400',
    colorAccent: 'text-cyan-400',
    colorBg: 'from-cyan-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#0e7490,0_0_25px_rgba(6,182,212,0.3)]',
    btnBg: 'bg-cyan-400 text-slate-950',
    icon: '🍰',
    bgImage: LEVEL_BACKGROUNDS.CE1.imageSrc,
  },
  {
    id: 'CE2',
    title: 'Studio Rock',
    theme: 'Bandes & Égalités',
    colorBorder: 'border-amber-400',
    colorAccent: 'text-amber-400',
    colorBg: 'from-amber-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#a16207,0_0_25px_rgba(245,158,11,0.3)]',
    btnBg: 'bg-amber-400 text-slate-950',
    icon: '🎸',
    bgImage: LEVEL_BACKGROUNDS.CE2.imageSrc,
  },
  {
    id: 'CM1',
    title: 'Arène Cyber',
    theme: 'Fractions > 1 & Décimales',
    colorBorder: 'border-purple-400',
    colorAccent: 'text-purple-400',
    colorBg: 'from-purple-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#7e22ce,0_0_25px_rgba(168,85,247,0.3)]',
    btnBg: 'bg-purple-400 text-slate-950',
    icon: '⚡',
    bgImage: LEVEL_BACKGROUNDS.CM1.imageSrc,
  },
  {
    id: 'CM2',
    title: 'Stade Électro',
    theme: 'Quantités & Multiples',
    colorBorder: 'border-emerald-400',
    colorAccent: 'text-emerald-400',
    colorBg: 'from-emerald-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#065f46,0_0_25px_rgba(52,211,153,0.3)]',
    btnBg: 'bg-emerald-400 text-slate-950',
    icon: '🏟️',
    bgImage: LEVEL_BACKGROUNDS.CM2.imageSrc,
  },
  {
    id: '6E',
    title: 'Académie Galaxie',
    theme: 'Nombres Décimaux',
    colorBorder: 'border-rose-400',
    colorAccent: 'text-rose-400',
    colorBg: 'from-rose-950/70 via-slate-900/90 to-slate-950',
    shadow3D: 'shadow-[0_8px_0_#9f1239,0_0_25px_rgba(244,63,94,0.3)]',
    btnBg: 'bg-rose-400 text-slate-950',
    icon: '🌌',
    bgImage: LEVEL_BACKGROUNDS['6E'].imageSrc,
  },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  profile,
  onPlayLevel,
  onHoverLevel,
}) => {
  return (
    <div className="w-full flex flex-col items-center font-display">
      {/* 6 Level Cards: Compact, Full-Card Clickable! */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-2">
        {WORLDS.map((w) => {
          const stars = profile.starsPerLevel[w.id] || 0;

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onPlayLevel(w.id)}
              onMouseEnter={() => onHoverLevel?.(w.id)}
              onMouseLeave={() => onHoverLevel?.(null)}
              className={`group relative overflow-hidden p-3.5 sm:p-4 rounded-3xl border-[3.5px] cursor-pointer transition-all ${w.colorBorder} ${w.shadow3D} flex flex-col justify-between text-left hover:brightness-115 active:translate-y-1.5 active:shadow-[0_2px_0_rgba(0,0,0,0.8)] min-h-[140px] sm:min-h-[160px]`}
            >
              {/* Full-bleed Themed Background Artwork */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 transition-all duration-700 ease-out group-hover:scale-108"
                style={{ backgroundImage: `url('${w.bgImage}')` }}
              />
              {/* Vibrant tint & gradient for crisp contrast and arcade mood */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />

              {/* Card top: Emoji Icon & Level Tag */}
              <div className="relative z-10 w-full flex items-center justify-between mb-2">
                <span className="text-3xl sm:text-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform">
                  {w.icon}
                </span>
                <span className="text-xs sm:text-sm font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-950/90 border-2 border-white/20 text-white font-mono shadow-sm">
                  {w.id}
                </span>
              </div>

              {/* Card middle: Title & Curriculum Theme */}
              <div className="relative z-10 w-full my-auto">
                <h4 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {w.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-semibold line-clamp-1 drop-shadow">
                  {w.theme}
                </p>
              </div>

              {/* Bottom: Stars & Score without bulky Play button */}
              <div className="relative z-10 mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-yellow-400 shrink-0">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${
                        s <= stars
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                          : 'text-slate-600 stroke-slate-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-mono font-black text-yellow-400 drop-shadow">
                  {stars}/3
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
