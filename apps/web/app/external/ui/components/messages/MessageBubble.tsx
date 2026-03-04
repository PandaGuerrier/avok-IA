import React from 'react';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  time: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isMine, time }) => {
  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4`}>
      <div 
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
          isMine 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-100 text-black rounded-bl-none'
        }`}
      >
        {text}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
    </div>
  );
};

export default MessageBubble;