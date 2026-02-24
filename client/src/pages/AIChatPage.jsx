import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, ArrowRight, BrainCircuit, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AIChatPage = () => {
    const { transactions } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Yo! I am your NeoFin AI Buddy. Ask me anything about your bread, spending, or financial goals!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                message: userMsg,
                transactions
            });

            setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: 'My bad, seems like my circuits are a bit fried. Try again in a sec!' }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        "How much on Food?",
        "Total balance?",
        "Am I spending too much?",
        "Last month summary"
    ];

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col anime-fade-in md:pt-4">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[1.2rem] grad-indigo flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <BrainCircuit className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase">AI Buddy</h1>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={() => navigate(-1)} className="p-2 glass rounded-xl text-slate-400 md:hidden">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} anime-slide-up`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            <div className={`px-4 py-3 rounded-[1.5rem] shadow-xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start anime-fade-in">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-[1.5rem] rounded-tl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions for Mobile */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                {quickActions.map(action => (
                    <button
                        key={action}
                        onClick={() => setInput(action)}
                        className="px-4 py-2 glass rounded-full text-xs font-bold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all border border-transparent"
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 pb-8 md:pb-4">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center bg-slate-900 border border-white/10 rounded-[2rem] p-2 focus-within:border-indigo-500/50 transition-all shadow-2xl"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-600 focus:outline-none font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-12 h-12 rounded-full grad-indigo flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 active:scale-90 transition-all disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AIChatPage;
