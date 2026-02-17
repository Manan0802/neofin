const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI } = require('@google/genai');

console.log("CURRENT_NODE_ENV:", process.env.NODE_ENV);

const upload = multer({ storage: multer.memoryStorage() });

// Verify API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing from .env");
    console.error("Please add GEMINI_API_KEY=your_key_here to server/.env file");
} else {
    console.log("✅ GEMINI_API_KEY loaded successfully");
}

// --- HYBRID GEMINI AI FUNCTION ---
// Tries both SDK packages for maximum compatibility
async function callGeminiAI(prompt, fileData = null) {
    console.log("Final Prompt being sent to AI:", prompt);

    // Use gemini-1.5-flash as it is the current stable flash model. 
    // "gemini-2.5-flash" does not exist yet.
    // If using OpenRouter, we can target google/gemini-2.0-pro-exp-02-05:free or similar.
    const MODEL_NAME = "gemini-1.5-flash";
    const OPENROUTER_MODEL = "google/gemini-2.0-flash-001"; // Target model for OpenRouter

    // PRIORITY 0: OpenRouter (If Configured)
    if (process.env.OPENROUTER_API_KEY) {
        try {
            console.log(`🚀 Attempting OpenRouter with ${OPENROUTER_MODEL}...`);

            const messages = [
                { role: "user", content: [] }
            ];

            // Add text prompt
            messages[0].content.push({ type: "text", text: prompt });

            // Add image/file if present
            if (fileData) {
                const dataUrl = `data:${fileData.mimeType};base64,${fileData.base64}`;
                messages[0].content.push({
                    type: "image_url",
                    image_url: { url: dataUrl }
                });
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://neofin.app", // Optional
                    "X-Title": "NeoFin", // Optional
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": OPENROUTER_MODEL,
                    "messages": messages
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;

            if (!text) throw new Error("No text content in OpenRouter response");

            console.log("✅ Success with OpenRouter");
            return text;

        } catch (openRouterErr) {
            console.error("⚠️ OpenRouter failed:", openRouterErr.message);
            // Fallthrough to Gemini SDKs...
        }
    }

    // ATTEMPT 1: Try @google/generative-ai (Standard SDK)
    try {
        console.log("🔄 Attempting Gemini with @google/generative-ai...");
        // const { GoogleGenerativeAI } = require('@google/generative-ai'); // Moved to top
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        let result;
        if (fileData) {
            // File upload (voice/image)
            const imagePart = {
                inlineData: {
                    data: fileData.base64,
                    mimeType: fileData.mimeType
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            // Text prompt
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        console.log("✅ Success with @google/generative-ai");
        return text;
    } catch (err1) {
        console.log("⚠️ @google/generative-ai failed:", err1.message);

        // ATTEMPT 2: Fallback to @google/genai (Alternative SDK)
        try {
            console.log("🔄 Switching to @google/genai fallback...");
            // const { GoogleGenAI } = require('@google/genai'); // Moved to top
            const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            let contentParts = [{ text: prompt }];
            if (fileData) {
                contentParts.push({
                    inlineData: {
                        mimeType: fileData.mimeType,
                        data: fileData.base64
                    }
                });
            }

            const result = await client.models.generateContent({
                model: MODEL_NAME,
                contents: [{ role: 'user', parts: contentParts }]
            });

            // Extract text from response - improved parsing
            let responseText = "";

            // Try direct text access
            if (typeof result.text === 'function') {
                responseText = await result.text();
            }
            // Try candidates structure
            else if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                responseText = result.candidates[0].content.parts[0].text;
            }
            // Try response property
            else if (result.response) {
                const response = typeof result.response === 'function' ? await result.response() : result.response;
                if (typeof response.text === 'function') {
                    responseText = await response.text();
                } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                    responseText = response.candidates[0].content.parts[0].text;
                } else if (response.text) {
                    responseText = response.text;
                }
            }

            if (!responseText) {
                console.error("⚠️ Could not extract text from @google/genai response:", JSON.stringify(result, null, 2));
                throw new Error("Failed to extract text from response");
            }

            console.log("✅ Success with @google/genai fallback");
            return responseText;
        } catch (err2) {
            console.error("❌ Both Gemini SDKs failed!");
            console.error("Error 1 (@google/generative-ai):", err1.message);
            console.error("Error 2 (@google/genai):", err2.message);
            throw new Error(`All Gemini SDK attempts failed. Error1: ${err1.message}, Error2: ${err2.message}`);
        }
    }
}

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

        // --- OPTIMIZED PROMPT (No Markdown) ---
        let userInput = "";
        let fileData = null;

        // 1. Text Prompt
        if (req.body.prompt) {
            userInput = req.body.prompt;
            console.log('Text input:', userInput);
        }
        // 2. File Upload (Audio/Image)
        else if (req.file) {
            console.log('File details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            fileData = {
                base64: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype || 'audio/wav'
            };
        } else {
            console.error("❌ No input provided");
            return res.status(200).json({ success: true, data: fallbackResponse });
        }

        // Construct prompt
        const systemPrompt = `Act as a financial transaction parser. ${userInput ? `Convert this text: "${userInput}"` : 'Extract transaction data from the provided file'} into JSON format.

Return ONLY raw JSON (no markdown, no backticks, no code blocks):
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
- Use sensible defaults if unclear

Examples:
"Spent 500 on pizza" → {"text":"Pizza","amount":500,"category":"Food","type":"expense","isFreelance":false,"date":"2026-02-12T18:22:39.000Z"}
"Got 5000 from client" → {"text":"Client payment","amount":5000,"category":"Freelance","type":"income","isFreelance":true,"date":"2026-02-12T18:22:39.000Z"}`;

        // Call Gemini with Hybrid Fallback
        console.log('Sending to Gemini AI with hybrid fallback...');
        const responseText = await callGeminiAI(systemPrompt, fileData);

        console.log('Raw AI Response:', responseText);

        // Parse JSON
        let finalData;
        try {
            // Remove any markdown artifacts
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
            error: error.message
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

Return ONLY raw JSON array (no markdown, no backticks):
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

        // Use hybrid fallback
        const responseText = await callGeminiAI(systemPrompt);
        console.log('Raw AI Response:', responseText);

        // Parse JSON
        let data = [];
        try {
            const cleanedJson = responseText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
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