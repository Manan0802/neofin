import React from 'react';

const Header = () => {
    return (
        <div className="text-center mb-8 mt-2">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">NeoFin</h1>
            <div className="flex items-center justify-center space-x-2 opacity-60">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium tracking-widest uppercase text-emerald-400">System Online</span>
            </div>
        </div>
    );
};

export default Header;
