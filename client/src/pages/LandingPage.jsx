import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Zap, Layout, ArrowRight, TrendingUp, Users, PieChart } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        { icon: Sparkles, title: "AI Magic", desc: "Log transactions naturally using voice, images, or chat." },
        { icon: Users, title: "Shared Split", desc: "Effortlessly manage group expenses and track who owes what." },
        { icon: PieChart, title: "Smart Analysis", desc: "Cinematic data visualizations of your financial habits." },
        { icon: Layout, title: "Gen-Z Design", desc: "Aesthetic, glassmorphic UI designed for the next generation." },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Hero Section */}
            <div className="relative z-10 pt-20 pb-10 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
                >
                    <Sparkles className="w-4 h-4" /> The Future of Finance is Here
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6"
                >
                    FIX YOUR <br />
                    <span className="text-gradient">MONEY VIBE.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
                >
                    Stop tracking like it's 2010. NeoFin uses AI to handle your expenses so you can focus on stacking your bread.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col md:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="grad-indigo px-10 py-5 rounded-2xl text-white font-black text-lg shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform flex items-center gap-3 uppercase tracking-tighter"
                    >
                        Get Started <ArrowRight className="w-6 h-6" />
                    </button>
                    <button className="glass px-10 py-5 rounded-2xl text-slate-300 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-sm">
                        Watch Demo
                    </button>
                </motion.div>
            </div>

            {/* Float Elements for Hero */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute top-[20%] right-[10%] w-64 h-64 grad-indigo opacity-20 blur-[100px] rounded-full hidden lg:block"
            ></motion.div>

            {/* Features Grid */}
            <div className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Pure <span className="text-indigo-400">Flex</span></h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Features that make other apps look ancient</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <f.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight uppercase">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats / Social Proof */}
            <div className="relative z-10 py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    <div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">10k+</p>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Beta Users</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">₹50M+</p>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tracked</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">4.9/5</p>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Dope Reviews</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">Zero</p>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Stress</p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="relative z-10 py-32 px-6 text-center">
                <motion.div
                    whileInView={{ scale: [0.9, 1.05, 1] }}
                    className="grad-indigo p-16 rounded-[4rem] max-w-4xl mx-auto shadow-2xl shadow-indigo-500/20"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-none uppercase">Ready to elevate <br /> your capital?</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl uppercase tracking-tighter"
                    >
                        Join the waitlist
                    </button>
                    <p className="mt-8 text-white/60 font-medium text-sm">Join 12,000+ others winning at life.</p>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-10 px-6 text-center border-t border-white/5">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">NeoFin © 2026 • Made with ❤️ for the fast life</p>
            </footer>
        </div>
    );
};

export default LandingPage;
