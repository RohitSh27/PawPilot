import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { aiService } from '../ai/aiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatPageProps {
  apiKey?: string;
  model?: string;
  onTaskCreated?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ apiKey, model, onTaskCreated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'pet',
      text: 'Hey! I am PawPilot 🐾. How can I help you plan or organize your tasks today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const reply = await aiService.chatWithPet(userText, apiKey, model);

      const petMsg: ChatMessage = {
        id: 'msg_pet_' + Date.now(),
        sender: 'pet',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: reply.toolCalled
      };

      setMessages(prev => [...prev, petMsg]);
      if (reply.toolCalled && onTaskCreated) {
        onTaskCreated();
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] bg-card/80 border border-border/80 rounded-3xl p-4 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-3 px-2">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-100">PawPilot AI Chat 🐱</h3>
          <p className="text-[11px] text-gray-400">Schedule tasks, ask for advice, or just chat!</p>
        </div>
        {/* Connection badge */}
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          apiKey?.trim()
            ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
            : 'bg-gray-800/60 border-gray-600/40 text-gray-400'
        }`}>
          {apiKey?.trim()
            ? (apiKey.startsWith('AIza') ? '🤖 Gemini' : '🤖 OpenAI')
            : '💤 Offline'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 my-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-background/80 border border-border/80 text-gray-200 shadow-md'
              }`}
            >
              {msg.text}

              {msg.toolCall && (
                <div className="mt-2 pt-2 border-t border-cyan-500/30 text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Tool executed: {msg.toolCall.name}
                </div>
              )}

              <span className="block text-[9px] text-gray-400 text-right mt-1 opacity-70">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-border/60 pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={apiKey?.trim() ? "Ask me anything, or type 'Remind me to...' to add tasks!" : "No API key set (Settings) — try 'Remind me to...' for task creation!"}
          className="flex-1 bg-background/80 border border-border/80 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
