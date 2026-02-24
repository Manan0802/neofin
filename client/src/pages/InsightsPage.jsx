import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import AIInsights from '../components/AIInsights';
import { Sparkles } from 'lucide-react';

const InsightsPage = () => {
    const { transactions } = useContext(GlobalContext);

    return (
        <div className="max-w-7xl mx-auto space-y-8 anime-fade-in">
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Insights</h1>
                <p className="text-slate-400 mt-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI-powered analysis of your spending habits and financial health
                </p>
            </div>

            <AIInsights transactions={transactions} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-white font-bold mb-4">How it works</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Our AI engine scans your transaction history to identify patterns, recurring costs, and potential savings opportunities. The more transactions you add, the more accurate your insights become.
                    </p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-white font-bold mb-4">Privacy First</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Your data is analyzed locally on your device to ensure maximum privacy. We only use your transaction categories and amounts to generate these helpful tips.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
