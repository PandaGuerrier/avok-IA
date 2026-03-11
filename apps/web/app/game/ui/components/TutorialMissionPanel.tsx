import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { router } from '@inertiajs/react'

interface StepConfig {
  title: string
  hint: string
  actions: { key: string; label: string; done: boolean }[]
  completionText: string
  nextUrl?: string
  nextLabel?: string
}

interface TutorialMissionPanelProps {
  gameUuid: string
  step: 0 | 1 | 2 | 3 | 4
  interrogated: boolean
  usedProof: boolean
  instaPostAlibi: boolean
  instaConvAlibi: boolean
  mailAlibi: boolean
  usedAlibi: boolean
  usedCustomChoice: boolean
  page: 'game' | 'instagrume' | 'jaimail' | 'notetrack'
}

export default function TutorialMissionPanel({
  gameUuid,
  step,
  interrogated,
  usedProof,
  instaPostAlibi,
  instaConvAlibi,
  mailAlibi,
  usedAlibi,
  usedCustomChoice,
  page,
}: TutorialMissionPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [completionShown, setCompletionShown] = useState<number | null>(null)

  const stepConfigs: Record<number, StepConfig> = {
    0: {
      title: "L'interrogatoire",
      hint: 'Interroge un contact, puis utilise une preuve avant de répondre.',
      actions: [
        { key: 'interrogated', label: 'Interroger un contact', done: interrogated },
        { key: 'usedProof', label: 'Utiliser une preuve', done: usedProof },
      ],
      completionText: "Tu as interrogé un contact et utilisé une preuve. Il est temps d'explorer Instagrume.",
      nextUrl: `/game/${gameUuid}/instagrume`,
      nextLabel: 'Aller sur Instagrume',
    },
    1: {
      title: 'Instagrume',
      hint: 'Crée un alibi depuis un post ET depuis une conversation.',
      actions: [
        { key: 'instaPostAlibi', label: 'Créer un alibi depuis un post', done: instaPostAlibi },
        { key: 'instaConvAlibi', label: 'Créer un alibi depuis une conv.', done: instaConvAlibi },
      ],
      completionText: 'Tu as sauvegardé des alibis depuis Instagrume. Explore maintenant ta boîte mail.',
      nextUrl: `/game/${gameUuid}/jaimail`,
      nextLabel: 'Aller sur Jaimail',
    },
    2: {
      title: 'Jaimail',
      hint: "Ouvre un email et utilise-le comme alibi.",
      actions: [
        { key: 'mailAlibi', label: 'Créer un alibi depuis un email', done: mailAlibi },
      ],
      completionText: 'Tu as sauvegardé un alibi depuis ta boîte mail. Retourne au Tribunal pour finir.',
      nextUrl: `/game/${gameUuid}`,
      nextLabel: 'Retourner au Tribunal',
    },
    3: {
      title: 'Retour au Tribunal',
      hint: "Sélectionne un alibi et envoie une réponse personnalisée.",
      actions: [
        { key: 'usedAlibi', label: 'Utiliser un alibi dans une réponse', done: usedAlibi },
        { key: 'usedCustomChoice', label: 'Envoyer un choix personnalisé', done: usedCustomChoice },
      ],
      completionText: "Bravo ! Tu maîtrises l'interrogatoire. Toutes les apps sont désormais débloquées.",
      nextUrl: undefined,
      nextLabel: undefined,
    },
  }

  const config = step < 4 ? stepConfigs[step] : null
  const allDone = config ? config.actions.every((a) => a.done) : false

  // Show completion modal when step just completed — hooks MUST come before any early return
  useEffect(() => {
    if (config && allDone && completionShown !== step) {
      setCompletionShown(step)
    }
  }, [allDone, step])

  const showCompletionModal = completionShown === step && allDone

  // Don't render panel content if tutorial is done or config is missing
  if (!config) return null

  return (
    <>
      {/* Global tutorial glow CSS */}
      <style>{`
        @keyframes tuto-glow-pulse {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(6,182,212,0.55), 0 0 20px 4px rgba(6,182,212,0.22); border-color: rgba(6,182,212,0.7); }
          50%       { box-shadow: 0 0 18px 6px rgba(6,182,212,0.9), 0 0 45px 10px rgba(6,182,212,0.4); border-color: rgba(6,182,212,1); }
        }
        .tutorial-glow {
          animation: tuto-glow-pulse 1.4s ease-in-out infinite !important;
          border-color: rgba(6,182,212,0.7) !important;
          outline: none !important;
          position: relative;
          z-index: 1;
        }
        .tutorial-glow::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          border: 2px solid rgba(6,182,212,0.5);
          animation: tuto-glow-pulse 1.4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Floating mission panel */}
      <div className="fixed bottom-4 right-4 z-40 w-72 rounded-2xl border border-cyan-500/20 bg-gray-950/95 backdrop-blur-sm shadow-xl text-white overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              ÉTAPE {step + 1}/4
            </span>
            <span className="text-xs text-white/60">— {config.title}</span>
          </div>
          {collapsed ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
        </button>

        {!collapsed && (
          <div className="px-4 py-3 space-y-3">
            {/* Checklist */}
            <div className="space-y-2">
              {config.actions.map((action) => (
                <div key={action.key} className="flex items-center gap-2.5">
                  {action.done ? (
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                  ) : (
                    <Circle size={15} className="text-white/20 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${action.done ? 'line-through text-white/40' : 'text-white/80'}`}
                  >
                    {action.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Hint */}
            {!allDone && (
              <>
                <div className="border-t border-white/10" />
                <p className="text-xs text-white/40 leading-relaxed">{config.hint}</p>
              </>
            )}

            {/* Completed state */}
            {allDone && (
              <div className="text-center">
                <p className="text-xs text-cyan-400 font-medium">✅ Étape terminée !</p>
                {config.nextUrl && (
                  <button
                    onClick={() => router.visit(config.nextUrl!)}
                    className="mt-2 w-full px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                  >
                    {config.nextLabel} →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen completion modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 text-center px-10 py-12 rounded-3xl bg-gray-900 border border-cyan-500/20 shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="text-2xl font-black text-white mb-3">
                Étape {step + 1} terminée !
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">{config.completionText}</p>
            </div>
            {config.nextUrl ? (
              <button
                onClick={() => {
                  setCompletionShown(null)
                  router.visit(config.nextUrl!)
                }}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors"
              >
                {config.nextLabel} →
              </button>
            ) : (
              <button
                onClick={() => setCompletionShown(null)}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors"
              >
                Continuer l'interrogatoire
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
