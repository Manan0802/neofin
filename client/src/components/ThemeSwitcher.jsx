import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Palette, Moon, Sun, Flame, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = React.useState(false);

    const themes = [
        { id: 'dark', name: 'Classic Dark', icon: Moon, color: '#6366f1' },
        { id: 'midnight', name: 'Midnight', icon: Sun, color: '#1e40af' },
        { id: 'emerald', name: 'Emerald', icon: Leaf, color: '#059669' },
        { id: 'rose', name: 'Rose Gold', icon: Flame, color: '#be123c' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2"
            >
                <Palette className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Theme</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-2xl z-[100] border-white/10"
                    >
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { toggleTheme(t.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                            >
                                <t.icon className="w-4 h-4" style={{ color: t.color }} />
                                <span className="text-xs font-bold">{t.name}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSwitcher;
