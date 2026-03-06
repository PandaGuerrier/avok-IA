import { ReactNode } from 'react';

const ICONS: Record<string, ReactNode> = {
  inbox: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
  starred: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  snoozed: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  sent: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  drafts: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  archive: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  trash: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

interface SidebarItemProps {
  id: string;
  label: string;
  activeTab: string;
  onClick: (id: string) => void;
  isDarkMode: boolean;
}

function SidebarItem({ id, label, activeTab, onClick, isDarkMode }: SidebarItemProps) {
  const active = activeTab === id;
  const activeClasses = isDarkMode ? 'bg-slate-800 text-brand-cyan border-brand-cyan' : 'bg-brand-cyan/10 text-brand-blue border-brand-blue';
  const inactiveClasses = isDarkMode ? 'hover:bg-slate-800/50 text-slate-400 border-transparent' : 'hover:bg-slate-50 text-slate-600 border-transparent';

  return (
    <div onClick={() => onClick(id)} className={`flex items-center px-6 py-2.5 cursor-pointer transition-colors border-l-4 ${active ? activeClasses : inactiveClasses}`}>
      <div className="flex items-center gap-4">
        <span className="opacity-80">{ICONS[id]}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

interface SidebarProps {
  setIsComposeOpen: (open: boolean) => void;
  activeTab: string;
  handleTabChange: (tabId: string) => void;
  isDarkMode: boolean;
}

export default function Sidebar({ setIsComposeOpen, activeTab, handleTabChange, isDarkMode }: SidebarProps) {
  return (
    <aside id="tour-mail-sidebar" className="w-64 bg-white dark:bg-slate-900 flex flex-col py-4 border-r border-slate-200 dark:border-slate-800 z-10 transition-colors">
      <div className="px-4 mb-6">
        <button onClick={() => setIsComposeOpen(true)} className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nouveau message
        </button>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto">
        <SidebarItem id="inbox" label="Boîte de réception" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <SidebarItem id="starred" label="Messages suivis" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <SidebarItem id="snoozed" label="En attente" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <SidebarItem id="sent" label="Envoyés" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <SidebarItem id="drafts" label="Brouillons" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-6"></div>
        <SidebarItem id="archive" label="Archives" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
        <SidebarItem id="trash" label="Corbeille" activeTab={activeTab} onClick={handleTabChange} isDarkMode={isDarkMode} />
      </nav>
    </aside>
  );
}
