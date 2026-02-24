import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, Trash2, Handshake, CreditCard, Sparkles, Target, Trophy, MessageSquare, Users, LogIn, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    // Hide full Navbar on Landing and Auth pages
    const isDashboard = location.pathname.startsWith('/dashboard') ||
        ['/add', '/edit', '/chat', '/analysis', '/split', '/subscriptions', '/insights', '/budgets', '/goals', '/lenden', '/trash']
            .some(path => location.pathname.startsWith(path));

    const navItems = [
        { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Chat', icon: MessageSquare, path: '/chat' },
        { name: 'Analysis', icon: PieChart, path: '/analysis' },
        { name: 'Split', icon: Users, path: '/split' },
        { name: 'Subs', icon: CreditCard, path: '/subscriptions' },
    ];

    const moreItems = [
        { name: 'Budgets', icon: Target, path: '/budgets' },
        { name: 'Goals', icon: Trophy, path: '/goals' },
        { name: 'Debt', icon: Handshake, path: '/lenden' },
        { name: 'Trash', icon: Trash2, path: '/trash' },
    ];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 grad-indigo rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">N</div>
                        <span className="text-xl font-extrabold tracking-tighter text-white">Neo<span className="text-indigo-400">Fin</span></span>
                    </div>

                    <div className="flex items-center gap-1">
                        {isDashboard && [...navItems, ...moreItems].map((item) => (
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

                        {!isDashboard && (
                            <div className="flex items-center gap-6 mr-4">
                                <button className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">Features</button>
                                <button className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">Pricing</button>
                                <button className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">About</button>
                            </div>
                        )}

                        <div className="w-px h-6 bg-white/10 mx-2"></div>

                        {isAuthenticated ? (
                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold"
                            >
                                <LogOut className="w-4 h-4" /> <span>Logout</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="grad-indigo px-5 py-2 rounded-xl text-white text-xs font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" /> <span>Login</span>
                            </button>
                        )}

                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <ThemeSwitcher />
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Dock (ONLY on Dashboard) */}
            {isDashboard && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-2">
                    <div className="flex items-center justify-around px-2 py-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 px-4 py-1 transition-all duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`
                                }
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}
        </>
    );
};

export default Navbar;
