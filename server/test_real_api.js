require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log("--- STARTING DIAGNOSTIC TEST ---");
    console.log("1. Checking API Key presence...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ CRITICAL: GEMINI_API_KEY is missing in process.env");
        return;
    }
    console.log("✅ API Key found (starts with: " + process.env.GEMINI_API_KEY.substring(0, 5) + "...)");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Test 1: User Requested Model (gemini-2.5-flash)
    console.log("\n2. Testing Strict Model: 'gemini-2.5-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        console.log("✅ SUCCESS with gemini-2.5-flash!");
        console.log("Response:", response.text());
    } catch (error) {
        console.error("❌ FAILED with gemini-2.5-flash");
        console.error("Error Details:", error.message);
        if (error.status) console.error("HTTP Status:", error.status);
    }

    // Test 2: Known Stable Model (gemini-1.5-flash) - Control Test
    console.log("\n3. Testing Control Model: 'gemini-1.5-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        console.log("✅ SUCCESS with gemini-1.5-flash (API Key is definitely valid)");
        console.log("Response:", response.text());
    } catch (error) {
        console.error("❌ FAILED with gemini-1.5-flash");
        console.error("Error Details:", error.message);
    }

    // Test 3: Newest V2 Model (gemini-2.0-flash) - Alternative
    console.log("\n4. Testing Alternative Model: 'gemini-2.0-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        console.log("✅ SUCCESS with gemini-2.0-flash");
        console.log("Response:", response.text());
    } catch (error) {
        console.error("❌ FAILED with gemini-2.0-flash");
        console.error("Error Details:", error.message);
    }

    console.log("\n--- TEST COMPLETE ---");
}

testGemini();
