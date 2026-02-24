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