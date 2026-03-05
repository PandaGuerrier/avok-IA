import { useState } from 'react'
import { StickyNote, Plus, X } from 'lucide-react'
import type AlibiDto from '#game/dtos/alibi'

interface AlibisPanelProps {
  alibis: AlibiDto[]
  selectedAlibiUuids: string[]
  onToggle: (uuid: string) => void
  onClearSelection: () => void
  onAdd: (alibi: AlibiDto) => void
  onDelete: (uuid: string) => void
  onClose: () => void
  gameUuid: string
}

export default function AlibisPanel({
  alibis,
  selectedAlibiUuids,
  onToggle,
  onClearSelection,
  onAdd,
  onDelete,
  onClose,
  gameUuid,
}: AlibisPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function handleAdd() {
    if (!title.trim() || !content.trim()) return
    try {
      const res = await fetch(`/game/${gameUuid}/alibis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      })
      if (res.ok) {
        const json = await res.json()
        onAdd(json.alibi)
        setTitle('')
        setContent('')
        setFormOpen(false)
      }
    } catch {
      // silent
    }
  }

  async function handleDelete(uuid: string) {
    try {
      await fetch(`/game/${gameUuid}/alibis/${uuid}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      onDelete(uuid)
    } catch {
      // silent
    }
  }

  return (
    <div className="relative z-10 w-72 shrink-0 border-l border-white/10 flex flex-col bg-white/2 backdrop-blur-md max-lg:hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
          Mes alibis
          {selectedAlibiUuids.length > 0 && (
            <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full border border-purple-500/30">
              {selectedAlibiUuids.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="p-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-purple-400 hover:border-purple-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {formOpen && (
        <div className="shrink-0 p-3 border-b border-white/10 bg-purple-500/5 space-y-2">
          <input
            type="text"
            placeholder="Titre de l'alibi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
          />
          <textarea
            placeholder="Décrivez votre alibi..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/30 transition-all"
            >
              Ajouter
            </button>
            <button
              onClick={() => setFormOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {alibis.length === 0 ? (
          <div className="text-center py-10 text-white/30">
            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aucun alibi enregistré</p>
          </div>
        ) : (
          alibis.map((alibi) => {
            const isSelected = selectedAlibiUuids.includes(alibi.uuid)
            return (
              <div
                key={alibi.uuid}
                className={`p-3 rounded-xl border group transition-all ${
                  isSelected
                    ? 'bg-purple-500/8 border-purple-500/30'
                    : 'border-white/8 bg-white/3 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => onToggle(alibi.uuid)}
                      className={`mt-0.5 w-3.5 h-3.5 shrink-0 rounded border transition-all ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'bg-transparent border-white/20 hover:border-purple-500/50'
                      }`}
                    >
                      {isSelected && (
                        <span className="flex w-full h-full items-center justify-center text-white text-[8px] font-bold leading-none">
                          ✓
                        </span>
                      )}
                    </button>
                    <p className="text-xs font-semibold text-purple-300 truncate">{alibi.title}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(alibi.uuid)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/30 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p
                  className={`text-[11px] mt-1 leading-relaxed ${isSelected ? 'text-purple-200/60' : 'text-white/40'}`}
                >
                  {alibi.content}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Selection footer */}
      {selectedAlibiUuids.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-t border-white/10 bg-purple-500/5 flex items-center justify-between">
          <p className="text-xs text-purple-400">
            {selectedAlibiUuids.length} alibi{selectedAlibiUuids.length > 1 ? 's' : ''} sélectionné{selectedAlibiUuids.length > 1 ? 's' : ''}
          </p>
          <button
            onClick={onClearSelection}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  )
}

function getXsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}
