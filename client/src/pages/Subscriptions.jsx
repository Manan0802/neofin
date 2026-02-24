import React, { useContext, useState, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { Sparkles, Loader2, Bell, Calendar, CreditCard, ExternalLink, Filter } from 'lucide-react';
import api from '../api';

const Subscriptions = () => {
    const { transactions } = useContext(GlobalContext);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const scanSubs = async () => {
        if (transactions.length === 0) return;
        setLoading(true);
        try {
            const res = await api.post('/ai/detect-subscriptions', { transactions });
            setSubs(res.data);
            // Save to local storage cache
            localStorage.setItem('detected_subs', JSON.stringify(res.data));
        } catch (error) {
            console.error("Scanning failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cached = localStorage.getItem('detected_subs');
        if (cached) {
            setSubs(JSON.parse(cached));
        } else {
            scanSubs();
        }
    }, [transactions]);

    const totalMonthlyBurn = subs.reduce((acc, sub) => {
        if (sub.frequency === 'monthly') return acc + sub.amount;
        if (sub.frequency === 'yearly') return acc + (sub.amount / 12);
        return acc + sub.amount;
    }, 0);

    return (
        <div className="space-y-8 anime-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Subscription Manager</h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        AI-powered detection of your recurring bills
                    </p>
                </div>
                <button
                    onClick={scanSubs}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? "Analyzing..." : "Rescan My Spend"}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Monthly Burn</p>
                    <h2 className="text-3xl font-bold text-white">₹{totalMonthlyBurn.toFixed(2)}</h2>
                    <p className="text-indigo-400 text-xs mt-2 italic">Calculated across all recurring services</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Subscriptions</p>
                    <h2 className="text-3xl font-bold text-white">{subs.length}</h2>
                    <p className="text-emerald-400 text-xs mt-2 italic">Detected from your history</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Potential Savings</p>
                    <h2 className="text-3xl font-bold text-amber-400">₹{(totalMonthlyBurn * 0.15).toFixed(0)}+</h2>
                    <p className="text-slate-500 text-xs mt-2 italic">By optimizing unused plans</p>
                </div>
            </div>

            {/* Subscriptions List */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                        Active Subscriptions
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-slate-500 hover:text-white p-2">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-800">
                    {subs.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-slate-500 w-8 h-8" />
                            </div>
                            <h4 className="text-white font-bold text-lg mb-1">No subscriptions found</h4>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm">Run a scan to let NeoFin AI analyze your transactions for recurring patterns.</p>
                        </div>
                    ) : (
                        subs.map((sub, idx) => (
                            <div key={idx} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
                                        {sub.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">{sub.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {sub.frequency}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Next: 1st of next month
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-8">
                                    <div className="text-right">
                                        <p className="text-white font-extrabold text-xl">₹{sub.amount}</p>
                                        <p className="text-slate-500 text-xs">Total Yearly: ₹{sub.frequency === 'yearly' ? sub.amount : (sub.amount * 12)}</p>
                                    </div>
                                    <button className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl transition-colors">
                                        <ExternalLink className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-white" />
                </div>
                <h4 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <Lightbulb className="text-yellow-400 w-6 h-6" />
                    Subscription Optimization Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <p className="text-indigo-300 font-bold text-sm mb-1">Check for duplicates</p>
                        <p className="text-slate-400 text-xs">You might be paying for both Netflix and Amazon Prime Video. Do you need both?</p>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <p className="text-emerald-300 font-bold text-sm mb-1">Annual Savings</p>
                        <p className="text-slate-400 text-xs">Switching to annual billing for your top 3 subs could save you around ₹2,500/year.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
