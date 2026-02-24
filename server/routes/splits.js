const express = require('express');
const router = express.Router();
const Split = require('../models/Split');

// @route   GET api/splits
router.get('/', async (req, res) => {
    try {
        const splits = await Split.find().sort({ date: -1 });
        res.json(splits);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST api/splits
router.post('/', async (req, res) => {
    try {
        const newSplit = new Split(req.body);
        const split = await newSplit.save();
        res.json(split);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   PUT api/splits/:id/settle/:name
router.put('/:id/settle/:name', async (req, res) => {
    try {
        const split = await Split.findById(req.params.id);
        if (!split) return res.status(404).json({ error: 'Not Found' });

        const s = split.splits.find(item => item.name === req.params.name);
        if (s) s.isSettled = true;

        await split.save();
        res.json(split);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   DELETE api/splits/:id
router.delete('/:id', async (req, res) => {
    try {
        await Split.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
