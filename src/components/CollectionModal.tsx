import React, { useState } from 'react';
import { PlayerProfile, CharacterRarity, PastryCharacter } from '../types/game';
import { PASTRY_CHARACTERS } from '../data/characters';
import { rockSynth } from '../audio/rockSynth';
import { X, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CollectionModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onClose: () => void;
}

const RARITY_META: Record<
  CharacterRarity,
  { label: string; border: string; bg: string; text: string; coinRefund: number; icon: string }
> = {
  commune: {
    label: 'Commune',
    border: 'border-slate-500',
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    coinRefund: 30,
    icon: '●',
  },
  rare: {
    label: 'Rare',
    border: 'border-cyan-400',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-300',
    coinRefund: 60,
    icon: '◆',
  },
  epique: {
    label: 'Épique',
    border: 'border-purple-400',
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    coinRefund: 120,
    icon: '★',
  },
  legendaire: {
    label: 'Légendaire',
    border: 'border-yellow-400',
    bg: 'bg-yellow-950/60',
    text: 'text-yellow-300',
    coinRefund: 250,
    icon: '👑',
  },
};

export const CollectionModal: React.FC<CollectionModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | CharacterRarity>('all');
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [packResults, setPackResults] = useState<
    { character: PastryCharacter; isDuplicate: boolean; refund: number }[] | null
  >(null);

  const BOOSTER_COST = 100;
  const canAfford = profile.coins >= BOOSTER_COST;

  const unlockedSet = new Set(profile.unlockedCharacters);
  const unlockedCount = profile.unlockedCharacters.length;

  const filteredCharacters = PASTRY_CHARACTERS.filter((char) => {
    if (activeTab === 'all') return true;
    return char.rarity === activeTab;
  });

  const handleOpenBooster = () => {
    if (!canAfford || isOpeningPack) return;

    rockSynth.playFreeze();
    setIsOpeningPack(true);

    // Pick 3 random cards based on weighted rarity
    const drawOneCard = (): PastryCharacter => {
      const roll = Math.random() * 100;
      let targetRarity: CharacterRarity = 'commune';
      if (roll < 3) targetRarity = 'legendaire';
      else if (roll < 15) targetRarity = 'epique';
      else if (roll < 40) targetRarity = 'rare';
      else targetRarity = 'commune';

      const pool = PASTRY_CHARACTERS.filter((c) => c.rarity === targetRarity);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const drawnCards = [drawOneCard(), drawOneCard(), drawOneCard()];

    setTimeout(() => {
      let coinsRefundTotal = 0;
      const newUnlockedIds: number[] = [];

      const results = drawnCards.map((card) => {
        const isDuplicate = unlockedSet.has(card.id);
        const refund = isDuplicate ? RARITY_META[card.rarity].coinRefund : 0;
        if (isDuplicate) {
          coinsRefundTotal += refund;
        } else {
          newUnlockedIds.push(card.id);
        }
        return { character: card, isDuplicate, refund };
      });

      // SFX according to best rarity in pack
      const hasLegendary = drawnCards.some((c) => c.rarity === 'legendaire');
      const hasEpic = drawnCards.some((c) => c.rarity === 'epique');
      rockSynth.playBoosterReveal(hasLegendary ? 'legendaire' : hasEpic ? 'epique' : 'rare');

      confetti({
        particleCount: hasLegendary ? 100 : 50,
        spread: 60,
        origin: { y: 0.5 },
      });

      // Update player profile
      onUpdateProfile((prev) => {
        const updatedUnlocked = Array.from(new Set([...prev.unlockedCharacters, ...newUnlockedIds]));
        return {
          ...prev,
          coins: prev.coins - BOOSTER_COST + coinsRefundTotal,
          unlockedCharacters: updatedUnlocked,
        };
      });

      setPackResults(results);
      setIsOpeningPack(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white font-display">
              Collection des 40 Rockstars Pâtissières
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-cyan-800/80">
              {unlockedCount} / 40 Découverts
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm">
              <span>🪙</span>
              <span>{profile.coins} pièces</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booster Pack Shop Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-pink-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shrink-0">
              🎁
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display">
                Booster Rockstar (3 Gâteaux Aléatoires)
              </h4>
              <p className="text-xs text-slate-400">
                Chaque doublon est automatiquement échangé contre des pièces !
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenBooster}
            disabled={!canAfford || isOpeningPack}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 whitespace-nowrap ${
              canAfford && !isOpeningPack
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isOpeningPack ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Ouverture...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Ouvrir un Booster (100 🪙)
              </span>
            )}
          </button>
        </div>

        {/* Booster Reveal Modal Overlay */}
        {packResults && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center animate-in fade-in duration-200">
            <h3 className="text-2xl font-black text-white font-display mb-2">
              Contenu de ton Booster !
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Découvre les 3 gâteaux rockstars tirés au sort.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-6">
              {packResults.map((item, idx) => {
                const meta = RARITY_META[item.character.rarity];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center bg-slate-900 ${meta.border} shadow-xl`}
                  >
                    <div className="text-4xl mb-2">{item.character.emoji}</div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${meta.text}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <h5 className="text-sm font-bold text-white mb-0.5">{item.character.name}</h5>
                    <span className="text-[11px] text-slate-400 mb-2">{item.character.instrument}</span>

                    {item.isDuplicate ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Doublon : +{item.refund} 🪙
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✨ NOUVEAU !
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setPackResults(null)}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm"
            >
              Ajouter à mon album
            </button>
          </div>
        )}

        {/* Rarity Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tous (40)
          </button>
          <button
            onClick={() => setActiveTab('commune')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'commune'
                ? 'bg-slate-300 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Communes (20)
          </button>
          <button
            onClick={() => setActiveTab('rare')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'rare'
                ? 'bg-cyan-400 text-slate-900'
                : 'bg-slate-800 text-cyan-400/80 hover:text-white'
            }`}
          >
            Rares (12)
          </button>
          <button
            onClick={() => setActiveTab('epique')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'epique'
                ? 'bg-purple-400 text-slate-900'
                : 'bg-slate-800 text-purple-400/80 hover:text-white'
            }`}
          >
            Épiques (6)
          </button>
          <button
            onClick={() => setActiveTab('legendaire')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'legendaire'
                ? 'bg-yellow-400 text-slate-900'
                : 'bg-slate-800 text-yellow-400/80 hover:text-white'
            }`}
          >
            Légendaires (2)
          </button>
        </div>

        {/* 40 Characters Grid Album */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredCharacters.map((char) => {
            const isUnlocked = unlockedSet.has(char.id);
            const meta = RARITY_META[char.rarity];

            if (!isUnlocked) {
              return (
                <div
                  key={char.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center opacity-65"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl text-slate-600 mb-2">
                    🔒
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">#{char.id}</span>
                  <h6 className="text-xs font-semibold text-slate-400 mt-0.5">???</h6>
                  <span className="text-[10px] text-slate-600 mt-1">À trouver en booster</span>
                </div>
              );
            }

            return (
              <div
                key={char.id}
                className={`p-3.5 rounded-2xl border ${meta.border} ${meta.bg} flex flex-col items-center text-center shadow-md relative group`}
              >
                <div className="text-3xl mb-1.5">{char.emoji}</div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{char.id}</span>
                </div>
                <h6 className="text-xs md:text-sm font-bold text-white mt-0.5 font-display line-clamp-1">
                  {char.name}
                </h6>
                <span className="text-[11px] text-slate-300 font-medium line-clamp-1">
                  {char.instrument}
                </span>
                <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                  "{char.tagline}"
                </p>
                <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                  {char.flavor}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
