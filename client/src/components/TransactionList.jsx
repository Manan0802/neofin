import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalContext';

const TransactionList = ({ customTransactions, recurringPatterns = [] }) => {
    const { transactions: contextTransactions, deleteTransaction } = useContext(GlobalContext);

    // Use passed transactions if available, else use all from context
    const transactions = customTransactions || contextTransactions;

    // Helper to check if a transaction is a recurring one
    const isFixedCost = (text) => {
        return recurringPatterns.some(pattern => text.toLowerCase().includes(pattern.name.toLowerCase()));
    };

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

    return (
        <div className="mt-8 w-full">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
                History
            </h3>
            <ul className="space-y-3">
                {transactions.map(transaction => (
                    <li
                        key={transaction._id}
                        className={`group relative bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900/80 ${transaction.isHidden ? 'opacity-50 border-dashed border-slate-700' : ''}`}
                    >
                        {/* Delete Button (Hidden by default, shows on hover) */}
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
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;