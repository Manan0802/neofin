const mongoose = require('mongoose');

const SplitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    text: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    payer: { type: String, default: 'You' }, // For now, assuming current user is payer
    splits: [
        {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            isSettled: { type: Boolean, default: false }
        }
    ],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Split', SplitSchema);
