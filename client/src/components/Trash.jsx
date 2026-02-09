import React, { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';

const Trash = () => {
    const { trash, getTrash, restoreTransaction, deletePermanent } = useContext(GlobalContext);

    useEffect(() => {
        getTrash();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100">Recycle Bin</h2>
                <p className="text-slate-400 text-sm">Manage deleted transactions</p>
            </div>

            {trash.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-md p-10 rounded-2xl border border-slate-800 text-center">
                    <div className="text-5xl mb-4">♻️</div>
                    <h3 className="text-xl text-slate-300 font-semibold">Recycle Bin is Empty</h3>
                    <p className="text-slate-500 mt-2">No deleted transactions found.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {trash.map(transaction => (
                        <li
                            key={transaction._id}
                            className="group bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-800 hover:border-slate-600 transition-all hover:bg-slate-900/80"
                        >
                            <div className="flex items-center space-x-4">
                                {/* Category Icon */}
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl grayscale opacity-70">
                                    {categoryIcons[transaction.category] || '📝'}
                                </div>

                                {/* Details */}
                                <div className="flex flex-col opacity-70 group-hover:opacity-100 transition-opacity">
                                    <span className="text-slate-300 font-medium text-sm line-through decoration-slate-500">{transaction.text}</span>
                                    <span className="text-slate-500 text-xs">
                                        Deleted on: {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                                <span className={`font-bold mr-4 opacity-50 ${transaction.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
                                </span>

                                <button
                                    onClick={() => restoreTransaction(transaction._id)}
                                    title="Restore"
                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-colors border border-emerald-500/20"
                                >
                                    ♻️
                                </button>
                                <button
                                    onClick={() => deletePermanent(transaction._id)}
                                    title="Delete Forever"
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-colors border border-red-500/20"
                                >
                                    🔥
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Trash;
