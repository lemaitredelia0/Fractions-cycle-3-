import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, LaneOption, SchoolLevel, PlayerProfile } from '../types/game';
import { generateQuestionForLevel } from '../data/curriculum';
import { CakeCanvas, isAdditionUnderOne, isComparisonVisual, isEquivalenceVisual } from './CakeCanvas';
import { ArcadeBackground } from './ArcadeBackground';
import { rockSynth } from '../audio/rockSynth';
import { Volume2, VolumeX, ArrowLeft, RotateCcw, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RhythmGameProps {
  level: SchoolLevel;
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onExitGame: () => void;
  onOpenShop: () => void;
}

const LANE_STYLES = [
  {
    key: 'D',
    symbol: '★',
    border: 'border-rose-500',
    shadow: 'shadow-[0_6px_0_#9f1239,0_0_22px_rgba(244,63,94,0.35)]',
    activeShadow: 'active:shadow-[0_2px_0_#9f1239]',
    gradient: 'from-rose-950/50 via-slate-900/90 to-slate-950',
    badgeBg: 'bg-rose-500 text-slate-950',
  },
  {
    key: 'F',
    symbol: '●',
    border: 'border-cyan-400',
    shadow: 'shadow-[0_6px_0_#0e7490,0_0_22px_rgba(6,182,212,0.35)]',
    activeShadow: 'active:shadow-[0_2px_0_#0e7490]',
    gradient: 'from-cyan-950/50 via-slate-900/90 to-slate-950',
    badgeBg: 'bg-cyan-400 text-slate-950',
  },
  {
    key: 'J',
    symbol: '▲',
    border: 'border-amber-400',
    shadow: 'shadow-[0_6px_0_#a16207,0_0_22px_rgba(245,158,11,0.35)]',
    activeShadow: 'active:shadow-[0_2px_0_#a16207]',
    gradient: 'from-amber-950/50 via-slate-900/90 to-slate-950',
    badgeBg: 'bg-amber-400 text-slate-950',
  },
  {
    key: 'K',
    symbol: '■',
    border: 'border-purple-400',
    shadow: 'shadow-[0_6px_0_#7e22ce,0_0_22px_rgba(168,85,247,0.35)]',
    activeShadow: 'active:shadow-[0_2px_0_#7e22ce]',
    gradient: 'from-purple-950/50 via-slate-900/90 to-slate-950',
    badgeBg: 'bg-purple-400 text-slate-950',
  },
];

export const RhythmGame: React.FC<RhythmGameProps> = ({
  level,
  profile,
  onUpdateProfile,
  onExitGame,
  onOpenShop,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestionForLevel(level));
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [activeLanePress, setActiveLanePress] = useState<number | null>(null);
  const [roundOver, setRoundOver] = useState<boolean>(false);
  const [colorblind, setColorblind] = useState<boolean>(profile.colorblindMode);
  const [soundMuted, setSoundMuted] = useState<boolean>(!profile.soundEnabled);

  // Clear answer feedback state
  const [answeredState, setAnsweredState] = useState<{
    laneIndex: number;
    isCorrect: boolean;
    points: number;
  } | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  const centerRef = useRef<HTMLDivElement>(null);
  const [maxCakeSize, setMaxCakeSize] = useState<number>(280);
  const isTransitioningRef = useRef<boolean>(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamically compute the maximum possible cake size based on available screen space
  useEffect(() => {
    const updateSize = () => {
      if (!centerRef.current) return;
      const rect = centerRef.current.getBoundingClientRect();
      const promptEl = centerRef.current.querySelector('h1');
      const promptH = promptEl ? promptEl.getBoundingClientRect().height : 45;
      // Account for explanation card and breathing space
      const explanationAllowance = answeredState !== null ? 65 : 15;
      const availH = Math.max(90, rect.height - promptH - explanationAllowance);
      const availW = Math.max(180, rect.width - 24);

      const isEq = Boolean(
        currentQuestion.visual?.isEquivalence || currentQuestion.visual?.equivalenceInfo
      );
      if (currentQuestion.visual?.multiCakes || isEq) {
        const numCakes = currentQuestion.visual?.multiCakes ? currentQuestion.visual.multiCakes.length : 2;
        const isComp = Boolean(currentQuestion.visual?.isComparison);
        const extraH = isComp || isEq ? 75 : 40;
        const gapAllowance = (numCakes - 1) * (isComp || isEq ? 40 : 54) + 24;
        const sizeByW = Math.floor((availW - gapAllowance) / numCakes);
        const sizeByH = Math.floor(availH - extraH);
        setMaxCakeSize(Math.max(80, Math.min(sizeByW, sizeByH, isComp || isEq ? 130 : 150)));
      } else if (currentQuestion.visual?.shape === 'bar') {
        // Bande-gâteau : doit être longue horizontalement sans déborder verticalement
        const barWidth = Math.min(availW, 700);
        setMaxCakeSize(Math.max(300, barWidth));
      } else {
        const size = Math.floor(Math.min(availW, availH, 220));
        setMaxCakeSize(Math.max(130, size));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [answeredState, currentQuestion]);

  // Start music
  useEffect(() => {
    if (profile.soundEnabled) {
      rockSynth.startMusic();
    }
    return () => {
      rockSynth.stopMusic();
    };
  }, [profile.soundEnabled]);

  // Sync mute
  useEffect(() => {
    rockSynth.setMute(soundMuted);
  }, [soundMuted]);

  // Finish round
  const finishRound = useCallback(() => {
    setRoundOver(true);
    rockSynth.stopMusic();
    rockSynth.playHit('perfect');

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#06b6d4', '#fbbf24', '#c084fc'],
    });

    let stars = 1;
    if (score >= 2500) stars = 3;
    else if (score >= 1200) stars = 2;

    const roundCoins = Math.floor(score / 50) + stars * 20;

    onUpdateProfile((prev) => {
      const prevStars = prev.starsPerLevel[level] || 0;
      const prevHigh = prev.highScores[level] || 0;
      return {
        ...prev,
        coins: prev.coins + roundCoins,
        highScores: {
          ...prev.highScores,
          [level]: Math.max(prevHigh, score),
        },
        starsPerLevel: {
          ...prev.starsPerLevel,
          [level]: Math.max(prevStars, stars),
        },
      };
    });
  }, [level, onUpdateProfile, score]);

  // Timer countdown: paused during solution reading so child can enjoy the explanation without rushing
  useEffect(() => {
    if (roundOver) return;
    const timer = setInterval(() => {
      // Pause countdown while solution feedback, animations & explanations are displayed
      if (isTimerPaused || isTransitioningRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishRound, isTimerPaused, roundOver]);

  // Next question
  const nextQuestion = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setAnsweredState(null);
    setIsTimerPaused(false);
    isTransitioningRef.current = false;
    setCurrentQuestion(generateQuestionForLevel(level));
  }, [level]);

  // Lane selection with vivid reward & feedback
  const handleLaneSelect = useCallback(
    (laneIndex: number) => {
      if (roundOver || isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      setActiveLanePress(laneIndex);
      setTimeout(() => setActiveLanePress(null), 180);

      // Direct bulletproof option retrieval by position with fallback
      const chosenOption = currentQuestion.options[laneIndex] || currentQuestion.options.find((opt) => opt.laneIndex === laneIndex);
      const isCorrect = chosenOption ? Boolean(chosenOption.isCorrect) : false;

      // Update adaptive stats
      onUpdateProfile((prev) => {
        const typeStats = prev.adaptiveStats[currentQuestion.type] || { correct: 0, attempts: 0 };
        return {
          ...prev,
          adaptiveStats: {
            ...prev.adaptiveStats,
            [currentQuestion.type]: {
              correct: typeStats.correct + (isCorrect ? 1 : 0),
              attempts: typeStats.attempts + 1,
            },
          },
        };
      });

      const isAdditionQuestion = Boolean(
        currentQuestion.visual && isAdditionUnderOne(currentQuestion.visual)
      );
      const isComparisonQuestion = Boolean(
        currentQuestion.visual && isComparisonVisual(currentQuestion.visual)
      );
      const isEquivalenceQuestion = Boolean(
        currentQuestion.visual && isEquivalenceVisual(currentQuestion.visual)
      );
      const isQuantityQuestion = Boolean(currentQuestion.visualQuantity);
      const hasDetailedAnimation =
        isAdditionQuestion || isComparisonQuestion || isEquivalenceQuestion || isQuantityQuestion;

      if (isCorrect) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        const multiplier = newCombo >= 10 ? 4 : newCombo >= 5 ? 3 : newCombo >= 2 ? 2 : 1;
        const pts = 200 * multiplier;

        // Animate score progression!
        setScore((prev) => prev + pts);
        setAnsweredState({ laneIndex, isCorrect: true, points: pts });

        rockSynth.playHit('perfect');

        // Confetti burst on the screen for instant joy
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7, x: 0.2 + laneIndex * 0.2 },
          colors: ['#34d399', '#facc15', '#22d3ee'],
        });
      } else {
        setCombo(0);
        setAnsweredState({ laneIndex, isCorrect: false, points: 0 });
        rockSynth.playHit('miss');
      }

      // Pause the round countdown so the child has all the time to read the solution!
      setIsTimerPaused(true);

      // Lengthen time to appreciate solution, watch transformation and read the explanation
      // 6500ms for questions with animations/visuals, 4500ms for text questions
      const delay = hasDetailedAnimation ? 6500 : (currentQuestion.explanation ? 4500 : 3500);
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTimerPaused(false);
        nextQuestion();
      }, delay);
    },
    [combo, currentQuestion, nextQuestion, onUpdateProfile, roundOver]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'd' || key === '1') handleLaneSelect(0);
      else if (key === 'f' || key === '2') handleLaneSelect(1);
      else if (key === 'j' || key === '3') handleLaneSelect(2);
      else if (key === 'k' || key === '4') handleLaneSelect(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLaneSelect]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    onUpdateProfile((prev) => ({ ...prev, soundEnabled: !next }));
  };

  const toggleColorblind = () => {
    const next = !colorblind;
    setColorblind(next);
    onUpdateProfile((prev) => ({ ...prev, colorblindMode: next }));
  };

  // Timer & Stars calculation
  const timerRatio = timeLeft / 120;
  const star1Unlocked = score >= 500;
  const star2Unlocked = score >= 1200;
  const star3Unlocked = score >= 2500;
  const starProgress = Math.min(100, (score / 2500) * 100);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none font-display">
      {/* Ultra-Colorful Addictive Anime Arcade Background */}
      <ArcadeBackground />

      {/* Discrete 3px top time progress line */}
      <div className="relative z-20 w-full h-1.5 bg-slate-900 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-yellow-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${timerRatio * 100}%` }}
        />
      </div>

      {/* Top Header: Navigation + VISIBLE SCORE PROGRESSION BAR */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-2 pb-1 flex items-center justify-between shrink-0">
        <button
          onClick={onExitGame}
          className="p-2.5 rounded-2xl bg-slate-900 border-2 border-slate-800 text-slate-300 hover:text-white transition-transform active:scale-90"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* PROMINENT ARCADE SCORE & STAR PROGRESSION */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            {/* Score Number with Glow */}
            <div className="flex items-baseline gap-1.5 px-4 py-1 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 shadow-[0_4px_0_#78350f,0_0_15px_rgba(245,158,11,0.2)]">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">Score</span>
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums drop-shadow">
                {score.toLocaleString('fr-FR')}
              </span>
            </div>

            {/* Combo Badge if active */}
            {combo > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 text-xs sm:text-sm font-black animate-bounce shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>x{combo >= 10 ? 4 : combo >= 5 ? 3 : 2} COMBO !</span>
              </div>
            )}
          </div>

          {/* Star Progression Gauge */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-base transition-transform ${star1Unlocked ? 'text-yellow-400 scale-125' : 'text-slate-700'}`}>
              ★
            </span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${starProgress}%` }}
              />
            </div>
            <span className={`text-base transition-transform ${star2Unlocked ? 'text-yellow-400 scale-125' : 'text-slate-700'}`}>
              ★
            </span>
            <span className={`text-base transition-transform ${star3Unlocked ? 'text-yellow-400 scale-125' : 'text-slate-700'}`}>
              ★
            </span>
          </div>
        </div>

        {/* Controls & Chrono Pause Indicator */}
        <div className="flex items-center gap-2">
          {isTimerPaused && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 text-xs sm:text-sm font-black animate-pulse shadow-md">
              <span>⏸️ Chrono en pause</span>
            </div>
          )}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-2xl bg-slate-900 border-2 border-slate-800 text-slate-300 hover:text-white transition-transform active:scale-90"
            aria-label="Son"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Central Zone: Consigne & GÂTEAU DE RÉFÉRENCE GÉANT (ZÉRO ENCADRÉ, MAXIMISÉ) */}
      <div
        ref={centerRef}
        className="relative z-20 w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col items-center justify-center min-h-0 text-center overflow-hidden"
      >
        {/* Consigne */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] mb-1 sm:mb-2 px-2 select-none shrink-0">
          {currentQuestion.prompt}
        </h1>

        {/* GÂTEAU DE RÉFÉRENCE GÉANT SANS AUCUN ENCADRÉ (FLOTTANT & TAILLE MAXIMALE) */}
        {currentQuestion.visual && (
          <div className="my-1 sm:my-2 flex items-center justify-center bg-transparent w-full">
            <CakeCanvas
              spec={currentQuestion.visual}
              size={maxCakeSize}
              colorblindMode={colorblind}
              animateAddition={answeredState !== null}
            />
          </div>
        )}

        {/* Visual quantity gâteaux : "Les gâteaux doivent être bien présentés en ligne superposées de même nombre pour faciliter le calcul" */}
        {currentQuestion.visualQuantity && (() => {
          const vq = currentQuestion.visualQuantity;
          const numLines = vq.numLines || vq.den || 3;
          const itemsPerLine = vq.itemsPerLine || Math.round(vq.totalItems / numLines);
          const targetNum = vq.num || 1;
          const isAnswered = answeredState !== null;

          // Responsive sizing based on total number of lines to avoid any overflow over answer pads
          const emojiSizeClass =
            numLines >= 5 || itemsPerLine >= 6
              ? 'text-xl sm:text-2xl'
              : numLines >= 4 || itemsPerLine >= 5
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-4xl';

          const rowPaddingClass =
            numLines >= 5 ? 'py-1 px-3' : numLines >= 4 ? 'py-1.5 px-3' : 'py-2 px-4';

          return (
            <div className="my-1 flex flex-col items-center justify-center gap-1 sm:gap-1.5 max-w-md sm:max-w-lg mx-auto w-full px-2">
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: numLines }).map((_, lineIdx) => {
                  const isTargetLine = isAnswered && lineIdx < targetNum;
                  return (
                    <div
                      key={lineIdx}
                      className={`flex items-center justify-center w-full rounded-2xl transition-all duration-300 ${rowPaddingClass} ${
                        isTargetLine
                          ? 'bg-emerald-950/70 border-2 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)] scale-[1.02]'
                          : isAnswered
                          ? 'opacity-40 bg-slate-900/30 border border-slate-700/30'
                          : 'bg-slate-900/40 border border-slate-700/60'
                      }`}
                    >
                      {/* Gâteaux alignés en rangées superposées de même nombre, sans libellés parasites */}
                      <div className="w-full flex items-center justify-evenly gap-1.5 sm:gap-3">
                        {Array.from({ length: itemsPerLine }).map((_, itemIdx) => (
                          <span
                            key={itemIdx}
                            className={`transition-all duration-300 ${emojiSizeClass} ${
                              isTargetLine
                                ? 'scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse'
                                : 'drop-shadow-md'
                            }`}
                            role="img"
                            aria-label="Gâteau"
                          >
                            🧁
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explication agrandie du calcul de la quantité lors de la solution */}
              {isAnswered && (
                <div className="mt-1 w-full max-w-md px-3.5 py-1.5 sm:py-2 rounded-2xl bg-slate-900/95 border-2 border-emerald-400 text-center shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-sm sm:text-base md:text-lg font-black text-emerald-300 tracking-tight">
                    ⭐ {targetNum} {targetNum > 1 ? 'lignes' : 'ligne'} de {itemsPerLine} = {targetNum * itemsPerLine} gâteaux au total !
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-100/90 font-bold mt-0.5">
                    ({vq.totalItems} ÷ {numLines} = {itemsPerLine} par ligne × {targetNum} = {targetNum * itemsPerLine} gâteaux)
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Bannière d'explication pédagogique détaillée lors de la solution */}
        {answeredState !== null && currentQuestion.explanation && !currentQuestion.visualQuantity && (
          <div className="my-1.5 max-w-xl mx-auto px-4 py-1.5 sm:py-2 rounded-2xl bg-slate-900/95 border-2 border-emerald-400 text-center shadow-[0_0_20px_rgba(52,211,153,0.35)] animate-in fade-in zoom-in-95 duration-200 shrink-0">
            <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5 mb-0.5">
              <span>💡 EXPLICATION</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                Chrono en pause
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Zone: 4 PROPOSITIONS MAXIMALES (ZÉRO ICÔNE, TAILLE MAXIMALE) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-3 pb-3 pt-1 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {currentQuestion.options.map((option: LaneOption, laneIdx: number) => {
            const lane = LANE_STYLES[laneIdx];
            const isAnswered = answeredState !== null && answeredState.laneIndex === laneIdx;
            const isSuccess = isAnswered && answeredState.isCorrect;
            const isFailure = isAnswered && !answeredState.isCorrect;
            const isPressed = activeLanePress === laneIdx;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleLaneSelect(laneIdx)}
                className={`relative group w-full min-h-[95px] sm:min-h-[115px] md:min-h-[135px] p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-[3.5px] bg-gradient-to-b transition-all cursor-pointer flex items-center justify-center ${
                  isSuccess
                    ? 'border-emerald-400 bg-gradient-to-b from-emerald-600 via-emerald-800 to-slate-950 shadow-[0_8px_0_#065f46,0_0_45px_rgba(52,211,153,0.9)] scale-105 z-30'
                    : isFailure
                    ? 'border-rose-400 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 shadow-[0_6px_0_#881337] scale-95 opacity-80'
                    : `${lane.border} ${lane.gradient} ${lane.shadow} ${lane.activeShadow} ${
                        isPressed ? 'translate-y-1' : 'hover:brightness-115'
                      }`
                }`}
              >
                {/* Central Proposition Content: TAILLE MAXIMALE SANS AUCUNE ICÔNE */}
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  {option.cake ? (
                    <div className="w-full flex flex-col items-center justify-center">
                      <CakeCanvas
                        spec={option.cake}
                        size={95}
                        colorblindMode={colorblind}
                        className="bg-transparent border-none p-0 shadow-none"
                      />
                      {option.text && (
                        <span className="mt-0.5 text-sm sm:text-base md:text-lg font-black text-white text-center leading-tight drop-shadow">
                          {option.text}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white text-center tracking-tight leading-tight px-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {option.text}
                    </span>
                  )}

                  {/* VIVID SUCCESS FEEDBACK BANNER OVERLAY */}
                  {isSuccess && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 rounded-2xl backdrop-blur-xs animate-in zoom-in-95 duration-150">
                      <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center mb-1 shadow-lg">
                        <Check className="w-7 h-7 stroke-[3.5]" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-emerald-200 uppercase tracking-wider drop-shadow">
                        BRAVO !
                      </span>
                      <span className="text-sm sm:text-base font-black text-yellow-300">
                        +{answeredState.points} pts
                      </span>
                    </div>
                  )}

                  {/* GENTLE RETRY FEEDBACK OVERLAY */}
                  {isFailure && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/85 rounded-2xl animate-in fade-in duration-150">
                      <span className="text-base sm:text-lg font-black text-rose-300">
                        Presque !
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round End Modal */}
      {roundOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border-4 border-yellow-400 shadow-[0_10px_0_#78350f,0_0_40px_rgba(250,204,21,0.4)] flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-4xl text-yellow-400 drop-shadow-md">
              {[1, 2, 3].map((s) => (
                <span key={s}>★</span>
              ))}
            </div>

            <div className="mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Total</span>
              <div className="text-3xl font-black text-yellow-300 drop-shadow">{score} pts</div>
            </div>

            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  setRoundOver(false);
                  setScore(0);
                  setCombo(0);
                  setTimeLeft(120);
                  nextQuestion();
                  rockSynth.startMusic();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-400 text-slate-950 font-black text-lg shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-[0_2px_0_#9f1239] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 stroke-[3]" />
                REJOUER
              </button>
              <button
                onClick={onOpenShop}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-sm border-2 border-slate-700 shadow-[0_4px_0_#0f172a] active:translate-y-1 cursor-pointer"
              >
                Collection
              </button>
              <button
                onClick={onExitGame}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Menu principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
