const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// Apply protection to all routes below
router.use(protect);

// @desc    Get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id, isDeleted: false }).sort({ date: -1 });
        return res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Add transaction
router.post('/', async (req, res) => {
    try {
        const { text, amount, type, category, date, isHidden } = req.body;
        const transaction = await Transaction.create({
            user: req.user.id,
            text,
            amount,
            type,
            category,
            date: date || Date.now(),
            isHidden: isHidden || false
        });
        return res.status(201).json({ success: true, data: transaction });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update transaction
router.put('/:id', async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        return res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Soft Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }
        transaction.isDeleted = true;
        await transaction.save();
        return res.status(200).json({ success: true, data: {} });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get Trash
router.get('/trash/all', async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id, isDeleted: true }).sort({ date: -1 });
        return res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Restore
router.put('/restore/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }
        transaction.isDeleted = false;
        await transaction.save();
        return res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Permanent Delete
router.delete('/permanent/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }
        await transaction.deleteOne();
        return res.status(200).json({ success: true, data: {} });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;