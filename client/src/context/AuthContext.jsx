import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('neofin_user')) || null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });

            // Clear previous user's cached data
            localStorage.removeItem('neofin_transactions');
            localStorage.removeItem('neofin_debts');
            localStorage.removeItem('neofin_splits');

            const userData = res.data.user;
            const token = res.data.token;

            setUser(userData);
            localStorage.setItem('neofin_user', JSON.stringify(userData));
            localStorage.setItem('neofin_token', token);

            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password });

            // Clear previous user's cached data
            localStorage.removeItem('neofin_transactions');
            localStorage.removeItem('neofin_debts');
            localStorage.removeItem('neofin_splits');

            const userData = res.data.user;
            const token = res.data.token;

            setUser(userData);
            localStorage.setItem('neofin_user', JSON.stringify(userData));
            localStorage.setItem('neofin_token', token);

            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('neofin_user');
        localStorage.removeItem('neofin_token');
        localStorage.removeItem('neofin_transactions');
        localStorage.removeItem('neofin_debts');
        localStorage.removeItem('neofin_splits');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
