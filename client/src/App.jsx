import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalContext } from './context/GlobalContext';
import { AnimatePresence, motion } from 'framer-motion';

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
import FinanceConstellation from './components/FinanceConstellation';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -15, scale: 1.02 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/add" element={<PageWrapper><AddTransaction /></PageWrapper>} />
        <Route path="/edit/:id" element={<PageWrapper><EditTransaction /></PageWrapper>} />
        <Route path="/lenden" element={<PageWrapper><LenDen /></PageWrapper>} />
        <Route path="/analysis" element={<PageWrapper><Analysis /></PageWrapper>} />
        <Route path="/insights" element={<PageWrapper><InsightsPage /></PageWrapper>} />
        <Route path="/budgets" element={<PageWrapper><BudgetsPage /></PageWrapper>} />
        <Route path="/goals" element={<PageWrapper><GoalsPage /></PageWrapper>} />
        <Route path="/chat" element={<PageWrapper><AIChatPage /></PageWrapper>} />
        <Route path="/subscriptions" element={<PageWrapper><Subscriptions /></PageWrapper>} />
        <Route path="/trash" element={<PageWrapper><Trash /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { getTransactions } = useContext(GlobalContext);

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-jakarta">
        {/* Futiristic Background Effects */}
        <FinanceConstellation />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none"
        ></motion.div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -5, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[130px] rounded-full pointer-events-none"
        ></motion.div>

        <Navbar />

        <div className="pt-20 md:pt-32 pb-24 px-4 max-w-7xl mx-auto relative z-10 transition-all duration-500">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;