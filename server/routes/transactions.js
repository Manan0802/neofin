const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find({ isDeleted: false }).sort({ date: -1 }); // Sort by newest date; exclude deleted
        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Add transaction
// @route   POST /api/transactions
router.post('/', async (req, res) => {
    try {
        console.log("Backend Received:", req.body); // Debug Log
        // We expect text, amount, type, category, date(optional), isHidden(optional)
        const { text, amount, type, category, date, isHidden } = req.body;

        const transaction = await Transaction.create({
            text,
            amount,
            type,
            category,
            date: date || Date.now(),
            isHidden: isHidden || false
        });

        return res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        } else {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }

        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Soft Delete transaction
// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }

        // Soft delete
        transaction.isDeleted = true;
        await transaction.save();

        return res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get Trash (Deleted Transactions)
// @route   GET /api/transactions/trash
router.get('/trash/all', async (req, res) => {
    try {
        const transactions = await Transaction.find({ isDeleted: true }).sort({ date: -1 });
        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Restore transaction
// @route   PUT /api/transactions/restore/:id
router.put('/restore/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }

        transaction.isDeleted = false;
        await transaction.save();

        return res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Permanently Delete transaction
// @route   DELETE /api/transactions/permanent/:id
router.delete('/permanent/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }

        await transaction.deleteOne();

        return res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;