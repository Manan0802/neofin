import React, { useState, useContext, useRef } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import api from '../api';
import { useReactMediaRecorder } from "react-media-recorder";
import { Sparkles, Mic, Camera, Send, Plus, Calendar, Tag, IndianRupee, Ghost, Briefcase, Loader2, X, StopCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddTransaction = () => {
    const navigate = useNavigate();
    const { addTransaction, addDebt } = useContext(GlobalContext);

    // Form State
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isHidden, setIsHidden] = useState(false);
    const [isFreelance, setIsFreelance] = useState(false);

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const createAndAddTransaction = async (transactionData) => {
        const amountNum = +transactionData.amount;
        const type = transactionData.type || (amountNum >= 0 ? 'income' : 'expense');
        const finalDate = transactionData.date ? new Date(transactionData.date).toISOString() : new Date(date).toISOString();

        const newTransaction = {
            id: Math.floor(Math.random() * 100000000),
            ...transactionData,
            amount: amountNum,
            type,
            date: finalDate
        };

        await addTransaction(newTransaction);
        resetForm();
    };

    const resetForm = () => {
        setText('');
        setAmount('');
        setCategory('Other');
        setDate(new Date().toISOString().split('T')[0]);
        setIsHidden(false);
        setIsFreelance(false);
        setAiPrompt('');
    };

    const processAIResponse = (res) => {
        let aiData = res.data;
        if (aiData.data) aiData = aiData.data;

        if (aiData.text?.includes("Error") || !aiData.amount || aiData.amount === 0) {
            return { error: true };
        }

        if (aiData.transactionType === 'debt') {
            const { person, amount, debtType } = aiData;
            addDebt({
                id: Math.floor(Math.random() * 100000000),
                person,
                amount: +amount,
                type: debtType,
                date: new Date().toISOString()
            });
            return { success: true };
        }

        const finalAmount = aiData.type === 'expense' ? -Math.abs(aiData.amount) : Math.abs(aiData.amount);
        createAndAddTransaction({
            text: aiData.text || 'AI Transaction',
            amount: finalAmount,
            category: aiData.category || 'Other',
            isHidden: aiData.isHidden || false,
            isFreelance: Boolean(aiData.isFreelance),
            date: aiData.date
        });

        return { success: true, aiText: aiData.text, finalAmount };
    };

    const handleVoiceUpload = async (blobUrl, blob) => {
        if (!blob) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', blob, 'voice_note.wav');
        try {
            const res = await api.post('/ai/parse', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            processAIResponse(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/ai/parse', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            processAIResponse(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const { status, startRecording, stopRecording } = useReactMediaRecorder({
        audio: true,
        onStop: handleVoiceUpload
    });

    const handleTextMagicFill = async () => {
        if (!aiPrompt.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/ai/parse', { prompt: aiPrompt });
            processAIResponse(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onManualSubmit = (e) => {
        e.preventDefault();
        if (!text || !amount) return;
        createAndAddTransaction({ text, amount, category, isHidden, isFreelance, date });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 anime-fade-in">
            {/* Top Bar */}
            <div className="flex justify-between items-center px-2">
                <button onClick={() => navigate(-1)} className="p-2 glass rounded-xl text-slate-400">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Add Money Flow</h2>
                <button onClick={resetForm} className="text-xs font-bold text-theme uppercase tracking-widest">Clear</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI MAGIC SECTION */}
                <div className="space-y-4">
                    <div className="grad-indigo p-6 rounded-[2rem] shadow-2xl shadow-theme relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl bg-white w-32 h-32 rounded-full -mr-10 -mt-10"></div>
                        <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" /> AI Magic Fill
                        </h3>

                        <div className="relative mb-4">
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g. 'Coffee with friends 250'"
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none h-32 text-lg font-medium"
                            />

                            <div className="absolute right-3 bottom-3 flex gap-2">
                                <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleImageUpload} />
                                <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                                    <Camera className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={status === 'recording' ? stopRecording : startRecording}
                                    className={`p-3 rounded-xl transition-all ${status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'} text-white`}
                                >
                                    {status === 'recording' ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleTextMagicFill}
                            disabled={loading || !aiPrompt.trim()}
                            className="w-full bg-white text-theme font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-black/20 active:scale-95 transition-all text-lg"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            Process with AI
                        </button>
                    </div>

                    <div className="glass p-6 rounded-[2rem] hidden md:block">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">AI Pro Tips</p>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-start gap-2">✨ "Salaried 50k today"</li>
                            <li className="flex items-start gap-2">✨ "Lent 2k to Rahul"</li>
                            <li className="flex items-start gap-2">✨ "Netflix subscription 649"</li>
                        </ul>
                    </div>
                </div>

                {/* MANUAL FORM SECTION */}
                <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl space-y-6">
                    <h3 className="text-white font-black text-xl mb-2 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-theme" /> Manual Entry
                    </h3>

                    <form onSubmit={onManualSubmit} className="space-y-4">
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-2xl focus:outline-none focus:border-theme transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-tighter">Amount</div>
                        </div>

                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="What's it for?"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-theme transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white text-xs font-bold focus:outline-none"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                                >
                                    {['Salary', 'Freelance', 'Investment', 'Food', 'Travel', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Education', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsHidden(!isHidden)}
                                className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${isHidden ? 'bg-theme/20 border-theme text-theme shadow-theme' : 'bg-slate-950 border-white/5 text-slate-500'
                                    }`}
                            >
                                <Ghost className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Ghost</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFreelance(!isFreelance)}
                                className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${isFreelance ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-white/5 text-slate-500'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Work</span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full grad-indigo text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-theme active:scale-95 transition-all text-xl mt-4"
                        >
                            Log Entry
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;