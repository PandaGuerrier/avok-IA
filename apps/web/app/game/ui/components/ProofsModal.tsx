import { useState } from 'react'
import { FileSearch, X, ChevronDown, ChevronUp } from 'lucide-react'
import type ProofDto from '#game/dtos/proof'
import { PROOF_TYPE_ICONS } from '#game/ui/utils/constants'

interface ProofsModalProps {
  proofs: ProofDto[]
  selectedProofUuids: string[]
  onToggle: (uuid: string) => void
  onClearSelection: () => void
  onClose: () => void
}

export default function ProofsModal({
  proofs,
  selectedProofUuids,
  onToggle,
  onClearSelection,
  onClose,
}: ProofsModalProps) {
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null)

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0a0a1a] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dossier à charge</h2>
            <span className="bg-cyan-500/15 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
              {proofs.length} pièce{proofs.length > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {proofs.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <FileSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune preuve collectée pour l'instant</p>
            </div>
          ) : (
            proofs.map((proof) => {
              const isSelected = selectedProofUuids.includes(proof.uuid)
              const isExpanded = expandedUuid === proof.uuid
              const Icon = PROOF_TYPE_ICONS[proof.data?.type] || FileSearch

              return (
                <div
                  key={proof.uuid}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/8 border-cyan-500/30'
                      : 'bg-white/3 border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => onToggle(proof.uuid)}
                      className={`w-4 h-4 rounded border shrink-0 transition-all ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'bg-transparent border-white/20 hover:border-cyan-500/50'
                      }`}
                    >
                      {isSelected && (
                        <span className="flex w-full h-full items-center justify-center text-black text-[10px] font-bold leading-none">
                          ✓
                        </span>
                      )}
                    </button>
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-white/80'}`}>
                        {proof.data?.title || 'Preuve'}
                      </p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
                        {proof.data?.type || 'document'}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedUuid(isExpanded ? null : proof.uuid)}
                      className="p-1 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-0 border-t border-white/8 mt-2">
                      {proof.data?.type === 'image' && proof.imageUrl ? (
                        <img src={proof.imageUrl} alt={proof.data?.title} className="rounded-lg max-w-full mt-2" />
                      ) : proof.data?.type === 'pdf' && proof.imageUrl ? (
                        <a
                          href={proof.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 underline mt-2 inline-block"
                        >
                          Ouvrir le PDF
                        </a>
                      ) : (
                        <p className="text-xs text-white/60 leading-relaxed mt-2">{proof.content}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Selection footer */}
        {selectedProofUuids.length > 0 && (
          <div className="shrink-0 px-5 py-3 border-t border-white/10 bg-cyan-500/5 flex items-center justify-between">
            <p className="text-xs text-cyan-400">
              {selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''}{' '}
              sélectionnée{selectedProofUuids.length > 1 ? 's' : ''} pour le prochain échange
            </p>
            <button
              onClick={onClearSelection}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Tout désélectionner
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
