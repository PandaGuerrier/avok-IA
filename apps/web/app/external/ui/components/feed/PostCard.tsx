import React, { useState } from 'react'
import { Heart, MessageCircle, BookmarkPlus } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

interface Comment {
  id: number
  content: string
  author: string
}

interface Post {
  postId: number
  content: string
  imageUrl: string
  username?: string
  comments: Comment[]
}

interface PostCardProps {
  post: Post
  onAlibisClick: (content: string) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onAlibisClick }) => {
  const [isLiked, setIsLiked] = useState(false)

  const buildAlibisContent = () => {
    const comments = post.comments ?? []
    const lines = [`[Post Instagram #${post.postId}]`, post.content]
    if (comments.length > 0) {
      lines.push('', 'Commentaires:')
      comments.forEach((c) => lines.push(`${c.author}: ${c.content}`))
    }
    return lines.join('\n')
  }

  return (
    <div className="flex bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm mb-10 w-full max-w-[850px] min-h-[500px] overflow-hidden">
      {/* Image */}
      <div className="w-3/5 bg-black flex items-center justify-center">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="post" className="max-h-full w-full object-contain" onDoubleClick={() => setIsLiked(true)} />
        ) : (
          <div className="w-full h-full min-h-[400px] flex items-center justify-center text-gray-600 text-sm">Aucune image</div>
        )}
      </div>

      {/* Droite */}
      <div className="w-2/5 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-sm text-gray-900 dark:text-white">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {(post.username ?? 'S')[0].toUpperCase()}
              </div>
            )}
            {post.username ?? 'suspect'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onAlibisClick(buildAlibisContent())}
              variant="outline"
              size={"sm"}
            >
              <BookmarkPlus size={18} />
              Sauvegarder alibi
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm text-gray-900 dark:text-gray-100">
          <p><span className="font-bold mr-2">{post.username ?? 'suspect'}</span>{post.content}</p>
          {(post.comments ?? []).map((c) => (
            <div key={c.id}>
              <span className="font-bold mr-2">{c.author}</span>{c.content}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <Heart
                onClick={() => setIsLiked(!isLiked)}
                className={`cursor-pointer transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-black dark:text-white'}`}
                size={24}
              />
              <MessageCircle size={24} className="cursor-pointer text-gray-900 dark:text-white" />
            </div>
          </div>
          <p className="font-bold text-sm text-gray-900 dark:text-white">{isLiked ? '1 241' : '1 240'} J'aime</p>
        </div>
      </div>
    </div>
  )
}

export default PostCard
