const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        // Try with a known stable model first
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Explain how AI works");
        const response = await result.response;
        const text = response.text();
        console.log("Success with gemini-1.5-flash:", text.substring(0, 50) + "...");
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        // Try with the user's requested model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Explain how AI works");
        const response = await result.response;
        const text = response.text();
        console.log("Success with gemini-2.5-flash:", text.substring(0, 50) + "...");
    } catch (error) {
        console.error("Error with gemini-2.5-flash:", error.message);
    }
}

run();
