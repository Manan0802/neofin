import React, { useContext } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsCharts = ({ transactions }) => {
    // 1. Process Data for Income vs Expense (Bar Chart)
    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // Bar Data - ensure we have at least 0 to avoid errors, though recharts handles 0 fine
    const barData = [
        { name: 'Income', amount: income },
        { name: 'Expense', amount: expense }
    ];

    // 2. Process Data for Expenses by Category (Pie Chart)
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
        // Use category or 'Uncategorized'
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    const pieData = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
    })).sort((a, b) => b.value - a.value); // Sort by value desc

    // Colors
    const COLORS_PIE = ['#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#3b82f6', '#14b8a6'];
    // Red, Orange, Purple, Pink, Yellow, Blue, Teal

    const COLOR_INCOME = '#10b981'; // Emerald-500
    const COLOR_EXPENSE = '#ef4444'; // Red-500

    // Custom Tooltip for Pie Chart
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg z-50">
                    <p className="text-white font-semibold text-sm">{payload[0].name}</p>
                    <p className="text-slate-300 text-xs font-mono">₹{payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip for Bar Chart
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg z-50">
                    <p className="text-white font-semibold text-sm">{payload[0].payload.name}</p>
                    <p className="text-slate-300 text-xs font-mono">₹{payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
            {/* Income vs Expense Bar Chart */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                    Income vs Expense
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1000}>
                                {
                                    barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? COLOR_INCOME : COLOR_EXPENSE} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expense by Category Pie Chart */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                    Expense Breakdown
                </h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={4}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomPieTooltip />} />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-slate-500 text-sm flex flex-col items-center">
                            <p>No expense data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
