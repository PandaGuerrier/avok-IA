import React from 'react';

interface ChatListProps {
  onSelectContact: (contact: any) => void;
  selectedId?: number;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectContact, selectedId }) => {
  const contacts = [
    { id: 1, name: 'Lucas Dev', avatar: 'https://i.pravatar.cc/150?u=lucas', lastMsg: 'On code quand ? 🚀' },
    { id: 2, name: 'Clara Photo', avatar: 'https://i.pravatar.cc/150?u=clara', lastMsg: 'Bonjour!' },
    { id: 3, name: 'React King', avatar: 'https://i.pravatar.cc/150?u=king', lastMsg: 'TypeScript est cool.' },
  ];

  return (
    <div className="w-full h-full bg-white">
      <div className="p-5 font-bold border-b text-xl flex justify-between items-center">
        <span>mon_pseudo</span>
      </div>
      <div className="p-4 font-bold text-sm">Messages</div>
      {contacts.map(c => (
        <div 
          key={c.id}
          onClick={() => onSelectContact(c)}
          className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${selectedId === c.id ? 'bg-gray-100' : ''}`}
        >
          <img src={c.avatar} className="w-14 h-14 rounded-full mr-3 border" alt="" />
          <div className="hidden xl:block overflow-hidden text-ellipsis whitespace-nowrap">
            <p className="text-sm font-semibold">{c.name}</p>
            <p className="text-xs text-gray-400">{c.lastMsg}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;