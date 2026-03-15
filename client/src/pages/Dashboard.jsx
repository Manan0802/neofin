import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import { GlobalContext } from '../context/GlobalContext';
import api from '../api';
import TransactionColumns from '../components/TransactionColumns';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { transactions, loading } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [subscriptions, setSubscriptions] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const handleScanSubscriptions = async () => {
        if (transactions.length === 0) return;
        setIsScanning(true);
        try {
            const res = await api.post('/ai/detect-subscriptions', { transactions });
            setSubscriptions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error identifying subscriptions:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const getMonthOptions = () => {
        const monthSet = new Set();
        transactions.forEach(t => {
            const date = new Date(t.date || t.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(monthYear);
        });
        return Array.from(monthSet).sort().reverse();
    };

    const monthOptions = getMonthOptions();
    const formatMonthYear = (monthYear) => {
        if (monthYear === 'all') return 'All Time';
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter !== 'all') {
            const matchesFilter = filter === 'business' ? t.isFreelance : !t.isFreelance;
            if (!matchesFilter) return false;
        }
        if (selectedMonth !== 'all') {
            const tDate = new Date(t.date || t.createdAt);
            const tMonthYear = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
            if (tMonthYear !== selectedMonth) return false;
        }
        return true;
    });

    const expenses = filteredTransactions.filter(t => t.amount < 0);
    const incomes = filteredTransactions.filter(t => t.amount >= 0);
    const totalExpense = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-theme animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing your wealth...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 md:pb-10 pt-4 px-2">

            {/* Gen Z Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter">My <span className="text-theme">Wealth</span></h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm font-medium"
                    >
                        Tracking your bread since day one.
                    </motion.p>
                </div>
                <div className="hidden md:flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/add')}
                        className="grad-indigo text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-theme active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add New
                    </motion.button>
                </div>
            </motion.div>

            {/* Premium Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative group cursor-pointer"
            >
                <div className="grad-indigo p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative min-h-[240px] flex flex-col justify-between group-hover:shadow-theme transition-all duration-500 border border-white/10">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] right-[-10%] opacity-20 blur-3xl bg-white w-80 h-80 rounded-full"
                    ></motion.div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                                <motion.h2
                                    className="text-6xl font-black text-white tracking-tighter"
                                    animate={{ opacity: [1, 0.8, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    ₹{netBalance.toLocaleString()}
                                </motion.h2>
                            </div>
                            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-emerald-500/20 rounded-lg">
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Income</span>
                            </div>
                            <p className="text-xl font-bold text-white">₹{totalIncome.toLocaleString()}</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-rose-500/20 rounded-lg">
                                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                                </div>
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Expenses</span>
                            </div>
                            <p className="text-xl font-bold text-white">₹{totalExpense.toLocaleString()}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile FAB */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/add')}
                    className="md:hidden absolute -bottom-6 right-8 w-16 h-16 bg-white text-theme rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20 z-20 transition-transform"
                >
                    <Plus className="w-10 h-10" />
                </motion.button>
            </motion.div>

            {/* Quick Actions / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass px-2 py-2 rounded-3xl flex items-center gap-1 shadow-inner"
                >
                    {['all', 'personal', 'business'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filter === f
                                ? 'bg-theme text-white shadow-lg shadow-theme'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-2"
                >
                    <div className="flex-1 glass px-5 py-3 rounded-3xl flex items-center justify-between border-white/5">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Selected Month</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            {monthOptions.map(month => (
                                <option key={month} value={month}>{formatMonthYear(month)}</option>
                            ))}
                        </select>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleScanSubscriptions}
                        disabled={isScanning}
                        className="glass px-5 py-3 rounded-3xl text-theme font-bold transition-all flex items-center justify-center border-white/5 active:bg-white/5"
                    >
                        {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    </motion.button>
                </motion.div>
            </div>

            {/* Transactions Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2 px-2">
                    <TrendingUp className="w-5 h-5 text-theme" />
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.1em]">Recent Activity</h3>
                </div>
                <div className="anime-fade-in">
                    <TransactionColumns transactions={filteredTransactions} recurringPatterns={subscriptions} selectedMonth={selectedMonth} />
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
