export default (state, action) => {
    switch (action.type) {
        case 'CLEAR_DATA':
            return {
                ...state,
                transactions: [],
                debts: [],
                splits: [],
                trash: [],
                loading: false
            };
        case 'GET_TRANSACTIONS':
            return {
                ...state,
                loading: false,
                transactions: action.payload
            };
        case 'GET_TRASH':
            return {
                ...state,
                loading: false,
                trash: action.payload
            };
        case 'DELETE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.filter(transaction => transaction._id !== action.payload)
            };
        case 'ADD_TRANSACTION':
            return {
                ...state,
                transactions: [action.payload, ...state.transactions]
            };
        case 'EDIT_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.map(transaction =>
                    (transaction._id === action.payload._id || transaction._id === action.payload.oldId)
                        ? action.payload : transaction
                )
            };
        case 'RESTORE_TRANSACTION':
            return {
                ...state,
                trash: state.trash.filter(t => t._id !== action.payload._id),
                transactions: [...state.transactions, action.payload]
            };
        case 'DELETE_PERMANENT':
            return {
                ...state,
                trash: state.trash.filter(t => t._id !== action.payload)
            };
        case 'ADD_DEBT':
            return {
                ...state,
                debts: [action.payload, ...state.debts]
            };
        case 'DELETE_DEBT':
            return {
                ...state,
                debts: state.debts.filter(debt => debt.id !== action.payload)
            };
        case 'GET_SPLITS':
            return {
                ...state,
                splits: action.payload
            };
        case 'ADD_SPLIT':
            return {
                ...state,
                splits: [action.payload, ...state.splits]
            };
        case 'SETTLE_SPLIT':
            return {
                ...state,
                splits: state.splits.map(s => s._id === action.payload._id ? action.payload : s)
            };
        case 'DELETE_SPLIT':
            return {
                ...state,
                splits: state.splits.filter(s => s._id !== action.payload)
            };
        case 'TRANSACTION_ERROR':
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};
