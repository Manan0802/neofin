import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';

const Balance = () => {
    const { transactions } = useContext(GlobalContext);

    const amounts = transactions
        .filter(t => !t.isHidden)
        .map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    return (
        <div className="text-center mb-8">
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Total Balance</h4>
            <h1 className={`text-5xl font-bold tracking-tighter ${total < 0 ? 'text-red-400' : 'text-white'}`}>
                ₹{total}
            </h1>
        </div>
    );
};

export default Balance;
