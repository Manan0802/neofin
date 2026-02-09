import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { GlobalContext } from './context/GlobalContext';

// Components
import Navbar from './components/Navbar';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import EditTransaction from './components/EditTransaction';
import ExpenseChart from './components/ExpenseChart';
import Trash from './components/Trash';
import LenDen from './pages/LenDen';

import api from './api';

// New Dashboard Component created internally for better state management
const Dashboard = () => {
  const { transactions } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'personal', 'business'
  const [subscriptions, setSubscriptions] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Manual Scan Logic
  const handleScanSubscriptions = async () => {
    if (transactions.length === 0) return;

    setIsScanning(true);
    try {
      const res = await api.post('/ai/detect-subscriptions', { transactions });
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log("Detected Subs:", res.data);
        setSubscriptions(res.data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Error identifying subscriptions:", error);
    } finally {
      setIsScanning(false);
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return filter === 'business' ? t.isFreelance : !t.isFreelance;
  });

  const amounts = filteredTransactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

  return (
    <div className="space-y-6 max-w-3xl mx-auto anime-fade-in">

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/add')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
          <button
            onClick={handleScanSubscriptions}
            disabled={isScanning || transactions.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isScanning ? "Scanning..." : "Scan Subs"}
          </button>
        </div>
      </div>

      {/* Alerts for Recurring Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-4 rounded-xl flex flex-col gap-2 shadow-lg animate-pulse-slow">
          <h4 className="text-indigo-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
            <span>💡</span> Detected Recurring Subscriptions
          </h4>
          <div className="flex flex-wrap gap-2">
            {subscriptions.map((sub, idx) => (
              <div key={idx} className="bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-indigo-100 text-sm">
                <span className="font-semibold">{sub.name}</span>
                <span className="text-indigo-300 text-xs">({sub.frequency})</span>
                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded ml-1">₹{sub.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Group */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-700 inline-flex items-center gap-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('personal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'personal' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}
          >
            Personal
          </button>
          <button
            onClick={() => setFilter('business')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'business' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}
          >
            Business 💼
          </button>
        </div>
      </div>

      {/* Balance Card (Filtered) */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl text-center relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-colors duration-500 ${filter === 'business' ? 'bg-blue-500 shadow-blue-500/50' : filter === 'personal' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-indigo-500 shadow-indigo-500/50'}`}></div>

        <h4 className="text-slate-400 font-medium text-sm tracking-wider uppercase mb-1">
          {filter === 'all' ? 'Total Balance' : filter === 'business' ? 'Business Balance' : 'Personal Balance'}
        </h4>
        <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">₹{total}</h1>

        <div className="bg-slate-800/50 rounded-xl p-4 flex justify-around items-center border border-slate-700/50">
          <div className="text-center">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Income</h4>
            <p className="text-emerald-400 font-bold text-lg">+₹{income}</p>
          </div>
          <div className="w-px h-10 bg-slate-700"></div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense</h4>
            <p className="text-red-400 font-bold text-lg">-₹{expense}</p>
          </div>
        </div>
      </div>

      {/* Transactions (Filtered List Props + Subscription Patterns) */}
      <TransactionList customTransactions={filteredTransactions} recurringPatterns={subscriptions} />
    </div>
  );
};

function App() {
  const { getTransactions } = useContext(GlobalContext);

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-inter">

        <Navbar />

        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <Routes>

            {/* Dashboard Route */}
            <Route path="/" element={<Dashboard />} />

            {/* Add Transaction Route */}
            <Route path="/add" element={
              <div className="flex justify-center items-center h-[calc(100vh-150px)]">
                <AddTransaction />
              </div>
            } />

            {/* Edit Transaction Route */}
            <Route path="/edit/:id" element={
              <div className="flex justify-center items-center h-[calc(100vh-150px)]">
                <EditTransaction />
              </div>
            } />

            {/* Len-Den (Debt Tracker) Route */}
            <Route path="/lenden" element={
              <div className="w-full">
                <LenDen />
              </div>
            } />

            {/* Analysis Route */}
            <Route path="/analysis" element={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <h2 className="text-xl font-bold mb-4 text-emerald-400">Financial Summary</h2>
                  <Balance />
                  <div className="mt-8">
                    <IncomeExpenses />
                  </div>
                </div>

                <div>
                  <ExpenseChart />
                </div>
              </div>
            } />

            {/* Trash Route */}
            <Route path="/trash" element={
              <div className="flex justify-center mt-10">
                <Trash />
              </div>
            } />

          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;