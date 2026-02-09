import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';

const IncomeExpenses = () => {
    const { transactions } = useContext(GlobalContext);

    const amounts = transactions
        .filter(t => !t.isHidden)
        .map(transaction => transaction.amount);

    // Calculate Income (Positive numbers)
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    // Calculate Expense (Negative numbers)
    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    return (
        <div className="flex justify-center space-x-4 w-full max-w-md my-6">
            <div className="flex-1 bg-slate-800 p-4 rounded-lg shadow-lg border-b-4 border-emerald-500 text-center">
                <h4 className="text-slate-400 text-sm uppercase font-bold tracking-wider">Income</h4>
                <p className="text-emerald-400 text-xl font-bold tracking-wide">+₹{income}</p>
            </div>
            <div className="flex-1 bg-slate-800 p-4 rounded-lg shadow-lg border-b-4 border-red-500 text-center">
                <h4 className="text-slate-400 text-sm uppercase font-bold tracking-wider">Expense</h4>
                <p className="text-red-400 text-xl font-bold tracking-wide">-₹{expense}</p>
            </div>
        </div>
    );
};

export default IncomeExpenses;