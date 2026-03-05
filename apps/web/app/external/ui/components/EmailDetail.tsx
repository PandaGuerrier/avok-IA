import { BookmarkPlus } from 'lucide-react'
import { getAvatarColor } from '../data/utils'
import type { Email } from '../schema/mailSchema'

interface EmailDetailProps {
  selectedEmail: Email
  setSelectedEmail: (email: Email | null) => void
  onAlibisClick: (content: string) => void
}

export default function EmailDetail({ selectedEmail, setSelectedEmail, onAlibisClick }: EmailDetailProps) {
  if (!selectedEmail) return null

  const buildAlibisContent = () =>
    `De: ${selectedEmail.sender}\nObjet: ${selectedEmail.subject}\n\n${selectedEmail.body.replace(/<[^>]+>/g, '')}`

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex items-center gap-4 mb-6 border-b border-sky-50 dark:border-slate-800 pb-4">
        <button
          onClick={() => setSelectedEmail(null)}
          className="p-2 hover:bg-sky-50 dark:hover:bg-slate-800 text-sky-600 dark:text-slate-400 rounded-full transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={() => onAlibisClick(buildAlibisContent())}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors"
        >
          <BookmarkPlus size={14} />
          Utiliser comme alibi
        </button>
      </div>

      <h1 className="text-2xl font-normal text-sky-900 dark:text-slate-100 mb-6 px-2">{selectedEmail.subject}</h1>

      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(selectedEmail.sender)}`}
          >
            {selectedEmail.sender.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sky-800 dark:text-slate-200">{selectedEmail.sender}</p>
            <p className="text-xs text-sky-500 dark:text-slate-400">à moi</p>
          </div>
        </div>
        <span className="text-sm text-sky-500 dark:text-slate-400">{selectedEmail.time}</span>
      </div>

      <div
        className="text-sky-800 dark:text-slate-300 px-2 whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
      />

      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
        <div className="mt-10 px-2 pt-6 border-t border-sky-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-sky-600 dark:text-slate-400 mb-4 uppercase tracking-wider">
            {selectedEmail.attachments.length} Pièce{selectedEmail.attachments.length > 1 ? 's' : ''} jointe
            {selectedEmail.attachments.length > 1 ? 's' : ''}
          </h3>
          <div className="flex flex-wrap gap-4">
            {selectedEmail.attachments.map((att, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 w-64 bg-sky-50/50 dark:bg-slate-800/50 rounded-xl border border-sky-100 dark:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg text-2xl shadow-sm border border-sky-50 dark:border-slate-800">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sky-900 dark:text-slate-200 truncate">{att.name}</p>
                  <p className="text-xs text-sky-500 dark:text-slate-400">{att.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
