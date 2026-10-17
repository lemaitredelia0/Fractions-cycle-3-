import React from 'react';

export const ArcadeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Base High-Definition Anime Concert Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-85 transition-opacity duration-700 scale-105"
        style={{
          backgroundImage: `url('/src/assets/images/colorful_addictive_neon_stage_1791396853884.jpg')`,
        }}
      />

      {/* 2. Vibrant Color Overlays (Addictive Neon Gradient Bloom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

      {/* Top-left Pink Neon Flare */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-500/30 blur-3xl animate-laser-glow" />

      {/* Top-right Cyan Neon Flare */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/30 blur-3xl animate-laser-glow"
        style={{ animationDelay: '-2s' }}
      />

      {/* Center Violet Beam */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-purple-600/25 blur-3xl animate-laser-glow"
        style={{ animationDelay: '-4s' }}
      />

      {/* Bottom Golden Glow */}
      <div className="absolute -bottom-20 inset-x-0 h-64 bg-gradient-to-t from-amber-500/20 via-rose-500/10 to-transparent blur-2xl" />

      {/* 3. Floating Candy Bokeh Bubbles (Smooth & Addictive) */}
      <div className="absolute inset-0">
        <div
          className="absolute top-[20%] left-[10%] w-6 h-6 rounded-full bg-pink-400/50 blur-xs animate-float-bokeh"
          style={{ animationDuration: '6s', animationDelay: '0s' }}
        />
        <div
          className="absolute top-[35%] right-[15%] w-8 h-8 rounded-full bg-cyan-300/50 blur-xs animate-float-bokeh"
          style={{ animationDuration: '7s', animationDelay: '-2s' }}
        />
        <div
          className="absolute top-[60%] left-[18%] w-5 h-5 rounded-full bg-yellow-300/50 blur-xs animate-float-bokeh"
          style={{ animationDuration: '5.5s', animationDelay: '-3.5s' }}
        />
        <div
          className="absolute top-[45%] right-[25%] w-7 h-7 rounded-full bg-purple-400/40 blur-xs animate-float-bokeh"
          style={{ animationDuration: '8s', animationDelay: '-1s' }}
        />
        <div
          className="absolute top-[15%] right-[35%] w-4 h-4 rounded-full bg-rose-300/60 blur-xs animate-float-bokeh"
          style={{ animationDuration: '6.5s', animationDelay: '-4s' }}
        />
        <div
          className="absolute top-[75%] right-[10%] w-6 h-6 rounded-full bg-amber-400/40 blur-xs animate-float-bokeh"
          style={{ animationDuration: '7.5s', animationDelay: '-2.5s' }}
        />
      </div>

      {/* 4. Subtle Radial Vignette to keep central cakes in razor-sharp focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.1)_0%,rgba(2,6,23,0.85)_85%)]" />
    </div>
  );
};
