import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('neofin_user')) || null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        // Simulation for now since server deps are missing
        return new Promise((resolve) => {
            setTimeout(() => {
                const userData = { name: 'Neo User', email, id: '123' };
                setUser(userData);
                localStorage.setItem('neofin_user', JSON.stringify(userData));
                setLoading(false);
                resolve(true);
            }, 1500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('neofin_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
