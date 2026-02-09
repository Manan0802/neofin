const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db'); // <--- New Line

const app = express();

// Connect to Database
connectDB(); // <--- Connecting...

// Middleware
app.use(express.json());
app.use(cors());

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'NeoFin Server Online 🟢' });
});

app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`⚡ SERVER STARTED on Port ${PORT} ⚡`);
});