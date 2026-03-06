import React from 'react';
import { Home, Search, Compass, MessageCircle, User, Heart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: 'feed' | 'messages' | 'profile') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const menuItems = [
    { id: 'feed', name: 'Accueil', icon: <Home size={26} /> },
    { id: 'search', name: 'Recherche', icon: <Search size={26} /> },
    { id: 'explore', name: 'Explorer', icon: <Compass size={26} /> },
    { id: 'messages', name: 'Messages', icon: <MessageCircle size={26} /> },
    { id: 'notifications', name: 'Notifications', icon: <Heart size={26} /> },
    { id: 'profile', name: 'Profil', icon: <User size={26} /> },
  ];

  return (
    <aside className="shrink-0 h-full w-16 xl:w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col transition-all overflow-y-auto">
      {/* SECTION LOGO */}
      <div className="my-8 flex items-center justify-center xl:justify-start px-2">
        <img src="/images/logo.png" alt="Logo" className="w-10 h-10 xl:hidden object-contain" />
        <img src="/images/nomLogo.png" alt="Instagram" className="hidden xl:block w-[80%] object-contain" />
      </div>

<nav className="flex flex-col gap-3">
  {menuItems.map((item) => (
    <div
      key={item.id}
      onClick={() => {
        // Force le changement si l'ID correspond à une de nos vues
        if (item.id === 'feed' || item.id === 'messages' || item.id === 'profile') {
          onNavigate(item.id);
        }
      }}
      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
        activeTab === item.id ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''
      }`}
    >
      <span className="text-black dark:text-white">{item.icon}</span>
      <span className="ml-4 text-md hidden xl:block text-black dark:text-white">{item.name}</span>
    </div>
  ))}
</nav>
    </aside>
  );
};

export default Sidebar;
