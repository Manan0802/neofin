import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, AlertCircle } from 'lucide-react';

const CategoryBudget = ({ transactions }) => {
    const [budgets, setBudgets] = useState(() => {
        const saved = localStorage.getItem('categoryBudgets');
        return saved ? JSON.parse(saved) : [];
    });

    const [showAdd, setShowAdd] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '' });

    useEffect(() => {
        localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
    }, [budgets]);

    // Calculate current spending per category
    const categorySpending = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
            const cat = t.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

    const handleAddBudget = (e) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) return;

        // Update existing or add new
        const existingIndex = budgets.findIndex(b => b.category === newBudget.category);
        if (existingIndex > -1) {
            const updated = [...budgets];
            updated[existingIndex].amount = parseFloat(newBudget.amount);
            setBudgets(updated);
        } else {
            setBudgets([...budgets, { id: Date.now(), category: newBudget.category, amount: parseFloat(newBudget.amount) }]);
        }

        setNewBudget({ category: '', amount: '' });
        setShowAdd(false);
    };

    const deleteBudget = (id) => {
        setBudgets(budgets.filter(b => b.id !== id));
    };

    // Extract unique categories from transactions for the dropdown
    const availableCategories = Array.from(new Set(transactions.map(t => t.category || 'Uncategorized')));

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mt-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Wallet className="text-blue-400 w-5 h-5" />
                    <h3 className="text-white font-bold text-lg">Category Budgets</h3>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAddBudget} className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={newBudget.category}
                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="Custom">Custom...</option>
                        </select>
                        {newBudget.category === 'Custom' && (
                            <input
                                type="text"
                                placeholder="Custom Category Name"
                                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                className="bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 mt-2"
                            />
                        )}
                        <input
                            type="number"
                            placeholder="Monthly Limit (₹)"
                            value={newBudget.amount}
                            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAdd(false)}
                            className="px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
                        >
                            Set Budget
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.length === 0 ? (
                    <div className="text-center py-8 col-span-2">
                        <p className="text-slate-500 text-sm italic">No budgets set. Control your spending by setting limits!</p>
                    </div>
                ) : (
                    budgets.map(budget => {
                        const spent = categorySpending[budget.category] || 0;
                        const progress = Math.min((spent / budget.amount) * 100, 100).toFixed(1);
                        const remaining = Math.max(budget.amount - spent, 0).toFixed(2);
                        const isOver = spent > budget.amount;

                        return (
                            <div key={budget.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{budget.category}</h4>
                                        <p className="text-slate-400 text-xs mt-1">
                                            Limit: <span className="text-slate-200">₹{budget.amount.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteBudget(budget.id)}
                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold mb-1">
                                        <span className={isOver ? "text-red-400" : "text-blue-400"}>
                                            {isOver ? "Over Budget!" : `${progress}% Spent`}
                                        </span>
                                        <span className="text-slate-500">₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    {!isOver && (
                                        <p className="text-[10px] text-slate-500 mt-2 text-right italic">
                                            ₹{remaining} remaining this month
                                        </p>
                                    )}
                                </div>

                                {isOver && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                                        <AlertCircle className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CategoryBudget;
