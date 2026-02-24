import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalContext } from './context/GlobalContext';

// Components
import Navbar from './components/Navbar';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import AddTransaction from './components/AddTransaction';
import EditTransaction from './components/EditTransaction';
import ExpenseChart from './components/ExpenseChart';
import Trash from './components/Trash';
import LenDen from './pages/LenDen';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Analysis from './pages/Analysis';
import InsightsPage from './pages/InsightsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';

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
            <Route path="/analysis" element={<Analysis />} />

            {/* Insights Route */}
            <Route path="/insights" element={<InsightsPage />} />

            {/* Budgets Route */}
            <Route path="/budgets" element={<BudgetsPage />} />

            {/* Goals Route */}
            <Route path="/goals" element={<GoalsPage />} />

            {/* Subscriptions Route */}
            <Route path="/subscriptions" element={
              <div className="w-full">
                <Subscriptions />
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