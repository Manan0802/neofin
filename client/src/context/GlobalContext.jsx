import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AppReducer from './AppReducer';
import api from '../api';
import { AuthContext } from './AuthContext';

// Helper to get user-specific keys
const getCacheKeys = (userId) => ({
    transactions: `neofin_tx_${userId}`,
    debts: `neofin_debts_${userId}`,
    splits: `neofin_splits_${userId}`
});

// Initial state
const initialState = {
    transactions: [],
    debts: [],
    splits: [],
    trash: [],
    error: null,
    loading: true
};

// Create context
export const GlobalContext = createContext(initialState);

// Provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);
    const { user } = useContext(AuthContext);

    // 1. Initial Load & User Switch logic
    useEffect(() => {
        if (!user) {
            dispatch({ type: 'CLEAR_DATA' });
        } else {
            // Load from cache first for speed (User-specific)
            const keys = getCacheKeys(user.id);
            const cachedTx = JSON.parse(localStorage.getItem(keys.transactions)) || [];
            const cachedDebts = JSON.parse(localStorage.getItem(keys.debts)) || [];
            const cachedSplits = JSON.parse(localStorage.getItem(keys.splits)) || [];

            dispatch({ type: 'GET_TRANSACTIONS', payload: cachedTx });
            // Add debts/splits initial load if needed...

            // Fetch fresh data from server
            getTransactions();
            getSplits();
        }
    }, [user]);

    // 2. Sync state to user-specific LocalStorage
    useEffect(() => {
        if (user && !state.loading) {
            const keys = getCacheKeys(user.id);
            localStorage.setItem(keys.transactions, JSON.stringify(state.transactions));
            localStorage.setItem(keys.debts, JSON.stringify(state.debts));
            localStorage.setItem(keys.splits, JSON.stringify(state.splits));
        }
    }, [state.transactions, state.debts, state.splits, user, state.loading]);

    // Actions

    // 1. Get all transactions from DB
    async function getTransactions() {
        try {
            // Fetch active transactions
            const res = await api.get('/transactions');
            // Fetch trash transactions
            const trashRes = await api.get('/transactions/trash/all');

            dispatch({
                type: 'GET_TRANSACTIONS',
                payload: res.data.data
            });

            dispatch({
                type: 'GET_TRASH',
                payload: trashRes.data.data
            });

        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error || 'Server Error'
            });
        }
    }

    // 2. Add Transaction (Optimistic Update)
    async function addTransaction(transaction) {
        // Create a temporary ID for immediate UI update
        const tempId = Date.now().toString();
        const optimisticData = { ...transaction, _id: tempId, isOptimistic: true };

        // Step 1: Update UI immediately
        dispatch({ type: 'ADD_TRANSACTION', payload: optimisticData });

        try {
            const res = await api.post('/transactions', transaction);
            // Step 2: Replace temporary data with real DB data
            dispatch({ type: 'EDIT_TRANSACTION', payload: { ...res.data.data, oldId: tempId } });
        } catch (err) {
            // Step 3: Failure? Rollback by removing the optimistic item
            dispatch({ type: 'DELETE_TRANSACTION', payload: tempId });
            dispatch({ type: 'TRANSACTION_ERROR', payload: 'Could not sync with cloud' });
        }
    }

    // 3. Delete Transaction (Optimistic Update)
    async function deleteTransaction(id) {
        // Step 1: Remove from UI immediately
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });

        try {
            await api.delete(`/transactions/${id}`);
            getTrash(); // Sync trash in background
        } catch (err) {
            // Step 2: Failure? Refresh from DB to restore the item
            getTransactions();
            dispatch({ type: 'TRANSACTION_ERROR', payload: 'Delete sync failed' });
        }
    }

    // 4. Update Transaction
    async function editTransaction(transaction) {
        const config = { headers: { 'Content-Type': 'application/json' } };
        try {
            const res = await api.put(`/transactions/${transaction._id}`, transaction, config);
            dispatch({
                type: 'EDIT_TRANSACTION',
                payload: res.data.data
            });
        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error
            });
        }
    }

    // 5. Get Trash
    async function getTrash() {
        try {
            // Correct Endpoint as per previous steps
            const res = await api.get('/transactions/trash/all');
            dispatch({
                type: 'GET_TRASH',
                payload: res.data.data
            });
        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error
            });
        }
    }

    // 6. Restore Transaction
    async function restoreTransaction(id) {
        try {
            const res = await api.put(`/transactions/restore/${id}`);

            // We can dispatch RESTORE_TRANSACTION to update state locally without full refetch
            dispatch({
                type: 'RESTORE_TRANSACTION',
                payload: res.data.data
            });

        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error
            });
        }
    }

    // 7. Permanent Delete
    async function deletePermanent(id) {
        try {
            await api.delete(`/transactions/permanent/${id}`);

            dispatch({
                type: 'DELETE_PERMANENT',
                payload: id
            });
        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error
            });
        }
    }

    // 8. Add Debt (Len-Den) - Local for now
    function addDebt(debt) {
        // Assign a temporary ID if not provided (mocking DB)
        if (!debt.id) debt.id = Math.floor(Math.random() * 100000000);

        dispatch({
            type: 'ADD_DEBT',
            payload: debt
        });
    }

    // 9. Delete Debt
    function deleteDebt(id) {
        dispatch({
            type: 'DELETE_DEBT',
            payload: id
        });
    }

    // 10. Get Splits
    async function getSplits() {
        try {
            const res = await api.get('/splits');
            dispatch({ type: 'GET_SPLITS', payload: res.data });
        } catch (err) {
            console.error(err);
        }
    }

    // 11. Add Split
    async function addSplit(split) {
        try {
            const res = await api.post('/splits', split);
            dispatch({ type: 'ADD_SPLIT', payload: res.data });
        } catch (err) {
            console.error(err);
        }
    }

    // 12. Settle Split
    async function settleSplit(id, name) {
        try {
            const res = await api.put(`/splits/${id}/settle/${name}`);
            dispatch({ type: 'SETTLE_SPLIT', payload: res.data });
        } catch (err) {
            console.error(err);
        }
    }

    // 13. Delete Split
    async function deleteSplit(id) {
        try {
            await api.delete(`/splits/${id}`);
            dispatch({ type: 'DELETE_SPLIT', payload: id });
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <GlobalContext.Provider value={{
            transactions: state.transactions,
            trash: state.trash,
            splits: state.splits,
            error: state.error,
            loading: state.loading,
            getTransactions,
            addTransaction,
            deleteTransaction,
            editTransaction,
            getTrash,
            restoreTransaction,
            deletePermanent,
            debts: state.debts, // Export Debts
            addDebt,
            deleteDebt,
            getSplits,
            addSplit,
            settleSplit,
            deleteSplit
        }}>
            {children}
        </GlobalContext.Provider>
    );
};