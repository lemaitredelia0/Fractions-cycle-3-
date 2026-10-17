import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, UploadCloud, RotateCcw, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface GitStatus {
  hasChanges: boolean;
  changedFiles: string[];
  unpushedCommits?: string[];
}

export const DevPreviewModal: React.FC = () => {
  // Never show in production build (e.g. Netlify)
  if (!import.meta.env.DEV) {
    return null;
  }

  const [status, setStatus] = useState<GitStatus | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>('feat: mise à jour validée depuis preview');

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/git/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        // If there are changes and modal was minimized, expand it so user notices
        if (data.hasChanges && !isPushing && !isDiscarding) {
          setIsMinimized(false);
          setIsOpen(true);
        }
      }
    } catch {
      // Backend might be restarting
    }
  }, [isPushing, isDiscarding]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handlePush = async () => {
    if (isPushing) return;
    setIsPushing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage || 'feat: mise à jour validée depuis preview' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: '🚀 Modifications poussées sur Git ! Netlify a démarré le déploiement en direct.',
        });
        await checkStatus();
        setTimeout(() => {
          setFeedback(null);
          setIsMinimized(true);
        }, 4000);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Erreur lors du push sur Git.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Impossible de joindre le serveur.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleDiscard = async () => {
    if (isDiscarding) return;
    const confirmDiscard = window.confirm(
      'Voulez-vous vraiment abandonner toutes les modifications non déployées et revenir à la version précédente ?'
    );
    if (!confirmDiscard) return;

    setIsDiscarding(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/git/discard', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: 'Modifications annulées. Rechargement...',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setFeedback({
          type: 'error',
          message: data.error || "Erreur lors de l'abandon des modifications.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Impossible de joindre le serveur.',
      });
    } finally {
      setIsDiscarding(false);
    }
  };

  // If no changes and minimized, render a discreet floating pill in the corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 font-mono text-xs font-black shadow-xl backdrop-blur-md transition-all cursor-pointer ${
            status?.hasChanges
              ? 'bg-amber-500/90 hover:bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title="Ouvrir la fenêtre de déploiement Git / Netlify"
        >
          <GitBranch className="w-4 h-4" />
          <span>{status?.hasChanges ? '⚡ Déployer sur Git ?' : 'Git Preview'}</span>
          <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Contrôle de déploiement Git Preview"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:w-[420px] z-50 rounded-3xl bg-slate-950/95 border-[3px] border-cyan-400 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl p-4 text-white font-sans transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-black text-sm tracking-tight text-cyan-300 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Mode Preview : Validation
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Réduire"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body content */}
      <div className="pt-3 pb-1 space-y-3">
        {status?.hasChanges ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <span className="font-bold text-amber-300">Modifications prêtes à être testées !</span>
              <p className="text-slate-300 mt-0.5">
                Testez le jeu ci-dessus dans la Preview. Si le résultat vous convient, cliquez sur <b>Push sur Git</b> pour lancer le déploiement Netlify.
              </p>
              {status.changedFiles.length > 0 && (
                <div className="mt-1.5 font-mono text-[11px] text-amber-400/90 max-h-16 overflow-y-auto">
                  {status.changedFiles.map((f, i) => (
                    <div key={i} className="truncate">📁 {f}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-semibold">
              Votre projet est 100% à jour avec GitHub et Netlify.
            </span>
          </div>
        )}

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-400 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Buttons: PUSH SUR GIT ou ABANDONNER */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handlePush}
            disabled={isPushing || isDiscarding || !status?.hasChanges}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
              status?.hasChanges
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isPushing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span>Push sur Git</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDiscard}
            disabled={isPushing || isDiscarding || !status?.hasChanges}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
              status?.hasChanges
                ? 'bg-slate-900 border-2 border-rose-500/60 text-rose-300 hover:bg-rose-950/60 hover:border-rose-400 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isDiscarding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Annulation...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Abandonner</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
