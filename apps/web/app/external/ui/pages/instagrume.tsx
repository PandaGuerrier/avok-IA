import React, { useState } from 'react';
import { z } from 'zod';
import Sidebar from '../components/layout/Sidebar';
import PostCard from '../components/feed/PostCard';
import ChatList from '../components/messages/ChatList';
import ChatWindow from '../components/messages/ChatWindow';
import Profile from '../components/profile/Profile';

// --- LE SCHÉMA (Inchangé) ---
const instaSchema = z.object({
  conversations: z.array(z.object({
    conversationId: z.number().default(0),
    messages: z.array(z.object({
      id: z.number().default(0),
      content: z.string().default(''),
      isMine: z.boolean().default(false),
    })).default([]),
  })).default([]),
  posts: z.array(z.any()).default([]),
}).default({})

// --- L'INTERFACE GÉNÉRÉE ---
// Cela permet à TypeScript de comprendre la structure de "insta"
type InstaData = z.infer<typeof instaSchema>;

const Instagrume: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'profile' | 'search'>('feed');
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // --- ÉTAT TYPÉ AVEC TON SCHÉMA ---
  const [insta, _setInsta] = useState<InstaData>(instaSchema.parse({
    conversations: [
      {
        conversationId: 1,
        messages: [
          { id: 1, content: "Salut !", isMine: false },
          { id: 2, content: "Ça va ?", isMine: true }
        ]
      },
      {
        conversationId: 2,
        messages: []
      }
    ],
    posts: [
      { id: 1, user: 'lucas_explorer', image: 'https://picsum.photos/id/10/800/800', caption: 'Superbe vue !' },
      { id: 2, user: 'sarah_design', image: 'https://picsum.photos/id/20/800/800', caption: 'Nouveau projet.' }
    ]
  }));

  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <Sidebar activeTab={activeTab} onNavigate={(tab: any) => setActiveTab(tab as any)} />

      <main className={`flex-1 ml-20 xl:ml-64 flex flex-col min-h-screen transition-all ${activeTab === 'messages' ? 'items-stretch' : 'items-center p-4 md:p-8'}`}>

        {/* VUE FEED */}
        {activeTab === 'feed' && (
          <div className="max-w-[850px] w-full mt-4 flex flex-col items-center">
            {insta.posts.map((post: any) => (
              <PostCard
                key={post.id}
                user={post.user}
                image={post.image}
                caption={post.caption}
              />
            ))}
          </div>
        )}

        {/* VUE SEARCH (Invisible pour l'instant) */}
        {activeTab === 'search' && (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <p className="text-xl italic">Recherche en cours de préparation...</p>
          </div>
        )}

        {/* VUE MESSAGES */}
        {activeTab === 'messages' && (
          <div className="w-full h-screen flex bg-white overflow-hidden border-l border-gray-200">
            <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-gray-200">
              <ChatList
                onSelectContact={(contact: any) => setSelectedContact(contact)}
                selectedId={selectedContact?.id}
              />
            </div>
            <div className="flex-1 flex flex-col bg-white">
              {selectedContact ? (
                <ChatWindow
                  contact={selectedContact}
                  initialMessages={insta.conversations.find(c => c.conversationId === selectedContact.id)?.messages || []}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
                  <div className="w-24 h-24 border border-black rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📩</span>
                  </div>
                  <h3 className="text-xl font-medium">Tes messages</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export default Instagrume;
