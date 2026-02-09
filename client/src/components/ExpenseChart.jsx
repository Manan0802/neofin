import React, { useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { GlobalContext } from '../context/GlobalContext';

const ExpenseChart = () => {
    const { transactions } = useContext(GlobalContext);

    // 1. Filter Expenses
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && !t.isHidden);

    // 2. Aggregate Data by Category
    const categoryTotals = expenseTransactions.reduce((acc, current) => {
        const category = current.category;
        const amount = Math.abs(current.amount);

        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += amount;
        return acc;
    }, {});

    // 3. Transform for Recharts
    const data = Object.keys(categoryTotals).map(key => ({
        name: key,
        value: categoryTotals[key]
    }));

    // Define Colors for Categories
    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#64748b'];
    // Emerald, Blue, Purple, Amber, Red, Pink, Indigo, Teal, Orange, Lime, Slate

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg text-xs">
                    <p className="text-slate-300 mb-1 font-semibold">{payload[0].name}</p>
                    <p className="text-emerald-400 font-mono">₹{payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return null; // Don't render if no expenses
    }

    return (
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl mt-6">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
                Expense Breakdown
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {data.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-xs text-slate-400">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseChart;
