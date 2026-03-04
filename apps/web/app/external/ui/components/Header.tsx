import { useState, useEffect } from 'react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleTabChange: (tabId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

interface Profile {
  firstName: string;
  lastName: string;
  age: number | string;
  picture: string;
}

export default function Header({
  isSidebarOpen, setIsSidebarOpen, handleTabChange,
  searchQuery, setSearchQuery, isProfileOpen,
  setIsProfileOpen, isDarkMode, setIsDarkMode
}: HeaderProps) {
  const [profile, setProfile] = useState<Profile>({
    firstName: 'Chargement...',
    lastName: '',
    age: '--',
    picture: 'https://i.pravatar.cc/150'
  });

  useEffect(() => {
    fetch('https://randomuser.me/api/')
      .then(response => response.json())
      .then(data => {
        const user = data.results[0];
        setProfile({
          firstName: user.name.first,
          lastName: user.name.last,
          age: user.dob.age,
          picture: user.picture.large
        });
      })
      .catch((error: unknown) => console.error('Erreur lors du chargement du profil :', error));
  }, []);


  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('inbox')}>
          <img
            src="/images/logoJaimail.png"
            alt="Logo J'ai Mail"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl text-brand-dark dark:text-slate-200 font-bold tracking-tight hidden sm:block">J'ai Mail</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl px-4 sm:px-8">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:shadow-sm focus-within:ring-1 focus-within:ring-brand-cyan transition-all border border-transparent focus-within:border-brand-cyan">
          <svg className="w-4 h-4 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text" placeholder="Rechercher un message..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-brand-dark dark:text-slate-200 placeholder-slate-400"
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-brand-blue">✕</button>}
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-full cursor-pointer shadow-sm hover:ring-2 hover:ring-brand-cyan transition-all overflow-hidden bg-brand-purple flex items-center justify-center text-white font-bold text-sm">
          <img src={profile.picture} alt="Profil" className="w-full h-full object-cover" />
        </div>

        {isProfileOpen && (
          <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700 p-6 z-50 flex flex-col items-center animate-fade-in transition-colors">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-md border-4 border-slate-50 dark:border-slate-700 bg-brand-purple flex items-center justify-center">
              <img src={profile.picture} alt="Profil" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-brand-dark dark:text-slate-100">{profile.firstName} {profile.lastName}</h3>
            <p className="text-slate-500 text-sm mb-4">{profile.age} ans</p>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 mb-3 rounded-lg transition-colors text-sm font-medium">
              {isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            </button>
            <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-4"></div>
            <button onClick={() => setIsProfileOpen(false)} className="w-full text-slate-500 hover:text-brand-dark dark:hover:text-slate-300 text-sm transition-colors font-medium">Fermer</button>
          </div>
        )}
      </div>
    </header>
  );
}
