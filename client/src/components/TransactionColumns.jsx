import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3 } from 'lucide-react';

const TransactionColumns = ({ transactions, recurringPatterns = [] }) => {
    const { deleteTransaction } = useContext(GlobalContext);

    const isFixedCost = (text) => {
        return recurringPatterns.some(pattern => text.toLowerCase().includes(pattern.name.toLowerCase()));
    };

    const expenses = transactions.filter(t => t.amount < 0);
    const incomes = transactions.filter(t => t.amount >= 0);

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

    const TransactionCard = ({ transaction, index }) => (
        <motion.li
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className={`group relative glass p-4 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/5 transition-all overflow-hidden ${transaction.isHidden ? 'opacity-40 border-dashed' : ''}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:border-indigo-500/50 transition-colors">
                    {categoryIcons[transaction.category] || '📝'}
                </div>

                <div className="flex flex-col">
                    <span className="text-slate-100 font-bold text-sm tracking-tight">{transaction.text}</span>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                        {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {isFixedCost(transaction.text) && (
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 rounded-full ml-2">
                                Sub
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-end relative z-10">
                <span className={`font-black text-lg tracking-tighter ${transaction.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString()}
                </span>
                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/edit/${transaction._id}`} className="text-slate-500 hover:text-indigo-400 transition-colors">
                        <Edit3 className="w-3 h-3" />
                    </Link>
                    <button onClick={() => deleteTransaction(transaction._id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.li>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expenses */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-[2rem] border-rose-500/10"
            >
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Expenses</p>
                        <h3 className="text-3xl font-black text-rose-400 tracking-tighter">₹{totalExpense}</h3>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                        <ArrowRight className="w-6 h-6 rotate-45" />
                    </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                    <AnimatePresence>
                        {expenses.length > 0 ? (
                            expenses.map((t, i) => <TransactionCard key={t._id} transaction={t} index={i} />)
                        ) : (
                            <p className="text-center text-slate-600 py-10 font-bold italic">No bread lost yet...</p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Income */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-[2rem] border-emerald-500/10"
            >
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Income</p>
                        <h3 className="text-3xl font-black text-emerald-400 tracking-tighter">₹{totalIncome}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                        <ArrowRight className="w-6 h-6 -rotate-45" />
                    </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                    <AnimatePresence>
                        {incomes.length > 0 ? (
                            incomes.map((t, i) => <TransactionCard key={t._id} transaction={t} index={i} />)
                        ) : (
                            <p className="text-center text-slate-600 py-10 font-bold italic">Waiting for the bag...</p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const ArrowRight = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

export default TransactionColumns;
