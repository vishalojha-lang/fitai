'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "What workout should I do today?",
  "How much protein do I need?",
  "Suggest a healthy meal plan",
  "How can I improve my sleep for recovery?",
  "What's the best way to lose fat?",
];

function AiCoachContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/api/ai-coach/history');
        setMessages(res.data?.messages ?? []);
      } catch {
        setMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai-coach/chat', { message: text.trim() });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data?.reply ?? res.data?.message ?? 'I apologize, I could not generate a response.',
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FitAI Coach</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4">
          {historyLoading ? (
            <div className="flex justify-center pt-8">
              <LoadingSpinner size="md" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center pt-8 gap-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                <Bot size={32} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900 dark:text-white">Hi! I&apos;m your FitAI Coach</p>
                <p className="text-sm text-gray-400 mt-1">Ask me anything about fitness, nutrition, or workouts!</p>
              </div>
              <div className="w-full max-w-sm">
                <p className="text-xs text-gray-400 text-center mb-3">Try asking:</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl text-sm text-gray-700 dark:text-gray-300 transition-colors border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Zap size={14} className="text-white" fill="white" />
                    </div>
                  )}
                  <div className={cn('max-w-[80%] flex flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-green-500 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-sm'
                      )}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Suggested Prompts (when has messages) */}
        {messages.length > 0 && !loading && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl text-xs text-gray-600 dark:text-gray-400 transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask your AI coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

export default function AiCoachPage() {
  return (
    <ProtectedRoute>
      <AiCoachContent />
    </ProtectedRoute>
  );
}
