import { RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import type ChoiceData from '#game/types/choices'
import { useTutorialStore } from '#game/ui/store/tutorialStore'

interface ChoicesBarProps {
  choices: ChoiceData[]
  loading: boolean
  regenerating: boolean
  isPaused: boolean
  selectedProofUuids: string[]
  selectedAlibiUuids: string[]
  onChoice: (choice: ChoiceData) => void
  onRegenerate: () => void
  onCustomChoice?: () => void
}

export default function ChoicesBar({
  choices,
  loading,
  regenerating,
  isPaused,
  selectedProofUuids,
  selectedAlibiUuids,
  onChoice,
  onRegenerate,
  onCustomChoice,
}: ChoicesBarProps) {
  const totalSelected = selectedProofUuids.length + selectedAlibiUuids.length
  const disabled = loading || regenerating || isPaused
  const needsGlow = useTutorialStore((s) => s.needsGlow)

  const [customInput, setCustomInput] = useState('')

  const handleCustomSubmit = () => {
    const text = customInput.trim()
    if (!text || disabled) return
    onChoice({ id: 0, title: text, description: text, choosen: true, isTrap: false })
    onCustomChoice?.()
    setCustomInput('')
  }

  return (
    <div
      id="tour-choices"
      className="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 backdrop-blur-sm space-y-2"
    >
      <div className="flex items-center justify-between px-1 min-h-[18px]">
        {totalSelected > 0 ? (
          <p className="text-[11px] text-cyan-400 font-medium">
            {selectedProofUuids.length > 0 && (
              <>
                {selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''}
                {selectedAlibiUuids.length > 0 ? ' + ' : ''}
              </>
            )}
            {selectedAlibiUuids.length > 0 && (
              <>
                {selectedAlibiUuids.length} alibi{selectedAlibiUuids.length > 1 ? 's' : ''}
              </>
            )}{' '}
            — inclus dans le prochain échange
          </p>
        ) : (
          <span />
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-white/40">
          {choices.length === 0
            ? "Aucun choix disponible pour le moment, essayez de régénérer ou de sélectionner d'autres preuves/alibis."
            : "Sélectionnez une option pour continuer l'histoire."}
        </p>
      </div>
      <div className={'flex gap-2 ' + (choices.length === 0 ? 'opacity-50' : '')}>
        {choices.map((choice) => (
          <button
            key={choice.id}
            disabled={disabled}
            onClick={() => onChoice(choice)}
            className="w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm backdrop-blur-sm disabled:opacity-40 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-cyan-50 dark:hover:bg-cyan-500/8 hover:border-cyan-500/25 text-gray-700 dark:text-white/80"
          >
            <p className="font-semibold text-sm text-gray-800 dark:text-white/90">{choice.title}</p>
            <p className="text-xs mt-0.5 text-gray-500 dark:text-white/40">{choice.description}</p>
          </button>
        ))}
        <button
          key={'regenerate'}
          disabled={disabled}
          onClick={onRegenerate}
          className="shrink-0 flex flex-col items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border transition-all backdrop-blur-sm disabled:opacity-40 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/60 text-cyan-500 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
        >
          <RefreshCw size={15} className={`transition-transform duration-500 ${regenerating ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span className="text-[10px] font-medium uppercase tracking-widest whitespace-nowrap">Régénérer</span>
        </button>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
          disabled={disabled}
          placeholder="Choix personnalisé..."
          className={`flex-1 px-3 py-2 text-sm rounded-xl border bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/80 placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-40 transition-all ${needsGlow('usedCustomChoice') ? 'tutorial-glow' : ''}`}
        />
        <button
          onClick={handleCustomSubmit}
          disabled={disabled || !customInput.trim()}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border transition-all disabled:opacity-40 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/60 text-cyan-500 dark:text-cyan-400"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
