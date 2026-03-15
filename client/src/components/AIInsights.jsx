import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, TrendingUp, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const AIInsights = ({ transactions }) => {
    const insights = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const results = [];
        const incomes = transactions.filter(t => t.amount > 0);
        const expenses = transactions.filter(t => t.amount < 0);

        const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;

        // Insight 1: Savings Rate
        if (savingsRate > 20) {
            results.push({
                icon: <CheckCircle className="text-emerald-400" />,
                title: "Healthy Savings Rate",
                desc: `You're saving ${savingsRate}% of your income. This is above the recommended 20% rule! Great job.`,
                color: "emerald"
            });
        } else if (savingsRate > 0) {
            results.push({
                icon: <Zap className="text-amber-400" />,
                title: "Increase Your Savings",
                desc: `Your savings rate is ${savingsRate}%. Try to reach 20% by cutting small daily expenses.`,
                color: "amber"
            });
        } else if (totalIncome > 0) {
            results.push({
                icon: <AlertTriangle className="text-red-400" />,
                title: "Spending Exceeds Income",
                desc: "Your expenses are higher than your income this period. Review your biggest categories to find cuts.",
                color: "red"
            });
        }

        // Insight 2: Top Expense Category
        const catTotals = expenses.reduce((acc, t) => {
            const cat = t.category || 'Other';
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
        if (topCat) {
            results.push({
                icon: <TrendingUp className="text-indigo-400" />,
                title: `High Spending in ${topCat[0]}`,
                desc: `₹${topCat[1].toLocaleString()} was spent on ${topCat[0]}. This accounts for ${((topCat[1] / totalExpense) * 100).toFixed(0)}% of your total expenses.`,
                color: "indigo"
            });
        }

        // Insight 3: Freelance vs Personal (if data exists)
        const businessExp = expenses.filter(t => t.isFreelance).reduce((acc, t) => acc + Math.abs(t.amount), 0);
        if (businessExp > totalExpense * 0.5) {
            results.push({
                icon: <Lightbulb className="text-blue-400" />,
                title: "Business Focus",
                desc: "Over 50% of your expenses are business-related. Consider a dedicated tax-saving account for these.",
                color: "blue"
            });
        }

        // Insight 4: Frequent Small Expenses
        const smallExpenses = expenses.filter(t => Math.abs(t.amount) < 500);
        if (smallExpenses.length > 10) {
            results.push({
                icon: <TrendingDown className="text-fuchsia-400" />,
                title: "Death by a Thousand Cuts",
                desc: `You have ${smallExpenses.length} small transactions under ₹500. These "mini-spends" often add up to more than you realize.`,
                color: "fuchsia"
            });
        }

        return results.slice(0, 3); // Top 3 insights
    }, [transactions]);

    if (insights.length === 0) return null;

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mt-8">
            <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="text-amber-400 w-5 h-5" />
                <h3 className="text-white font-bold text-lg">AI Financial Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border border-${insight.color}-500/20 bg-${insight.color}-500/5 hover:bg-${insight.color}-500/10 transition-colors`}>
                        <div className="flex items-center gap-3 mb-2">
                            {insight.icon}
                            <h4 className="text-white font-bold text-sm">{insight.title}</h4>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            {insight.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-right">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Powered by NeoFin Intelligence</span>
            </div>
        </div>
    );
};

export default AIInsights;
