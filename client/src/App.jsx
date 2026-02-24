import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalContext } from './context/GlobalContext';

// Components
import Navbar from './components/Navbar';
import AddTransaction from './components/AddTransaction';
import EditTransaction from './components/EditTransaction';
import Trash from './components/Trash';
import LenDen from './pages/LenDen';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Analysis from './pages/Analysis';
import InsightsPage from './pages/InsightsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import AIChatPage from './pages/AIChatPage';

function App() {
  const { getTransactions } = useContext(GlobalContext);

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        {/* Ambient Glow Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Navbar />

        <div className="pt-20 md:pt-32 pb-24 px-4 max-w-7xl mx-auto relative z-10 transition-all duration-500">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/add" element={<AddTransaction />} />

            <Route path="/edit/:id" element={<EditTransaction />} />

            <Route path="/lenden" element={<LenDen />} />

            <Route path="/analysis" element={<Analysis />} />

            <Route path="/insights" element={<InsightsPage />} />

            <Route path="/budgets" element={<BudgetsPage />} />

            <Route path="/goals" element={<GoalsPage />} />

            <Route path="/chat" element={<AIChatPage />} />

            <Route path="/subscriptions" element={<Subscriptions />} />

            <Route path="/trash" element={<Trash />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;