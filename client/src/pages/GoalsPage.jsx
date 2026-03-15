import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import SavingsGoals from '../components/SavingsGoals';
import { Trophy } from 'lucide-react';

const GoalsPage = () => {
    const { transactions } = useContext(GlobalContext);

    // Calculate totals
    const expenses = transactions.filter(t => t.amount < 0);
    const incomes = transactions.filter(t => t.amount >= 0);
    const totalExpense = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return (
        <div className="max-w-7xl mx-auto space-y-8 anime-fade-in">
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Savings Goals</h1>
                <p className="text-slate-400 mt-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Turn your dreams into reality with target-based savings
                </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Available for Goals</p>
                    <h2 className="text-3xl font-bold text-white">₹{netBalance.toFixed(2)}</h2>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-emerald-400 text-sm font-bold">Safe to Save</p>
                    <p className="text-slate-500 text-xs mt-1">Calculated from total net balance</p>
                </div>
            </div>

            <SavingsGoals currentBalance={netBalance} />
        </div>
    );
};

export default GoalsPage;
