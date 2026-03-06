import { RefreshCw } from 'lucide-react'
import type ChoiceData from '#game/types/choices'

interface ChoicesBarProps {
  choices: ChoiceData[]
  loading: boolean
  regenerating: boolean
  isPaused: boolean
  selectedProofUuids: string[]
  selectedAlibiUuids: string[]
  onChoice: (choice: ChoiceData) => void
  onRegenerate: () => void
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
}: ChoicesBarProps) {
  const totalSelected = selectedProofUuids.length + selectedAlibiUuids.length
  const disabled = loading || regenerating || isPaused

  return (
    <div id="tour-choices" className="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/2 backdrop-blur-sm space-y-2">
      <div className="flex items-center justify-between px-1 min-h-[18px]">
        {totalSelected > 0 ? (
          <p className="text-[11px] text-cyan-400 font-medium">
            {selectedProofUuids.length > 0 && (
              <>{selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''}{selectedAlibiUuids.length > 0 ? ' + ' : ''}</>
            )}
            {selectedAlibiUuids.length > 0 && (
              <>{selectedAlibiUuids.length} alibi{selectedAlibiUuids.length > 1 ? 's' : ''}</>
            )}
            {' '}— inclus dans le prochain échange
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={onRegenerate}
          disabled={disabled}
          title="Regénérer les choix"
          className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30 hover:text-cyan-500 dark:hover:text-cyan-400 disabled:opacity-30 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
          <span>Autres options</span>
        </button>
      </div>

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
    </div>
  )
}
