import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, Trash2, Handshake, CreditCard } from 'lucide-react';

const Navbar = () => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Subs', icon: CreditCard, path: '/subscriptions' },
        { name: 'Analysis', icon: PieChart, path: '/analysis' },
        { name: 'Len-Den', icon: Handshake, path: '/lenden' },
        { name: 'Trash', icon: Trash2, path: '/trash' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            NeoFin
                        </span>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                            ? item.name === 'Trash' ? 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Button - simplified placeholder */}
                    <div className="-mr-2 flex md:hidden">
                        <button className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
