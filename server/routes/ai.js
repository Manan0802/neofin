const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const upload = multer({ storage: multer.memoryStorage() });

// Verify API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing from .env");
    console.error("Please add GEMINI_API_KEY=your_key_here to server/.env file");
} else {
    console.log("✅ GEMINI_API_KEY loaded successfully");
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ROBUST /parse ROUTE ---
router.post('/parse', upload.single('file'), async (req, res) => {
    try {
        console.log(`\n[POST /api/ai/parse] Request received`);
        console.log('Request type:', req.file ? 'FILE UPLOAD' : 'TEXT PROMPT');

        // Default Fallback Response
        const fallbackResponse = {
            text: "Manual Entry Required",
            amount: 0,
            category: "Other",
            type: "expense",
            isFreelance: false,
            date: new Date().toISOString()
        };

        // --- SYSTEM PROMPT ---
        const systemPrompt = `You are a financial transaction parser. Extract transaction data and return ONLY valid JSON.

Required format:
{
  "text": "description of transaction",
  "amount": positive number,
  "category": one of ["Salary", "Freelance", "Investment", "Food", "Travel", "Entertainment", "Utilities", "Shopping", "Health", "Education", "Other"],
  "type": "income" or "expense",
  "isFreelance": true/false (true if business/work/client related),
  "date": "ISO date string"
}

Rules:
- amount must always be a positive number
- type determines if it's income or expense
- isFreelance is true for business/work/freelance transactions
- If unclear, use sensible defaults

Examples:
"Spent 500 on pizza" -> {"text": "Pizza", "amount": 500, "category": "Food", "type": "expense", "isFreelance": false}
"Got 5000 from client" -> {"text": "Client payment", "amount": 5000, "category": "Freelance", "type": "income", "isFreelance": true}
"Netflix subscription 649" -> {"text": "Netflix subscription", "amount": 649, "category": "Entertainment", "type": "expense", "isFreelance": false}`;

        let userInput = "";
        let parts = [];

        // 1. Text Prompt
        if (req.body.prompt) {
            userInput = req.body.prompt;
            console.log('Text input:', userInput);
            parts = [systemPrompt, `\nUser input: ${userInput}`];
        }
        // 2. File Upload (Audio/Image)
        else if (req.file) {
            console.log('File details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Convert buffer to base64
            const base64Data = req.file.buffer.toString('base64');

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: req.file.mimetype || 'audio/wav'
                }
            };

            const result = await model.generateContent([systemPrompt, imagePart]);
            const response = await result.response;
            const responseText = response.text();

            console.log('Raw AI Response:', responseText);

            // Parse JSON
            let finalData;
            try {
                const cleanedJson = responseText.replace(/```json|```/g, "").trim();
                finalData = JSON.parse(cleanedJson);
                if (Array.isArray(finalData)) finalData = finalData[0];
            } catch (jsonErr) {
                console.error("❌ JSON Parse Error:", jsonErr.message);
                console.error("Response was:", responseText);
                finalData = fallbackResponse;
            }

            // Safe defaults
            const safeData = {
                text: finalData.text || "Transaction",
                amount: Math.abs(Number(finalData.amount)) || 0,
                category: finalData.category || "Other",
                type: finalData.type || "expense",
                isFreelance: Boolean(finalData.isFreelance),
                date: finalData.date || new Date().toISOString()
            };

            console.log('✅ Parsed data:', safeData);
            return res.json({ success: true, data: safeData });
        } else {
            console.error("❌ No input provided");
            return res.status(200).json({ success: true, data: fallbackResponse });
        }

        // For text prompts
        console.log('Sending to Gemini AI...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(parts.join('\n'));
        const response = await result.response;
        const responseText = response.text();

        console.log('Raw AI Response:', responseText);

        // Parse JSON
        let finalData;
        try {
            const cleanedJson = responseText.replace(/```json|```/g, "").trim();
            finalData = JSON.parse(cleanedJson);
            if (Array.isArray(finalData)) finalData = finalData[0];
        } catch (jsonErr) {
            console.error("❌ JSON Parse Error:", jsonErr.message);
            console.error("Response was:", responseText);
            finalData = fallbackResponse;
        }

        // Safe defaults
        const safeData = {
            text: finalData.text || "Transaction",
            amount: Math.abs(Number(finalData.amount)) || 0,
            category: finalData.category || "Other",
            type: finalData.type || "expense",
            isFreelance: Boolean(finalData.isFreelance),
            date: finalData.date || new Date().toISOString()
        };

        console.log('✅ Parsed data:', safeData);
        res.json({ success: true, data: safeData });

    } catch (error) {
        console.error("\n❌ ERROR in /api/ai/parse:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);

        // Return fallback so frontend doesn't crash
        res.status(200).json({
            success: true,
            data: {
                text: "Error: AI Failed",
                amount: 0,
                category: "Other",
                type: "expense",
                isFreelance: false,
                date: new Date().toISOString()
            },
            error: error.message // Include error message for debugging
        });
    }
});

// --- ROUTE: DETECT SUBSCRIPTIONS ---
router.post('/detect-subscriptions', async (req, res) => {
    try {
        console.log('\n[POST /api/ai/detect-subscriptions] Request received');

        const { transactions } = req.body;
        if (!transactions || transactions.length === 0) {
            console.log('No transactions provided');
            return res.json([]);
        }

        console.log(`Analyzing ${transactions.length} transactions for subscriptions...`);

        // Simplify transactions for AI
        const simplifiedTx = transactions
            .filter(t => t.amount < 0) // Only expenses
            .map(t => {
                const date = new Date(t.date || t.createdAt);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return `${t.text} | ₹${Math.abs(t.amount)} | ${monthYear}`;
            })
            .join('\n');

        const systemPrompt = `Analyze these transactions and identify RECURRING SUBSCRIPTIONS or regular expenses.

Look for:
1. Same name appearing in multiple months (e.g., Netflix, Spotify, Amazon Prime)
2. Keywords like "subscription", "premium", "monthly", "annual"
3. Similar amounts repeating monthly

Return ONLY a JSON array of detected subscriptions:
[
  {
    "name": "Netflix",
    "amount": 649,
    "frequency": "monthly"
  }
]

If no subscriptions found, return empty array: []

Transactions:
${simplifiedTx}`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const responseText = response.text();

        console.log('Raw AI Response:', responseText);

        // Parse JSON
        let data = [];
        try {
            const cleanedJson = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanedJson);
            data = Array.isArray(parsed) ? parsed : [];
        } catch (jsonErr) {
            console.error("❌ JSON Parse Error:", jsonErr.message);
            console.error("Response was:", responseText);
        }

        console.log(`✅ Found ${data.length} subscriptions:`, data);
        res.json(data);

    } catch (err) {
        console.error("\n❌ ERROR in /api/ai/detect-subscriptions:");
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        res.json([]);
    }
});

module.exports = router;