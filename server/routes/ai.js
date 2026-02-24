const express = require('express');
const router = express.Router();
const multer = require('multer');

// --- CONFIGURATION ---
const upload = multer({ storage: multer.memoryStorage() });

// STRICT: Use a highly reliable FREE model from OpenRouter
// Fallback logic: If one fails, you can manually rotate these
const MODEL_NAME = "google/gemini-2.0-flash-lite-preview-02-05:free";

// --- SHARED: CALL OPENROUTER AI ---
async function callOpenRouter(prompt, fileData = null) {
    console.log("------------------------------------------");
    console.log("🚀 CALLING OPENROUTER AI");
    console.log("Model:", MODEL_NAME);

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("MISSING OPENROUTER_API_KEY in .env");
    }

    try {
        const content = [];
        content.push({ type: "text", text: prompt });

        if (fileData) {
            console.log("📎 Attaching file:", fileData.mimeType);
            const dataUrl = `data:${fileData.mimeType};base64,${fileData.base64}`;
            content.push({
                type: "image_url",
                image_url: { url: dataUrl }
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://neofin.app",
                "X-Title": "NeoFin",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL_NAME,
                "messages": [{ role: "user", content }],
                "temperature": 0.5
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ OpenRouter API Error: ${response.status}`, errText);

            // Helpful error for the user
            if (response.status === 402) throw new Error("Credits exhausted on OpenRouter. Please check your account.");
            if (response.status === 429) throw new Error("Rate limit hit. Slow down, buddy!");

            throw new Error(`OpenRouter Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            console.error("❌ Empty response from AI:", data);
            throw new Error("AI returned no text. Check if model is available.");
        }

        console.log("✅ AI Success");
        return text;

    } catch (error) {
        console.error("❌ AI Exception:", error.message);
        throw error;
    }
}

// --- HELPER: CLEAN JSON ---
function cleanJson(text) {
    if (!text) return "";
    return text.replace(/```json|```/g, "") // Remove markdown
        .replace(/^[\s\n]+/, "")     // Trim start
        .replace(/[\s\n]+$/, "")     // Trim end
        .trim();
}

// --- ROUTE 1: /parse (Magic Fill & Voice) ---
router.post('/parse', upload.single('file'), async (req, res) => {
    try {
        console.log(`\n[POST /api/ai/parse] Request received`);

        // 1. Prepare Input
        let userInput = "";
        let fileData = null;

        if (req.body.prompt) {
            userInput = req.body.prompt;
            console.log('Text input:', userInput);
        } else if (req.file) {
            console.log('File upload:', req.file.mimetype);
            fileData = {
                base64: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype || 'audio/wav'
            };
        } else {
            console.error("❌ No input provided");
            return res.status(400).json({ success: false, message: "No input provided" });
        }

        // 2. System Prompt
        const systemPrompt = `Act as a financial transaction parser. ${userInput ? `Convert this text: "${userInput}"` : 'Extract transaction data from the provided file'} into STRICT JSON format.

Return ONLY raw JSON (no markdown, no backticks):
{
  "text": "description of transaction",
  "amount": positive number,
  "category": "Salary" or "Freelance" or "Investment" or "Food" or "Travel" or "Entertainment" or "Utilities" or "Shopping" or "Health" or "Education" or "Other",
  "type": "income" or "expense",
  "isFreelance": true or false,
  "date": "ISO date string"
}

Rules:
- amount must be positive number
- type determines income vs expense
- isFreelance is true for business/work/client transactions
- Use sensible defaults if unclear`;

        // 3. Call AI
        const responseText = await callOpenRouter(systemPrompt, fileData);

        // 4. Parse JSON
        let finalData;
        try {
            const cleaned = cleanJson(responseText);
            finalData = JSON.parse(cleaned);
            if (Array.isArray(finalData)) finalData = finalData[0];
        } catch (parseError) {
            console.error("❌ JSON Parse Failed. Response was:", responseText);
            // Return fallback
            finalData = {
                text: "Manual Entry Required (AI Parsing Failed)",
                amount: 0,
                category: "Other",
                type: "expense",
                isFreelance: false,
                date: new Date().toISOString()
            };
        }

        // 5. Send Response
        console.log("✅ Parsed Data:", finalData);
        res.json({ success: true, data: finalData });

    } catch (error) {
        console.error("❌ /parse Route Error:", error);
        // Return 200 with error data so frontend displays it instead of crashing
        res.status(200).json({
            success: false,
            message: "AI Error: " + error.message,
            data: {
                text: "Error: " + error.message,
                amount: 0,
                category: "Other",
                type: "expense",
                isFreelance: false,
                date: new Date().toISOString()
            }
        });
    }
});

// --- ROUTE 2: /detect-subscriptions ---
router.post('/detect-subscriptions', async (req, res) => {
    try {
        console.log(`\n[POST /api/ai/detect-subscriptions] Request received`);
        const { transactions } = req.body;

        if (!transactions || transactions.length === 0) {
            return res.json([]);
        }

        // 1. Simplify Transaction Data
        const simplifiedTx = transactions
            .filter(t => t.type === 'expense' || t.amount < 0)
            .map(t => `${t.text} | ${Math.abs(t.amount)} | ${new Date(t.date).toISOString().slice(0, 7)}`)
            .join('\n');

        // 2. System Prompt
        const systemPrompt = `Analyze these transactions and identify RECURRING SUBSCRIPTIONS.
Look for: same name in multiple months, keywords (Netflix, Spotify, Premium).

Return ONLY raw JSON array (no markdown):
[
  { "name": "Netflix", "amount": 649, "frequency": "monthly" }
]

If none, return [].

Transactions:
${simplifiedTx}`;

        // 3. Call AI
        const responseText = await callOpenRouter(systemPrompt);

        // 4. Parse JSON
        let subscriptions = [];
        try {
            const cleaned = cleanJson(responseText);
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) subscriptions = parsed;
        } catch (parseError) {
            console.error("❌ Subscription parsed failed. Response:", responseText);
            subscriptions = [];
        }

        console.log(`✅ Found ${subscriptions.length} subscriptions`);
        res.json(subscriptions);

    } catch (error) {
        console.error("❌ /detect-subscriptions Route Error:", error);
        res.json([]); // Fail gracefully with empty array
    }
});

// --- ROUTE 3: /chat (AI Finance Buddy) ---
router.post('/chat', async (req, res) => {
    try {
        const { message, transactions } = req.body;
        console.log(`\n[POST /api/ai/chat] Query: ${message}`);

        if (!message) {
            return res.status(400).json({ success: false, message: "No message provided" });
        }

        // 1. Prepare context from transactions
        // We only send a summary to save tokens
        const summary = transactions ? transactions.map(t => ({
            text: t.text,
            amount: t.amount,
            category: t.category,
            type: t.type,
            date: new Date(t.date || t.createdAt).toISOString().split('T')[0]
        })).slice(-50) : []; // Limit to last 50 transactions for context

        const systemPrompt = `You are "NeoFin AI Buddy", a helpful and witty financial assistant. 
You have access to the user's recent transaction data below. 
Answer the user's questions accurately based on this data. 

Guidelines:
- If asked about spending, calculate the totals.
- Be proactive with financial advice.
- Keep responses concise but friendly.
- If the data doesn't contain the answer, say "I don't have enough data to be sure about that yet, but..."
- Treat income as positive and expenses as negative numbers.

Recent User Transactions (JSON):
${JSON.stringify(summary)}

User Question: "${message}"`;

        // 2. Call AI
        const responseText = await callOpenRouter(systemPrompt);

        // 3. Send Response
        res.json({ success: true, answer: responseText });

    } catch (error) {
        console.error("❌ /chat Route Error:", error);
        res.status(500).json({ success: false, message: "Failed to get AI response" });
    }
});

module.exports = router;