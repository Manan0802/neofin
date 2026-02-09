const express = require('express');
const router = express.Router();
const multer = require('multer');
// Using the new SDK import based on your snippet
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ storage: multer.memoryStorage() });

// Initialize with your existing KEY
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is missing from .env");
}

// Initialize Client
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- STABILIZED /parse ROUTE ---
router.post('/parse', upload.single('file'), async (req, res) => {
    try {
        console.log(`[POST /parse] Request received.`);

        // Default Fallback Response
        const fallbackResponse = {
            text: "Manual Entry Required",
            amount: 0,
            category: "Other",
            type: "expense",
            isFreelance: false,
            date: new Date().toISOString()
        };

        let contentParts = [];
        let detectedMimeType = "";

        // --- SYSTEM PROMPT ---
        const systemPrompt = `
          You are a financial AI. Return ONLY JSON.
          Extract transaction data: {text, amount, category, type, isFreelance, date}.
          
          - amount: Number (Positive)
          - type: 'income' or 'expense' or 'debt' (if lent/borrowed)
          - isFreelance: Boolean (true if business/work/client/freelance related)
          - category: One of ['Salary', 'Freelance', 'Investment', 'Food', 'Travel', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Education', 'Other']
          
          Input: [USER INPUT]
        `;

        // 1. Text Prompt
        if (req.body.prompt) {
            console.log("Processing Text Prompt:", req.body.prompt);
            contentParts = [
                { text: systemPrompt },
                { text: `User Input: ${req.body.prompt}` }
            ];
        }
        // 2. File Upload (Audio/Image)
        else if (req.file) {
            console.log("Processing File:", { mime: req.file.mimetype, size: req.file.size });
            detectedMimeType = req.file.mimetype;

            // Fix mime for Audio if needed
            if (req.file.originalname.endsWith('.wav') && !detectedMimeType) {
                detectedMimeType = 'audio/wav';
            }

            contentParts = [
                { text: systemPrompt },
                {
                    inlineData: {
                        mimeType: detectedMimeType,
                        data: req.file.buffer.toString('base64')
                    }
                }
            ];
        } else {
            console.error("No input provided");
            return res.status(200).json({ success: true, data: fallbackResponse });
        }

        console.log("Sending to Gemini...");

        // --- API CALL ---
        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: contentParts }],
            config: { responseMimeType: 'application/json' }
        });

        // --- UNIVERSAL EXTRACTION LOGIC (The Fix) ---
        // This block handles both @google/genai (New SDK) and @google/generative-ai (Old SDK)
        let responseText = "";

        // Check 1: New SDK Structure (Direct Candidates)
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = result.candidates[0].content.parts[0].text;
        }
        // Check 2: Response Object Structure (Nested)
        else if (result.response) {
            // Unwrap if it's a function (Old SDK)
            const response = typeof result.response === 'function' ? await result.response() : result.response;

            if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                responseText = response.candidates[0].content.parts[0].text;
            } else if (typeof response.text === 'function') {
                responseText = response.text();
            }
        }

        // Check 3: Raw Text fallback
        if (!responseText && result.text) {
            responseText = result.text;
        }

        console.log("Raw AI Response:", responseText);

        if (!responseText) {
            throw new Error("Could not extract text from any known Gemini response format.");
        }

        // --- CLEAN & PARSE JSON ---
        let finalData;
        try {
            const cleanedJson = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanedJson);
            finalData = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (jsonErr) {
            console.error("JSON Parse Error:", jsonErr);
            finalData = fallbackResponse;
        }

        // --- SAFE DEFAULTS ---
        const safeData = {
            text: finalData.text || "Transaction",
            amount: finalData.amount || 0,
            category: finalData.category || "Other",
            type: finalData.type || "expense",
            isFreelance: finalData.isFreelance || false,
            date: finalData.date || new Date().toISOString()
        };

        console.log("Final Parsed Data:", safeData);
        res.json({ success: true, data: safeData });

    } catch (error) {
        console.error("Full Error Object in /parse:", error);

        // Return 200 OK with Fallback so Frontend doesn't crash
        res.status(200).json({
            success: true, // Keep true so UI handles it gracefully
            data: {
                text: "Error: AI Failed",
                amount: 0,
                category: "Other",
                type: "expense",
                isFreelance: false
            }
        });
    }
});

// --- ROUTE: DETECT SUBSCRIPTIONS ---
router.post('/detect-subscriptions', async (req, res) => {
    try {
        const { transactions } = req.body;
        if (!transactions || transactions.length === 0) {
            return res.json([]);
        }

        const simplifiedTx = transactions.map(t => `${t.text} (${Math.abs(t.amount)}) on ${t.date.split('T')[0]}`).join('\n');

        const systemPrompt = `
        Analyze for RECURRING SUBSCRIPTIONS.
        Return JSON Array: [{ "name": "Netflix", "amount": 649, "frequency": "monthly" }]
        Input: ${simplifiedTx}
        `;

        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });

        // Universal Extraction (Same as above)
        let responseText = "[]";
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = result.candidates[0].content.parts[0].text;
        } else if (result.response) {
            const response = typeof result.response === 'function' ? await result.response() : result.response;
            if (response.candidates) responseText = response.candidates[0].content.parts[0].text;
            else if (typeof response.text === 'function') responseText = response.text();
        }

        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);
        const data = Array.isArray(parsed) ? parsed : [];

        res.json(data);

    } catch (err) {
        console.error("Subscription Error:", err);
        res.json([]);
    }
});

module.exports = router;