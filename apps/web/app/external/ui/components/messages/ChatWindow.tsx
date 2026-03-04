import React, { useState, useEffect } from 'react';
import { Phone, Video, Info, Smile } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  contact: { id: number; name: string; avatar: string };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // On simule des messages différents quand on change de contact
  useEffect(() => {
    setMessages([
      { id: 1, text: `Salut ! C'est ${contact.name}, comment ça va ?`, isMine: false, time: "10:30" },
      { id: 2, text: "Ça va super et toi ?", isMine: true, time: "10:32" },
    ]);
  }, [contact.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      isMine: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header du Chat */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={contact.avatar} className="w-8 h-8 rounded-full border" alt="" />
          <span className="font-bold text-sm">{contact.name}</span>
        </div>
        <div className="flex gap-4 text-gray-600">
          <Phone size={22} className="cursor-pointer" />
          <Video size={24} className="cursor-pointer" />
          <Info size={24} className="cursor-pointer" />
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} text={msg.text} isMine={msg.isMine} time={msg.time} />
        ))}
      </div>

      {/* Formulaire d'envoi */}
      <div className="p-4">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center border rounded-full px-4 py-2 gap-3"
        >
          <Smile size={24} className="cursor-pointer text-gray-500" />
          <input 
            type="text" 
            placeholder="Écrire un message..." 
            className="flex-1 outline-none text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit"
            className={`font-bold text-sm ${inputValue.trim() ? 'text-blue-500' : 'text-blue-200 cursor-default'}`}
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;