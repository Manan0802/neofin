import React, { useContext, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GlobalContext } from './context/GlobalContext';
import { AuthContext } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import FinanceConstellation from './components/FinanceConstellation';

// Pages (Lazy Load for Performance)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddTransaction = lazy(() => import('./components/AddTransaction'));
const EditTransaction = lazy(() => import('./components/EditTransaction'));
const Trash = lazy(() => import('./components/Trash'));
const LenDen = lazy(() => import('./pages/LenDen'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Analysis = lazy(() => import('./pages/Analysis'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const SplitPage = lazy(() => import('./pages/SplitPage'));

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
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    }>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <PageWrapper><AuthPage /></PageWrapper>} />

          {/* Dashboard / Protected Routes */}
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/add" element={<PageWrapper><AddTransaction /></PageWrapper>} />
          <Route path="/edit/:id" element={<PageWrapper><EditTransaction /></PageWrapper>} />
          <Route path="/lenden" element={<PageWrapper><LenDen /></PageWrapper>} />
          <Route path="/analysis" element={<PageWrapper><Analysis /></PageWrapper>} />
          <Route path="/insights" element={<PageWrapper><InsightsPage /></PageWrapper>} />
          <Route path="/budgets" element={<PageWrapper><BudgetsPage /></PageWrapper>} />
          <Route path="/goals" element={<PageWrapper><GoalsPage /></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><AIChatPage /></PageWrapper>} />
          <Route path="/split" element={<PageWrapper><SplitPage /></PageWrapper>} />
          <Route path="/subscriptions" element={<PageWrapper><Subscriptions /></PageWrapper>} />
          <Route path="/trash" element={<PageWrapper><Trash /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  const { getTransactions } = useContext(GlobalContext);

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-700 relative overflow-hidden font-jakarta" style={{ backgroundColor: 'var(--app-bg)' }}>
        <FinanceConstellation />

        {/* Ambient Glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ backgroundColor: 'var(--accent-color)', filter: 'blur(130px)' }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20"
        />

        <Navbar />

        <div className="pt-20 md:pt-32 pb-24 px-4 max-w-7xl mx-auto relative z-10 transition-all duration-500">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;