import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface PostProps {
  user: string;
  image: string;
  caption: string;
}

const PostCard: React.FC<PostProps> = ({ user, image, caption }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'bobby_dev', text: 'Incroyable ce rendu ! 😍' },
    { id: 2, user: 'react_fan', text: 'Tailwind c’est vraiment le futur.' }
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      user: 'mon_pseudo',
      text: commentInput
    };

    setComments([...comments, newComment]);
    setCommentInput('');
  };

  return (
    <div className="flex bg-white border border-gray-300 rounded-sm mb-10 w-full max-w-[850px] min-h-[550px] overflow-hidden">
      {/* Gauche : Image */}
      <div className="w-3/5 bg-black flex items-center justify-center">
        <img 
          src={image} 
          alt="post" 
          className="max-h-full w-full object-contain" 
          onDoubleClick={() => setIsLiked(true)} 
        />
      </div>

      {/* Droite : Commentaires & Actions */}
      <div className="w-2/5 flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-sm">
            <img src={`https://i.pravatar.cc/150?u=${user}`} className="h-8 w-8 rounded-full border" alt="" />
            {user}
          </div>
          <MoreHorizontal size={20} className="cursor-pointer text-gray-500" />
        </div>
        
        {/* Zone de texte scrollable */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
          <p><span className="font-bold mr-2">{user}</span>{caption}</p>
          {comments.map(c => (
            <div key={c.id}>
              <span className="font-bold mr-2">{c.user}</span>{c.text}
            </div>
          ))}
        </div>

        {/* Pied de la card */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <div className="flex gap-4">
              <Heart 
                onClick={() => setIsLiked(!isLiked)} 
                className={`cursor-pointer transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-black'}`} 
                size={24} 
              />
              <MessageCircle size={24} className="cursor-pointer" />
              <Send size={24} className="cursor-pointer" />
            </div>
            <Bookmark size={24} className="cursor-pointer" />
          </div>
          <p className="font-bold text-sm mb-2">{isLiked ? '1,241' : '1,240'} J'aime</p>
          
          <form onSubmit={handleAddComment} className="flex gap-2 items-center border-t pt-3 mt-2">
            <input 
              type="text" 
              placeholder="Ajouter un commentaire..." 
              className="flex-1 text-sm outline-none"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button 
              type="submit"
              className={`text-blue-500 font-semibold text-sm ${!commentInput.trim() ? 'opacity-30' : ''}`}
              disabled={!commentInput.trim()}
            >
              Publier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCard;