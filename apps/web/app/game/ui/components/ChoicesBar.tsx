import type ChoiceData from '#game/types/choices'

interface ChoicesBarProps {
  choices: ChoiceData[]
  loading: boolean
  isPaused: boolean
  selectedProofUuids: string[]
  selectedAlibiUuids: string[]
  onChoice: (choice: ChoiceData) => void
}

export default function ChoicesBar({
  choices,
  loading,
  isPaused,
  selectedProofUuids,
  selectedAlibiUuids,
  onChoice,
}: ChoicesBarProps) {
  const totalSelected = selectedProofUuids.length + selectedAlibiUuids.length

  return (
    <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-white/2 backdrop-blur-sm space-y-2">
      {totalSelected > 0 && (
        <p className="text-[11px] text-cyan-400 font-medium px-1">
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
          )}
          {' '}— inclus dans le prochain échange
        </p>
      )}
      {choices.map((choice) => (
        <button
          key={choice.id}
          disabled={loading || isPaused}
          onClick={() => onChoice(choice)}
          className="w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm backdrop-blur-sm disabled:opacity-40 bg-white/5 border-white/10 hover:bg-cyan-500/8 hover:border-cyan-500/25 text-white/80"
        >
          <p className="font-semibold text-sm text-white/90">{choice.title}</p>
          <p className="text-xs mt-0.5 text-white/40">{choice.description}</p>
        </button>
      ))}
    </div>
  )
}
