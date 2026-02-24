import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, CheckCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SplitPage = () => {
    const navigate = useNavigate();
    const { splits, getSplits, addSplit, settleSplit, deleteSplit } = useContext(GlobalContext);

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        text: '',
        totalAmount: '',
        payer: 'You',
        friends: [{ name: '', amount: '' }]
    });

    useEffect(() => {
        getSplits();
    }, []);

    const handleAddFriend = () => {
        setFormData({
            ...formData,
            friends: [...formData.friends, { name: '', amount: '' }]
        });
    };

    const handleFriendChange = (index, field, value) => {
        const newFriends = [...formData.friends];
        newFriends[index][field] = value;
        setFormData({ ...formData, friends: newFriends });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const splitData = {
            text: formData.text,
            totalAmount: Number(formData.totalAmount),
            payer: formData.payer,
            splits: formData.friends.map(f => ({
                name: f.name,
                amount: Number(f.amount),
                isSettled: false
            }))
        };
        await addSplit(splitData);
        setIsAdding(false);
        setFormData({ text: '', totalAmount: '', payer: 'You', friends: [{ name: '', amount: '' }] });
    };

    const totalOwedToMe = splits?.reduce((acc, split) => {
        return acc + split.splits.filter(s => !s.isSettled).reduce((sub, s) => sub + s.amount, 0);
    }, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 glass rounded-xl text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Split<span className="text-theme">Wise</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Bills with the squad</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(!isAdding)}
                    className="grad-indigo p-4 rounded-2xl text-white shadow-xl shadow-theme"
                >
                    {isAdding ? <ArrowLeft className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </motion.button>
            </div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grad-cyan p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl bg-white w-40 h-40 rounded-full -mr-10 -mt-10"></div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">Who owes you</p>
                <h2 className="text-5xl font-black text-white tracking-tighter">₹{totalOwedToMe?.toLocaleString() || 0}</h2>

                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold">
                    <Users className="w-4 h-4" />
                    {splits?.length || 0} Shared Bills
                </div>
            </motion.div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bill Description</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-theme outline-none transition-all"
                                        placeholder="e.g. Goa Trip, Dinner"
                                        value={formData.text}
                                        onChange={e => setFormData({ ...formData, text: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:border-theme outline-none transition-all"
                                        placeholder="0.00"
                                        value={formData.totalAmount}
                                        onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Participants</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddFriend}
                                        className="text-xs font-bold text-theme flex items-center gap-1"
                                    >
                                        <UserPlus className="w-4 h-4" /> Add Person
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.friends.map((friend, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                className="flex-1 bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:border-theme outline-none"
                                                placeholder="Name"
                                                value={friend.name}
                                                onChange={e => handleFriendChange(idx, 'name', e.target.value)}
                                                required
                                            />
                                            <input
                                                type="number"
                                                className="w-24 bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-bold focus:border-theme outline-none"
                                                placeholder="Amount"
                                                value={friend.amount}
                                                onChange={e => handleFriendChange(idx, 'amount', e.target.value)}
                                                required
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full grad-indigo py-4 rounded-2xl text-white font-black tracking-widest uppercase text-sm shadow-xl shadow-theme">
                                Create Split
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Split List */}
            <div className="grid grid-cols-1 gap-6">
                {splits?.map((split, i) => (
                    <motion.div
                        key={split._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-[2rem] border-white/5 group relative"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tighter">{split.text}</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {new Date(split.date).toLocaleDateString()} • Paid by {split.payer}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Bill</p>
                                <p className="text-2xl font-black text-white tracking-tighter">₹{split.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {split.splits.map((s, j) => (
                                <div key={j} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-transparent hover:border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${s.isSettled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                            {s.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-100">{s.name}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${s.isSettled ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {s.isSettled ? 'Settled' : 'Must Pay'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className={`text-lg font-black tracking-tighter ${s.isSettled ? 'text-slate-600 line-through' : 'text-white'}`}>₹{s.amount.toLocaleString()}</p>
                                        {!s.isSettled && (
                                            <button
                                                onClick={() => settleSplit(split._id, s.name)}
                                                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => deleteSplit(split._id)}
                            className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {splits?.length === 0 && !isAdding && (
                <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No shared bills yet. Be the one who pays!</p>
                </div>
            )}
        </div>
    );
};

export default SplitPage;
