import React, { useState } from 'react';
import { PlayerProfile, SchoolLevel } from '../types/game';
import { AVATARS } from '../data/characters';
import { User, Plus, Check, Trash2, X } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, avatarId: number, level: SchoolLevel) => void;
  onDeleteProfile: (id: string) => void;
  onClose: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>('CE1');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    onCreateProfile(clean, selectedAvatar, selectedLevel);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-display">
              Profils des Musiciens
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {!isCreating ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2.5">
                {profiles.map((p) => {
                  const avatar = AVATARS[p.avatarId] || AVATARS[0];
                  const isActive = p.id === activeProfileId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProfile(p.id)}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar Badge with real animal illustration */}
                        <div
                          className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-slate-700 bg-slate-800 flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: avatar.avatarColor }}
                        >
                          <img
                            src={avatar.imageSrc}
                            alt={avatar.animal}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-display text-base">
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                Actif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span>Niveau {p.selectedLevel}</span>
                            <span>·</span>
                            <span>{p.coins} pièces</span>
                            <span>·</span>
                            <span>{p.unlockedCharacters.length} gâteaux</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        ) : (
                          profiles.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProfile(p.id);
                              }}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Supprimer ce profil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                Créer un nouveau profil
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Prénom ou Pseudo du joueur
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="Ex: Zoé, Lucas, ChocoRider..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choisis ton avatar animal kawaï
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all ${
                        selectedAvatar === av.id
                          ? 'border-yellow-400 bg-yellow-400/20 shadow-md scale-105'
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-slate-700 bg-slate-800 flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: av.avatarColor }}
                      >
                        <img
                          src={av.imageSrc}
                          alt={av.animal}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 mt-1 truncate max-w-full">
                        {av.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Niveau scolaire
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {(['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6E'] as SchoolLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        selectedLevel === lvl
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-sm font-bold shadow-md disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
