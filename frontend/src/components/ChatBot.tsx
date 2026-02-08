
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/api';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AI HR Assistant. How can I help you with workforce insights today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.slice(1);
      const result = await sendChatMessage(userMsg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '**Connection Error**: I encountered an issue reaching the HRMS server. Please check your connection.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-6 z-[40] flex flex-col items-end gap-5 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-[380px] h-[min(550px,calc(100dvh-8rem))] md:h-[min(550px,calc(100dvh-6rem))] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/80 flex flex-col overflow-hidden mb-2"
            style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 bg-white/40 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-lg border border-white/20">
                    <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">HRMS AI Assistant</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Always here to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-white/30">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200' 
                      : 'bg-white/80 border border-slate-100 text-slate-700 rounded-tl-none prose prose-slate prose-sm max-w-none prose-p:my-1 prose-headings:mb-2 prose-ul:my-1 prose-li:my-0'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white/60 border border-slate-100 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                     <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-2">Thinking</span>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/20">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-end group"
              >
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  className="w-full bg-white/80 border border-slate-200 rounded-2xl py-3 pl-5 pr-12 text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 placeholder-slate-400 outline-none transition-all shadow-inner resize-none min-h-[46px] max-h-[100px] custom-scrollbar" 
                  placeholder="Ask about employees, leave, or data..."
                  style={{ height: 'auto', overflowY: input.split('\n').length > 2 ? 'auto' : 'hidden' }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = '0px';
                      const newHeight = Math.min(el.scrollHeight, 100);
                      el.style.height = newHeight + 'px';
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-[7px] bottom-[7px] h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-slate-200"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
              <div className="mt-2 text-center">
                 <p className="text-[9px] text-slate-400 font-medium tracking-tight">[Enter] to send | [Shift+Enter] for new line</p>
                 <p className="mt-1 text-[10px] text-slate-400 font-medium tracking-tight">AI can make mistakes. Please verify important details.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle Button */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl flex items-center justify-center group relative overflow-hidden border border-slate-700/50"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Icon */}
        <span className="material-symbols-outlined text-2xl transition-all duration-300 relative z-10 group-hover:scale-110">
          {isOpen ? 'close' : 'support_agent'}
        </span>
        
        {/* Tooltip */}
        <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 rounded-xl bg-white/95 px-3.5 py-2 text-[11px] font-semibold text-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 backdrop-blur-sm">
          {isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        </div>
        
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      </motion.button>

      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-content p { margin-bottom: 0.5rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul, .markdown-content ol { padding-left: 1.25rem; margin-bottom: 0.5rem; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content strong { font-weight: 700; color: #0f172a; }
        .markdown-content code { background: #f1f5f9; padding: 0.1rem 0.3rem; rounded: 0.25rem; font-family: monospace; }
      `}} />
    </div>
  );
};

export default ChatBot;
