import { useState } from 'react'
import { X } from 'lucide-react'

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

interface AlibisModalProps {
  gameUuid: string
  defaultContent: string
  onClose: () => void
  onSaved?: () => void
}

export default function AlibisModal({ gameUuid, defaultContent, onClose, onSaved }: AlibisModalProps) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/game/${gameUuid}/alibis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ title: title.trim(), content: defaultContent }),
      })
      if (!res.ok) throw new Error()
      onSaved?.()
      onClose()
    } catch {
      setError("Erreur lors de la sauvegarde.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sauvegarder comme alibi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400 mb-4 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
          {defaultContent}
        </div>

        <input
          autoFocus
          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder-gray-400"
          placeholder="Titre de l'alibi..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-40 transition-colors"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
