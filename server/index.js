const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db'); // <--- New Line

const app = express();

// Connect to Database
connectDB(); // <--- Connecting...

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://neofin-fvaryaiey-manan-kumars-projects-51531793.vercel.app',
        /\.vercel\.app$/ // This allows all your Vercel preview links too
    ],
    credentials: true
}));

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'NeoFin Server Online 🟢' });
});

app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/splits', require('./routes/splits'));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`⚡ SERVER STARTED on Port ${PORT} ⚡`);
});