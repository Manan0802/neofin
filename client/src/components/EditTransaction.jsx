import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { useNavigate, useParams } from 'react-router-dom';

const EditTransaction = () => {
    const { transactions, editTransaction } = useContext(GlobalContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const transactionId = id;
        const selectedTransaction = transactions.find(t => t._id === transactionId);

        if (selectedTransaction) {
            setText(selectedTransaction.text);
            setAmount(selectedTransaction.amount);
            setCategory(selectedTransaction.category || 'Other');
            setIsHidden(selectedTransaction.isHidden || false);
        }
    }, [id, transactions]);

    const onSubmit = (e) => {
        e.preventDefault();

        const numberAmount = +amount;
        if (numberAmount === 0) return;

        const type = numberAmount >= 0 ? 'income' : 'expense';

        const updatedTransaction = {
            _id: id,
            text,
            amount: numberAmount,
            type,
            category,
            category,
            date: new Date(), // Updates date to modified time
            isHidden
        };

        editTransaction(updatedTransaction);
        navigate('/');
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-800 mt-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">
                Edit Transaction
            </h3>
            <form onSubmit={onSubmit}>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        placeholder="e.g. Starbucks, Client Payment"
                        required
                    />
                </div>

                {/* Amount & Category Row */}
                <div className="flex gap-4 mb-6">

                    {/* Amount */}
                    <div className="flex-1">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                            Amount (+/-)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 transition-all"
                            placeholder="-500 or 5000"
                            required
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="flex-1">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 transition-all appearance-none"
                        >
                            <option value="Salary">💰 Salary</option>
                            <option value="Freelance">💻 Freelance</option>
                            <option value="Investment">📈 Investment</option>
                            <option value="Food">🍔 Food</option>
                            <option value="Travel">🚕 Travel</option>
                            <option value="Entertainment">🎬 Fun</option>
                            <option value="Utilities">💡 Bills</option>
                            <option value="Shopping">🛍️ Shopping</option>
                            <option value="Health">🏥 Health</option>
                            <option value="Education">📚 Education</option>
                            <option value="Other">📝 Other</option>
                        </select>
                    </div>
                </div>

                {/* Ghost Mode Toggle */}
                <div className="flex items-center mb-6">
                    <input
                        id="ghost-mode-edit"
                        type="checkbox"
                        checked={isHidden}
                        onChange={(e) => setIsHidden(e.target.checked)}
                        className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 ring-offset-gray-800 focus:ring-2"
                    />
                    <label htmlFor="ghost-mode-edit" className="ml-2 text-sm font-medium text-slate-300">
                        👻 <span className="text-slate-400">Hide from Balance (Ghost Mode)</span>
                    </label>
                </div>

                <div className="flex space-x-3">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform active:scale-95 transition-all duration-200">
                        Update
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg shadow-lg transform active:scale-95 transition-all duration-200">
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditTransaction;
