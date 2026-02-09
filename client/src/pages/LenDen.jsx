import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';

const LenDen = () => {
    const { debts, addDebt, deleteDebt } = useContext(GlobalContext);

    // Form State
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('lent'); // 'lent' (Green/In) or 'borrowed' (Red/Out)

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!personName || !amount) {
            alert("Please enter both Person Name and Amount.");
            return;
        }

        const newDebt = {
            id: Math.floor(Math.random() * 100000000), // Temp ID
            person: personName,
            amount: +amount,
            type: type,
            date: new Date().toISOString()
        };

        addDebt(newDebt);

        // Reset
        setPersonName('');
        setAmount('');
        setType('lent');
    };

    // Filter Lists
    const lentList = debts.filter(d => d.type === 'lent');
    const borrowedList = debts.filter(d => d.type === 'borrowed');

    // Calculate Totals
    const totalLent = lentList.reduce((acc, item) => acc + item.amount, 0);
    const totalBorrowed = borrowedList.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <span className="text-3xl">🤝</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Len-Den <span className="text-gray-500 text-lg font-normal">(Debt Tracker)</span></h1>
                    <p className="text-slate-400 text-sm">Track your loans and borrowings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN: ADD NEW DEBT --- */}
                <div className="lg:col-span-1 h-fit">
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>📝</span> Add Entry
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Person Name</label>
                                <input
                                    type="text"
                                    value={personName}
                                    onChange={(e) => setPersonName(e.target.value)}
                                    placeholder="e.g. Rahul, John..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="₹ 0"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setType('lent')}
                                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${type === 'lent'
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'bg-slate-800 border-slate-700 text-gray-500 hover:bg-slate-700'}`}
                                    >
                                        <span className="text-xl">➕</span>
                                        <span className="text-sm font-bold">You Lent</span>
                                        <span className="text-xs opacity-70">(Lene hain)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setType('borrowed')}
                                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${type === 'borrowed'
                                            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : 'bg-slate-800 border-slate-700 text-gray-500 hover:bg-slate-700'}`}
                                    >
                                        <span className="text-xl">➖</span>
                                        <span className="text-sm font-bold">You Borrowed</span>
                                        <span className="text-xs opacity-70">(Dene hain)</span>
                                    </button>
                                </div>
                            </div>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98] mt-4">
                                Add Record
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: LISTS --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. LENT (YOU WILL GET) */}
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                <span>🤑</span> Friends who owe YOU
                            </h3>
                            <span className="text-lg font-bold text-white bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                                Total: ₹{totalLent}
                            </span>
                        </div>

                        {lentList.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 italic">No pending collections.</p>
                        ) : (
                            <div className="space-y-3">
                                {lentList.map(debt => (
                                    <div key={debt.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                                                {debt.person.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{debt.person}</p>
                                                <p className="text-xs text-gray-400">{new Date(debt.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-emerald-400 font-bold text-lg">+ ₹{debt.amount}</span>
                                            <button
                                                onClick={() => { if (window.confirm('Mark as settled?')) deleteDebt(debt.id) }}
                                                className="p-2 text-gray-500 hover:text-white bg-slate-700 hover:bg-emerald-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Settle"
                                            >
                                                ✔️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. BORROWED (YOU MUST PAY) */}
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                                <span>💸</span> People YOU need to pay
                            </h3>
                            <span className="text-lg font-bold text-white bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
                                Total: ₹{totalBorrowed}
                            </span>
                        </div>

                        {borrowedList.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 italic">You are debt free!</p>
                        ) : (
                            <div className="space-y-3">
                                {borrowedList.map(debt => (
                                    <div key={debt.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold border border-red-500/20">
                                                {debt.person.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{debt.person}</p>
                                                <p className="text-xs text-gray-400">{new Date(debt.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-red-400 font-bold text-lg">- ₹{debt.amount}</span>
                                            <button
                                                onClick={() => { if (window.confirm('Mark as paid/settled?')) deleteDebt(debt.id) }}
                                                className="p-2 text-gray-500 hover:text-white bg-slate-700 hover:bg-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Settle"
                                            >
                                                ✔️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LenDen;
