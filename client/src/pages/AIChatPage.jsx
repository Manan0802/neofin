import React, { useState, useContext, useRef, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, ArrowRight } from 'lucide-react';
import api from '../api';

const AIChatPage = () => {
    const { transactions } = useContext(GlobalContext);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hey there! I am your NeoFin AI Buddy. Ask me anything about your spending, income, or financial health!' }
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
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having a bit of trouble connecting to my brain right now. Please try again!' }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        "How much did I spend on Food?",
        "Show my total balance",
        "Am I spending too much?",
        "Summary of last month"
    ];

    const runQuickAction = (action) => {
        setInput(action);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col anime-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">AI Finance Buddy</h1>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online & Ready to help
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`max-w-[80%] flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-lg">
                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Bar */}
            {messages.length < 4 && !loading && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => runQuickAction(action)}
                            className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-2 group"
                        >
                            {action}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me: 'How much did I spend this week?'"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500/50 text-white rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-xl"
                />
                <button
                    disabled={!input.trim() || loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
            <p className="text-center text-[10px] text-slate-600 mt-4 uppercase font-bold tracking-widest">
                Powered by NeoFin AI • Contextual Analysis v1.0
            </p>
        </div>
    );
};

export default AIChatPage;
