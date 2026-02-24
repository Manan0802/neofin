import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';

const SavingsGoals = ({ currentBalance }) => {
    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem('savingsGoals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    });
    
    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target: '' });

    useEffect(() => {
        localStorage.setItem('savingsGoals', JSON.stringify(goals));
    }, [goals]);

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.target) return;
        
        const goal = {
            id: Date.now(),
            name: newGoal.name,
            target: parseFloat(newGoal.target),
            current: 0 // In a more complex app, this could be allocated savings
        };
        
        setGoals([...goals, goal]);
        setNewGoal({ name: '', target: '' });
        setShowAdd(false);
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mt-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Target className="text-emerald-400 w-5 h-5" />
                    <h3 className="text-white font-bold text-lg">Savings Goals</h3>
                </div>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Goal Name (e.g. New Car)" 
                            value={newGoal.name}
                            onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                            className="bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <input 
                            type="number" 
                            placeholder="Target Amount (₹)" 
                            value={newGoal.target}
                            onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                            className="bg-slate-900 border border-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
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
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                        >
                            Save Goal
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {goals.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500 text-sm italic">No goals set yet. Start saving for something special!</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        // For simplicity, we assume 'current' savings is the balance, capped at goal target
                        // or we could let user allocate money. Let's show progress relative to current balance
                        const progress = Math.min((currentBalance / goal.target) * 100, 100).toFixed(1);
                        const isCompleted = parseFloat(progress) >= 100;

                        return (
                            <div key={goal.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{goal.name}</h4>
                                        <p className="text-slate-400 text-xs mt-1">
                                            Target: <span className="text-slate-200">₹{goal.target.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => deleteGoal(goal.id)}
                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold mb-1">
                                        <span className={isCompleted ? "text-emerald-400" : "text-indigo-400"}>
                                            {isCompleted ? "Goal Reached!" : `${progress}% Complete`}
                                        </span>
                                        <span className="text-slate-500">₹{currentBalance.toLocaleString()} / ₹{goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {goals.length > 0 && (
                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <p>Calculated based on your current net balance.</p>
                </div>
            )}
        </div>
    );
};

export default SavingsGoals;
