import { getAvatarColor } from '../data/utils';
import type { Email } from '../schema/mailSchema';

interface EmailListProps {
  displayedEmails: Email[];
  searchQuery: string;
  openEmail: (email: Email) => void;
  showToast: (message: string) => void;
  handleArchive: (e: React.MouseEvent, id: number) => void;
  handleDelete: (e: React.MouseEvent, id: number) => void;
  toggleUnread: (e: React.MouseEvent, id: number) => void;
  selectedEmails: number[];
  toggleSelectAll: () => void;
  toggleSelectEmail: (e: React.ChangeEvent<HTMLInputElement>, id: number) => void;
  activeTab: string;
  handleEmptyTrash: () => void;
  toggleStarred: (e: React.MouseEvent, id: number) => void;
  handleSnooze: (e: React.MouseEvent, id: number) => void;
}

export default function EmailList({
  displayedEmails, searchQuery, openEmail, showToast,
  handleArchive, handleDelete, toggleUnread,
  selectedEmails, toggleSelectAll, toggleSelectEmail,
  activeTab, handleEmptyTrash, toggleStarred,
  handleSnooze
}: EmailListProps) {
  const isAllSelected = displayedEmails.length > 0 && selectedEmails.length === displayedEmails.length;
  const hasSelection = selectedEmails.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={`sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4 text-sm z-10 transition-colors ${hasSelection ? 'bg-brand-cyan/10 dark:bg-brand-blue/20' : ''}`}>
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleSelectAll}
          className="w-4 h-4 cursor-pointer accent-brand-blue"
        />

        {hasSelection ? (
          <div className="flex items-center gap-4 text-brand-dark dark:text-slate-200 font-medium">
            <span>{selectedEmails.length} sélectionné(s)</span>
            <button className="text-slate-600 dark:text-slate-400 hover:text-brand-dark dark:hover:text-white" onClick={() => showToast('Action à implémenter pour la sélection')}>Archiver</button>
            <button className="text-slate-600 dark:text-slate-400 hover:text-red-500" onClick={() => showToast('Action à implémenter pour la sélection')}>Supprimer</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 w-full">
            <button className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded transition-colors" onClick={() => showToast('Actualisé.')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {activeTab === 'trash' && displayedEmails.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="ml-auto text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Vider la corbeille
              </button>
            )}
          </div>
        )}
      </div>

      {displayedEmails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-600">
          <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          <p>{searchQuery ? 'Aucun résultat.' : 'Ce dossier est vide.'}</p>
        </div>
      ) : (
        <div>
          {displayedEmails.map((email) => {
            const isSelected = selectedEmails.includes(email.id);
            const isStarred = email.isStarred || email.folder === 'starred';

            return (
              <div
                key={email.id} onClick={() => openEmail(email)}
                className={`flex items-center px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-sm transition-all group ${isSelected ? 'bg-brand-cyan/5 dark:bg-brand-blue/10' : email.unread ? 'bg-white dark:bg-slate-800 font-bold text-brand-dark dark:text-white' : 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'}`}
              >
                <div className="flex items-center gap-3 mr-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleSelectEmail(e, email.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-4 h-4 cursor-pointer accent-brand-blue transition-opacity ${isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}
                  />

                  <button
                    className={`transition-colors ${isStarred ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                    onClick={(e) => toggleStarred(e, email.id)}
                    title={isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    {isStarred ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    )}
                  </button>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${getAvatarColor(email.sender)}`}>
                  {email.sender.charAt(0)}
                </div>

                <div className="w-24 sm:w-32 truncate">{email.sender}</div>
                <div className="flex-1 truncate mr-4">
                  <span>{email.subject}</span>
                  <span className={`ml-2 ${email.unread ? 'text-brand-blue dark:text-brand-cyan font-normal' : 'text-slate-500 dark:text-slate-500'}`}>- {email.snippet}</span>
                </div>

                <div className="w-40 text-right text-sm flex justify-end items-center relative">
                  <span className={`block group-hover:hidden ${email.unread ? 'text-brand-blue dark:text-brand-cyan' : 'text-slate-400 dark:text-slate-500'}`}>
                    {email.time}
                  </span>

                  <div className="hidden group-hover:flex items-center text-slate-400 dark:text-slate-500">
                    <button onClick={(e) => handleArchive(e, email.id)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-brand-dark dark:hover:text-white rounded-full transition-colors" title="Archiver">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    </button>

                    <button onClick={(e) => handleDelete(e, email.id)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500 rounded-full transition-colors" title={activeTab === 'trash' ? "Supprimer définitivement" : "Supprimer"}>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                    <button onClick={(e) => toggleUnread(e, email.id)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-brand-dark dark:hover:text-white rounded-full transition-colors" title={email.unread ? 'Marquer comme lu' : 'Marquer comme non-lu'}>
                      {email.unread ? (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      )}
                    </button>

                    <button onClick={(e) => handleSnooze(e, email.id)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-brand-dark dark:hover:text-white rounded-full transition-colors" title="Mettre en attente">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
