import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData.email, formData.password);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 p-10 opacity-10 bg-indigo-500 w-40 h-40 blur-3xl rounded-full -mr-10 -mt-10"></div>

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 grad-indigo rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                            {isLogin ? 'Welcome Back' : 'Join the Crew'}
                        </h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                            {isLogin ? 'Your capital is waiting' : 'Start your financial glow-up'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative"
                                >
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full grad-indigo py-5 rounded-[1.5rem] text-white font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                        {isLogin ? "Don't have an account?" : "Already a member?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-400 ml-2 hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
