
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useStore } from '../contexts/StoreContext';

type ChatStyle = 'official' | 'portsaidi' | null;

export const SupportBot: React.FC = () => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ChatStyle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isAr = settings.language === 'ar';

  const systemPrompt = `
    أنت بوت الدعم الرسمي لتطبيق Brand Store.
    اسمك: Brand Store Assistant.
    قواعد:
    - الأسلوب: ${selectedStyle === 'portsaidi' ? 'لهجة بورسعيدية خفيفة وودودة' : 'لغة عربية رسمية واحترافية'}.
    - التواصل: 01274790388 | shahermagdee@gmail.com
  `;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const selectStyle = (style: ChatStyle) => {
    setSelectedStyle(style);
    const welcomeText = style === 'official' 
      ? (isAr ? 'مرحباً بك في Brand Store، كيف يمكنني مساعدتك؟' : 'Welcome to Brand Store, how can I help you?') 
      : (isAr ? 'أحلى مسا عليك يا بورسعيدي! نورت براند ستور، أؤمرني.' : 'Hello there! Welcome to Brand Store, what can I do for you?');
    setMessages([{ role: 'bot', text: String(welcomeText) }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedStyle) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: String(userMessage) }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const botText = response.text || (isAr ? "عذراً، لم أفهم طلبك." : "Sorry, I didn't get that.");
      setMessages(prev => [...prev, { role: 'bot', text: String(botText) }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: isAr ? "نظام الذكاء الاصطناعي معطل حالياً." : "AI service unavailable." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-24 lg:bottom-10 ${isAr ? 'left-6 lg:left-10' : 'right-6 lg:right-10'} z-[100]`} dir={isAr ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[320px] md:w-[380px] h-[550px] glass-card rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
          >
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🤖</div>
                <h4 className="font-black text-sm">{isAr ? 'مساعد براند ستور' : 'Brand Assistant'}</h4>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[var(--bg-color)]">
              {!selectedStyle ? (
                <div className="text-center py-10 space-y-6">
                  <p className="font-black text-sm text-black dark:text-white">{isAr ? 'اختر أسلوب المحادثة الذي تفضله:' : 'Choose your chat style:'}</p>
                  <div className="grid grid-cols-1 gap-3 px-4">
                    <button onClick={() => selectStyle('official')} className="w-full py-4 rounded-2xl neumorph-flat bg-white dark:bg-gray-800 text-xs font-black">رسمي (Official)</button>
                    <button onClick={() => selectStyle('portsaidi')} className="w-full py-4 rounded-2xl neumorph-flat bg-white dark:bg-gray-800 text-xs font-black">بورسعيدي (Friendly)</button>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold shadow-sm ${
                      msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-white neumorph-flat'
                    }`}>
                      {String(msg.text)}
                    </div>
                  </div>
                ))
              )}
              {isTyping && <div className="text-[10px] text-gray-400 animate-pulse">{isAr ? 'البوت يكتب...' : 'Bot is typing...'}</div>}
            </div>

            <div className="p-4 bg-white/50 dark:bg-black/20 border-t border-white/10">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isAr ? 'اكتب هنا...' : 'Type here...'}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border-none text-xs font-bold"
                  disabled={!selectedStyle}
                />
                <button onClick={handleSendMessage} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">➔</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center border-2 border-white/10 active:scale-90 transition-transform">
        <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
      </button>
    </div>
  );
};
