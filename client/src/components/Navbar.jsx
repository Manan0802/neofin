import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Trash2, Handshake, CreditCard, Sparkles, Target, Trophy, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const navItems = [
        { name: 'Home', icon: LayoutDashboard, path: '/' },
        { name: 'Chat', icon: MessageSquare, path: '/chat' },
        { name: 'Analysis', icon: PieChart, path: '/analysis' },
        { name: 'Subs', icon: CreditCard, path: '/subscriptions' },
        { name: 'Insights', icon: Sparkles, path: '/insights' },
    ];

    const moreItems = [
        { name: 'Budgets', icon: Target, path: '/budgets' },
        { name: 'Goals', icon: Trophy, path: '/goals' },
        { name: 'Debt', icon: Handshake, path: '/lenden' },
        { name: 'Trash', icon: Trash2, path: '/trash' },
    ];

    return (
        <>
            {/* Desktop Top Glass Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 grad-indigo rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">N</div>
                        <span className="text-xl font-extrabold tracking-tighter text-white">Neo<span className="text-indigo-400">Fin</span></span>
                    </div>

                    <div className="flex items-center gap-1">
                        {[...navItems, ...moreItems].map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${isActive
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Dock Navbar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-2">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-4 py-1 transition-all duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500'
                                }`
                            }
                        >
                            <div className="p-1 rounded-xl transition-all duration-300">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
