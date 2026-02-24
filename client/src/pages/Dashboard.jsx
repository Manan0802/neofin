import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Plus } from 'lucide-react';
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

    // Manual Scan Logic (omitted for brevity in view, but keeping in file)
    const handleScanSubscriptions = async () => {
        if (transactions.length === 0) return;
        setIsScanning(true);
        try {
            const res = await api.post('/ai/detect-subscriptions', { transactions });
            if (Array.isArray(res.data) && res.data.length > 0) {
                setSubscriptions(res.data);
            } else {
                setSubscriptions([]);
            }
        } catch (error) {
            console.error("Error identifying subscriptions:", error);
        } finally {
            setIsScanning(false);
        }
    };

    // ... (getMonthOptions and formatMonthYear kept identical)
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

    // Filter Logic
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
    const totalExpense = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0).toFixed(2);
    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0).toFixed(2);
    const netBalance = (totalIncome - totalExpense).toFixed(2);

    return (
        <div className="space-y-6 max-w-7xl mx-auto anime-fade-in pb-10">

            {/* Header Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/add')}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Transaction
                    </button>
                    <button
                        onClick={handleScanSubscriptions}
                        disabled={isScanning || transactions.length === 0}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isScanning ? "Scanning..." : "Scan Subs"}
                    </button>
                </div>
            </div>

            {/* Subscriptions Alert */}
            {subscriptions.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-4 rounded-xl flex flex-col gap-2 shadow-lg animate-pulse-slow">
                    <h4 className="text-indigo-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span>💡</span> Detected Recurring Subscriptions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {subscriptions.map((sub, idx) => (
                            <div key={idx} className="bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-indigo-100 text-sm">
                                <span className="font-semibold">{sub.name}</span>
                                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded ml-1">₹{sub.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter + Month Group */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-700 inline-flex items-center gap-1 shadow-lg backdrop-blur-md">
                    {['all', 'personal', 'business'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            {f === 'business' ? 'Business 💼' : f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm font-medium">📅 Month:</span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-slate-900/80 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors shadow-lg backdrop-blur-md"
                    >
                        <option value="all">All Time</option>
                        {monthOptions.map(month => (
                            <option key={month} value={month}>{formatMonthYear(month)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl text-center relative overflow-hidden transition-all duration-500">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-colors duration-500 ${filter === 'business' ? 'bg-blue-500 shadow-blue-500/50' : filter === 'personal' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-indigo-500 shadow-indigo-500/50'}`}></div>
                <h4 className="text-slate-400 font-medium text-sm tracking-wider uppercase mb-1">
                    {filter === 'all' ? 'Net Balance' : filter === 'business' ? 'Business Balance' : 'Personal Balance'}
                    {selectedMonth !== 'all' && <span className="ml-2 text-indigo-400">({formatMonthYear(selectedMonth)})</span>}
                </h4>
                <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">₹{netBalance}</h1>
                <div className="bg-slate-800/50 rounded-xl p-4 flex justify-around items-center border border-slate-700/50">
                    <div className="text-center">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Income</h4>
                        <p className="text-emerald-400 font-bold text-lg">+₹{totalIncome}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div className="text-center">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense</h4>
                        <p className="text-red-400 font-bold text-lg">-₹{totalExpense}</p>
                    </div>
                </div>
            </div>

            {/* Transaction Columns - Main Content */}
            <TransactionColumns transactions={filteredTransactions} recurringPatterns={subscriptions} selectedMonth={selectedMonth} />
        </div>
    );
};

export default Dashboard;
