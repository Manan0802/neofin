import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import CategoryBudget from '../components/CategoryBudget';
import { Target } from 'lucide-react';

const BudgetsPage = () => {
    const { transactions } = useContext(GlobalContext);

    return (
        <div className="max-w-7xl mx-auto space-y-8 anime-fade-in">
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Category Budgets</h1>
                <p className="text-slate-400 mt-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Set and manage monthly spending limits for your categories
                </p>
            </div>

            <CategoryBudget transactions={transactions} />

            <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-2xl">
                <h3 className="text-indigo-300 font-bold mb-2">Budgeting Tip</h3>
                <p className="text-slate-400 text-sm">
                    The 50/30/20 rule is a great starting point: spend 50% on needs, 30% on wants, and save 20%. Adjust your category budgets here to align with your financial goals!
                </p>
            </div>
        </div>
    );
};

export default BudgetsPage;
