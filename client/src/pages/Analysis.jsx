import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ExportManager from '../components/ExportManager';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { motion } from 'framer-motion';

const Analysis = () => {
    const { transactions } = useContext(GlobalContext);

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const dataMap = expenseTransactions.reduce((acc, t) => {
        const category = t.category;
        const amount = Math.abs(t.amount);
        if (acc[category]) acc[category] += amount;
        else acc[category] = amount;
        return acc;
    }, {});

    const pieData = Object.keys(dataMap).map(key => ({
        name: key,
        value: dataMap[key]
    }));

    const getMonthlyData = () => {
        const data = {};
        expenseTransactions.forEach(t => {
            const dateStr = t.date || t.createdAt || new Date().toISOString();
            const dateObj = new Date(dateStr);
            const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const displayDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            if (!data[key]) {
                data[key] = { date: displayDate, fullDate: key, amount: 0 };
            }
            data[key].amount += Math.abs(t.amount);
        });
        return Object.values(data).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    };

    const chartData = getMonthlyData();
    const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#4ade80', '#fb923c', '#f43f5e', '#facc15'];

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl text-white text-xs">
                    <p className="font-black uppercase tracking-widest text-indigo-400 mb-1">{payload[0].name}</p>
                    <p className="font-bold text-lg text-white">₹{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 space-y-8 anime-fade-in">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
            >
                <h2 className="text-4xl font-black tracking-tighter text-white uppercase">
                    Data <span className="text-indigo-400">Labs</span>
                </h2>
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <PieChart className="w-6 h-6" />
                </div>
            </motion.div>

            {pieData.length > 0 ? (
                <div className="flex flex-col gap-8">
                    <AnalyticsCharts transactions={transactions} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pie Chart Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-[2.5rem] shadow-2xl h-[450px] flex flex-col items-center border-white/5"
                        >
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8 w-full">Expense Heatmap</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl h-fit max-h-[450px] overflow-y-auto no-scrollbar"
                        >
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Top Burners</h3>
                            <div className="flex flex-col gap-3">
                                {pieData.sort((a, b) => b.value - a.value).map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/5 shadow-lg group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-xl shadow-inner border border-white/5">
                                                {item.name === 'Food' ? '🍔' : (item.name === 'Travel' ? '🚕' : (item.name === 'Shopping' ? '🛍️' : '📝'))}
                                            </div>
                                            <div>
                                                <p className="text-slate-200 font-bold tracking-tight">{item.name}</p>
                                                <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '70%' }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-white font-black tracking-tighter text-lg group-hover:text-indigo-400 transition-colors">₹{item.value.toLocaleString()}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Monthly Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl"
                    >
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Burn Rate Over Time</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis hide={true} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                                    />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`bar-${index}`} fill={index === chartData.length - 1 ? '#4ade80' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <ExportManager transactions={transactions} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
                    <span className="text-6xl mb-4">🔮</span>
                    <p className="text-slate-400 font-bold italic text-lg uppercase tracking-widest">The future is yet to be analyzed...</p>
                </div>
            )}
        </div>
    );
};

export default Analysis;
