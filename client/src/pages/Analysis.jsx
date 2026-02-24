import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ExportManager from '../components/ExportManager';

const Analysis = () => {
    const { transactions } = useContext(GlobalContext);

    // 1. Filter only expenses
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // --- PIE CHART DATA (Category Distribution) ---
    const dataMap = expenseTransactions.reduce((acc, t) => {
        const category = t.category;
        const amount = Math.abs(t.amount); // Ensure positive
        if (acc[category]) {
            acc[category] += amount;
        } else {
            acc[category] = amount;
        }
        return acc;
    }, {});

    const pieData = Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    }));

    // --- BAR CHART DATA (Monthly Trend) ---
    const getMonthlyData = () => {
        const data = {};

        expenseTransactions.forEach(t => {
            const dateStr = t.date || t.createdAt || new Date().toISOString();
            const dateObj = new Date(dateStr);
            // Key format: "YYYY-MM" for sorting
            const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

            // Display format: "Jan 2026"
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const displayDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

            if (!data[key]) {
                data[key] = {
                    date: displayDate, // for XAxis
                    fullDate: key,     // for sorting
                    amount: 0
                };
            }
            data[key].amount += Math.abs(t.amount);
        });

        // Convert to array and sort by fullDate
        return Object.values(data).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    };

    const chartData = getMonthlyData();

    // Cyberpunk Neon Palette
    const COLORS = ['#ff0055', '#00ff99', '#00ccff', '#ffcc00', '#9900ff', '#ff00cc', '#00ffff'];

    // Custom Tooltip for Pie Chart
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-lg text-white text-xs">
                    <p className="font-bold">{`${payload[0].name}: ₹${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center gap-3">
                <span>📊</span> Spending Analysis
            </h2>

            {pieData.length > 0 ? (
                <div className="flex flex-col gap-8">

                    {/* TOP SECTION: Pie & List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pie Chart Card */}
                        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl text-gray-300 font-semibold mb-4 w-full text-left border-b border-slate-700 pb-2">Expense Distribution</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl h-fit max-h-[400px] overflow-y-auto custom-scrollbar">
                            <h3 className="text-xl text-gray-300 font-semibold mb-4 border-b border-slate-700 pb-2">Top Categories</h3>
                            <div className="flex flex-col gap-4">
                                {pieData.sort((a, b) => b.value - a.value).map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}` }}></div>
                                            <span className="text-gray-200 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-white font-bold">₹{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Monthly Trend Chart */}
                    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <h3 className="text-xl text-gray-300 font-semibold mb-6 border-b border-slate-700 pb-2">Monthly Spending Trend</h3>

                        {/* Explicit Height Container for Recharts */}
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis hide={true} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [`₹${value}`, 'Spent']}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="#8b5cf6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={50}
                                        animationDuration={1500}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`bar-${index}`} fill={index === chartData.length - 1 ? '#00ff99' : '#8b5cf6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Export Options */}
                    <ExportManager transactions={transactions} />

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700">
                    <span className="text-4xl mb-4">📉</span>
                    <p className="text-lg">No expenses to analyze yet. Add some!</p>
                </div>
            )}
        </div>
    );
};

export default Analysis;
