import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import { GlobalContext } from '../context/GlobalContext';
import api from '../api';
import TransactionColumns from '../components/TransactionColumns';

const Dashboard = () => {
    const { transactions } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // 'all', 'personal', 'business'
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24 md:pb-10 pt-4 px-2">

            {/* Gen Z Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tighter">My <span className="text-indigo-400">Wealth</span></h1>
                    <p className="text-slate-500 text-sm font-medium">Tracking your bread since day one.</p>
                </div>
                <div className="hidden md:flex gap-3">
                    <button
                        onClick={() => navigate('/add')}
                        className="grad-indigo text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add New
                    </button>
                </div>
            </div>

            {/* Premium Balance Card */}
            <div className="relative group perspective">
                <div className="grad-indigo p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative min-h-[220px] flex flex-col justify-between group-hover:shadow-indigo-500/40 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl bg-white w-64 h-64 rounded-full -mr-20 -mt-20"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-100/70 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                                <h2 className="text-5xl font-black text-white tracking-tighter">₹{netBalance.toLocaleString()}</h2>
                            </div>
                            <Wallet className="w-10 h-10 text-white/20" />
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-emerald-500/20 rounded-lg">
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span className="text-indigo-100/60 text-[10px] font-bold uppercase">Income</span>
                            </div>
                            <p className="text-xl font-bold text-white">₹{totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-rose-500/20 rounded-lg">
                                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                                </div>
                                <span className="text-indigo-100/60 text-[10px] font-bold uppercase">Expenses</span>
                            </div>
                            <p className="text-xl font-bold text-white">₹{totalExpense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Add Button Floating Alternative (FAB-ish) */}
                <button
                    onClick={() => navigate('/add')}
                    className="md:hidden absolute -bottom-4 right-8 w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 z-20 active:scale-90 transition-transform"
                >
                    <Plus className="w-8 h-8" />
                </button>
            </div>

            {/* Quick Actions / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass px-2 py-2 rounded-2xl flex items-center gap-1 shadow-inner">
                    {['all', 'personal', 'business'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 glass px-4 py-3 rounded-2xl flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Selected Month</span>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent text-white font-bold text-sm focus:outline-none"
                        >
                            <option value="all">All Time</option>
                            {monthOptions.map(month => (
                                <option key={month} value={month}>{formatMonthYear(month)}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleScanSubscriptions}
                        disabled={isScanning}
                        className="glass px-4 py-3 rounded-2xl text-indigo-400 font-bold active:scale-95 transition-all flex items-center justify-center"
                    >
                        {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
                </div>
                <TransactionColumns transactions={filteredTransactions} recurringPatterns={subscriptions} selectedMonth={selectedMonth} />
            </div>
        </div>
    );
};

export default Dashboard;
