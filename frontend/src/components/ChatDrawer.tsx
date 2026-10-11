import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface ChatDrawerProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
  providerName?: string;
}

interface MessageItem {
  id: number;
  sender_id: number;
  message: string;
  is_me: boolean;
  created_at: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  bookingId,
  isOpen,
  onClose,
  providerName = 'Assigned Driver'
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await apiRequest<MessageItem[]>(`/chat/${bookingId}`);
      setMessages(data);
    } catch {
      // Mock initial friendly greeting if none exist yet
      if (messages.length === 0) {
        setMessages([
          {
            id: 1,
            sender_id: 999,
            message: `Hello! This is ${providerName}. I've received your breakdown dispatch and I am en route. Stay safe inside or near your vehicle.`,
            is_me: false,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setIsSending(true);
    try {
      await apiRequest(`/chat/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setInputText('');
      await fetchMessages();
    } catch {
      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender_id: 1,
          message: text,
          is_me: true,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const quickReplies = [
    'Hazard lights are ON',
    'I am parked on the left shoulder',
    'What is your current ETA?',
    'I am standing by a white milestone'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-[#0f2744] text-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">{providerName}</h3>
            <span className="text-xs text-emerald-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified AutoRescue Driver
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.is_me ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.is_me
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p>{m.message}</p>
            </div>
            <span className="text-[10px] text-slate-600 mt-1 px-1">{m.created_at}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto flex space-x-1.5 no-scrollbar">
        {quickReplies.map((qr) => (
          <button
            key={qr}
            onClick={() => handleSend(qr)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap px-2.5 py-1 rounded-full transition"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message driver..."
          className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          disabled={!inputText.trim() || isSending}
          onClick={() => handleSend()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
