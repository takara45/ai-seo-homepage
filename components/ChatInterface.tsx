import React, { useRef, useEffect } from 'react';

interface ChatInterfaceProps {
  chatHistory: { role: 'model' | 'user'; text: string }[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, isLoading }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="space-y-6">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
            )}
            <div className={`max-w-lg p-4 rounded-xl shadow-sm ${msg.role === 'model' ? 'bg-gray-100 text-gray-800' : 'bg-indigo-500 text-white'}`}>
              <p className="text-base whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-end gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                <div className="max-w-lg p-4 rounded-xl shadow-sm bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
    </div>
  );
};

export default ChatInterface;
