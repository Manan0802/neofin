import React, { createContext, useReducer } from 'react';
import AppReducer from './AppReducer';
import api from '../api';

// Initial state
const initialState = {
    transactions: [],
    debts: [], // For Len-Den
    splits: [], // For Splitwise
    trash: [], // For Recycle Bin
    error: null,
    loading: true
};

// Create context
export const GlobalContext = createContext(initialState);

// Provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);

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

    // 2. Add Transaction
    async function addTransaction(transaction) {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            console.log("Frontend Sending:", transaction); // Debug Log
            const res = await api.post('/transactions', transaction, config);

            console.log("Response from Backend:", res.data); // Debug Log
            console.log("Dispatching to Reducer:", res.data.data);

            dispatch({
                type: 'ADD_TRANSACTION',
                payload: res.data.data
            });
        } catch (err) {
            console.error("Add Error:", err); // Debug Log
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error || 'Failed to add'
            });
        }
    }

    // 3. Delete Transaction (Soft Delete)
    async function deleteTransaction(id) {
        try {
            await api.delete(`/transactions/${id}`);

            dispatch({
                type: 'DELETE_TRANSACTION',
                payload: id
            });

            // Refresh trash immediately
            getTrash();

        } catch (err) {
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: err.response?.data?.error
            });
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