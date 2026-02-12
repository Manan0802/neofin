import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalContext';

const TransactionColumns = ({ transactions, recurringPatterns = [], selectedMonth }) => {
    const { deleteTransaction } = useContext(GlobalContext);

    // Helper to check if a transaction is a recurring one
    const isFixedCost = (text) => {
        return recurringPatterns.some(pattern => text.toLowerCase().includes(pattern.name.toLowerCase()));
    };

    // Split into expenses and income
    const expenses = transactions.filter(t => t.amount < 0);
    const incomes = transactions.filter(t => t.amount >= 0);

    // Calculate totals
    const totalExpense = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0).toFixed(2);
    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0).toFixed(2);

    const categoryIcons = {
        Salary: '💰',
        Freelance: '💻',
        Investment: '📈',
        Food: '🍔',
        Travel: '🚕',
        Entertainment: '🎬',
        Utilities: '💡',
        Shopping: '🛍️',
        Health: '🏥',
        Education: '📚',
        Other: '📝'
    };

    // Transaction Card Component
    const TransactionCard = ({ transaction }) => (
        <li
            className={`group relative bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900/80 ${transaction.isHidden ? 'opacity-50 border-dashed border-slate-700' : ''}`}
        >
            {/* Delete Button */}
            <button
                onClick={() => deleteTransaction(transaction._id)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg z-10"
            >
                x
            </button>

            {/* Edit Button */}
            <Link
                to={`/edit/${transaction._id}`}
                className="absolute -right-3 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg z-10"
            >
                ✎
            </Link>

            <div className="flex items-center space-x-4">
                {/* Category Icon */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {categoryIcons[transaction.category] || '📝'}
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <span className="text-slate-200 font-medium text-sm">{transaction.text}</span>
                    <span className="text-slate-500 text-xs">
                        {new Date(transaction.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                        {isFixedCost(transaction.text) && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 rounded ml-2">
                                Fixed Cost
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Amount */}
            <span className={`font-bold text-lg flex items-center gap-1 ${transaction.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {transaction.isHidden && <span title="Ghost Mode (Hidden)">👻</span>}
                {transaction.isFreelance && <span title="Business/Freelance">💼</span>}
                {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
            </span>
        </li>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT COLUMN: Expenses */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-red-900/30 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-red-900/30">
                    <h3 className="text-red-400 text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>📉</span> Expenses
                    </h3>
                    <span className="text-red-400 font-bold text-xl">₹{totalExpense}</span>
                </div>

                {expenses.length > 0 ? (
                    <ul className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {expenses.map(transaction => (
                            <TransactionCard key={transaction._id} transaction={transaction} />
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <span className="text-3xl mb-2">🎉</span>
                        <p className="text-sm">No expenses yet!</p>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Income */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-900/30 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-emerald-900/30">
                    <h3 className="text-emerald-400 text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>📈</span> Income
                    </h3>
                    <span className="text-emerald-400 font-bold text-xl">₹{totalIncome}</span>
                </div>

                {incomes.length > 0 ? (
                    <ul className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {incomes.map(transaction => (
                            <TransactionCard key={transaction._id} transaction={transaction} />
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <span className="text-3xl mb-2">💸</span>
                        <p className="text-sm">No income yet!</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default TransactionColumns;
