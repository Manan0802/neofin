import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import axios from 'axios';
import { useReactMediaRecorder } from "react-media-recorder";

const AddTransaction = () => {
    // Form State
    const [text, setText] = useState('');
    const [amount, setAmount] = useState(''); // Use string for easier input handling
    const [category, setCategory] = useState('Other');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [isHidden, setIsHidden] = useState(false);
    const [isFreelance, setIsFreelance] = useState(false);

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    // Imported addDebt here
    const { addTransaction, addDebt } = useContext(GlobalContext);

    // Reusable function to create and add a transaction
    const createAndAddTransaction = async (transactionData) => {
        const amountNum = +transactionData.amount;
        // Determine type: use provided type OR calculate from amount
        const type = transactionData.type || (amountNum >= 0 ? 'income' : 'expense');

        // Use provided date or fallback to state date
        const finalDate = transactionData.date ? new Date(transactionData.date).toISOString() : new Date(date).toISOString();

        const newTransaction = {
            id: Math.floor(Math.random() * 100000000),
            ...transactionData,
            amount: amountNum,
            type,
            date: finalDate
        };

        await addTransaction(newTransaction);

        // Reset Form & AI Input
        setText('');
        setAmount('');
        setCategory('Other');
        setDate(new Date().toISOString().split('T')[0]); // Reset to today
        setIsHidden(false);
        setIsFreelance(false); // Reset
        setAiPrompt('');
    };

    const fileInputRef = React.useRef(null);

    // Helper to process AI response and add transaction
    const processAIResponse = (res) => {
        // Handle different response structures matches backend
        let aiData = res.data;

        // Resilience: check if nested in 'data' prop
        if (aiData.data) aiData = aiData.data;

        // Resilience: if raw Gemini response
        if (aiData.candidates && aiData.candidates[0]?.content?.parts[0]?.text) {
            const rawText = aiData.candidates[0].content.parts[0].text;
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const parsed = JSON.parse(cleanText);
                aiData = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) {
                console.error("Client parsing failed:", e);
            }
        }

        console.log("AI Parsed Data:", aiData);

        // Validation Check: If AI failed or amount is 0/invalid
        if (aiData.text === "Error: AI Failed" || !aiData.amount || aiData.amount === 0) {
            return { error: true };
        }

        // --- CHECK IF IT IS A DEBT ---
        if (aiData.transactionType === 'debt') {
            const { person, amount, debtType, text } = aiData;
            const newDebt = {
                id: Math.floor(Math.random() * 100000000),
                person,
                amount: +amount,
                type: debtType, // 'lent' or 'borrowed'
                date: new Date().toISOString()
            };
            addDebt(newDebt);
            alert(`Debt Recorded: ${debtType === 'lent' ? 'You lent' : 'You borrowed'} ₹${amount} (${person})`);
            setAiPrompt('');
            return { success: true, aiText: text || 'Debt Entry', finalAmount: amount };
        }

        // --- REGULAR TRANSACTION ---
        const { text: aiText, amount: aiAmount, category: aiCategory, type: aiType, isHidden: aiIsHidden, isFreelance: aiIsFreelance, date: aiDate } = aiData;

        let finalAmount = Math.abs(aiAmount || 0);
        if (aiType === 'expense') {
            finalAmount = -finalAmount;
        }

        const isBusiness = Boolean(aiIsFreelance);

        // Set isFreelance state based on AI response 
        setIsFreelance(isBusiness);
        if (aiDate) setDate(aiDate);

        createAndAddTransaction({
            text: aiText || 'AI Transaction',
            amount: finalAmount,
            category: aiCategory || 'Other',
            type: aiType || (finalAmount >= 0 ? 'income' : 'expense'),
            isHidden: aiIsHidden || false,
            isFreelance: isBusiness,
            date: aiDate // createAndAddTransaction handles fallback
        });

        return { success: true, aiText, finalAmount };
    };

    // --- Voice Recording Logic ---
    const handleVoiceUpload = async (blobUrl, blob) => {
        if (!blob) {
            console.error("No audio content to upload.");
            return;
        }

        console.log(`Voice Recording Finished. Blob Size: ${blob.size} bytes`);
        setLoading(true);

        // DELAY: Allow blob to fully flush to memory
        await new Promise(resolve => setTimeout(resolve, 500));

        const formData = new FormData();
        formData.append('file', blob, 'voice_note.wav'); // Match backend 'file'

        console.log("Sending Voice Request:", formData);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const result = processAIResponse(res);
            if (result.error) {
                alert("AI couldn't understand that, please try again or enter manually.");
            } else {
                alert(`Voice Added: ${result.aiText} (₹${result.finalAmount})`);
            }
        } catch (err) {
            console.error("Voice Error:", err);
            alert('Failed to process voice. Please speak clearly.');
        } finally {
            setLoading(false);
        }
    };

    // --- Image Upload Logic ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        console.log("Sending Image Request", { fileName: file.name, fileSize: file.size });

        try {
            const res = await axios.post('http://localhost:5000/api/ai/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const result = processAIResponse(res);
            if (result.error) {
                alert("AI couldn't understand that, please try again or enter manually.");
            } else {
                alert(`Bill Scanned: ${result.aiText} (₹${result.finalAmount})`);
            }
        } catch (err) {
            console.error("Image Error:", err);
            alert('Failed to scan image.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const { status, startRecording, stopRecording } = useReactMediaRecorder({
        audio: true,
        onStop: handleVoiceUpload
    });

    // Dynamic Button Style based on Status
    const isRecording = status === 'recording';
    const voiceButtonClass = isRecording
        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]'
        : 'bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600';

    const onSubmit = e => {
        e.preventDefault();
        if (!text || !amount) {
            alert("Please enter a description and amount.");
            return;
        }
        createAndAddTransaction({
            text,
            amount,
            category,
            isHidden,
            isFreelance: Boolean(isFreelance), // Explicit cast
            date
        });
    };

    const handleTextMagicFill = async () => {
        if (!aiPrompt.trim()) return;
        setLoading(true);

        console.log("Sending Text Request:", { prompt: aiPrompt });

        try {
            const res = await axios.post('http://localhost:5000/api/ai/parse', { prompt: aiPrompt });
            const result = processAIResponse(res);
            if (result.error) {
                alert("AI couldn't understand that, please try again or enter manually.");
            } else {
                alert(`Text AI Added: ${result.aiText} (₹${result.finalAmount})`);
            }
        } catch (err) {
            console.error("AI Error:", err);
            alert('AI Failed to understand.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* --- LEFT COLUMN: AI Magic Fill Section --- */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm h-fit">
                <h3 className="text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
                    <span>✨</span> AI Magic Fill
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    Type details, record voice, or upload a bill.
                </p>
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., 'Spent 500 on Pizza' or upload a bill..."
                            className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 resize-none h-24 pr-12"
                        />

                        {/* Action Buttons: Voice & Image */}
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />

                            {/* Image Upload Button */}
                            <button
                                onClick={() => fileInputRef.current.click()}
                                type="button"
                                className="p-2 text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 rounded-full transition-colors"
                                title="Upload Bill/Screenshot"
                            >
                                📷
                            </button>

                            {/* Mic Button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                type="button"
                                disabled={loading}
                                className={`p-2 rounded-full transition-all flex items-center gap-2 ${voiceButtonClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isRecording ? "Stop Recording" : "Start Recording"}
                            >
                                {loading ? '⏳' : isRecording ? (
                                    <>
                                        <span>⏹️</span>
                                        <span className="text-xs font-bold pr-2">Stop</span>
                                    </>
                                ) : (
                                    '🎙️'
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleTextMagicFill}
                        disabled={loading || !aiPrompt.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md shadow-indigo-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : '✨ Generate from Text'}
                    </button>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Manual Form Section --- */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 border-b border-slate-700 pb-3 flex items-center gap-2">
                    <span>📝</span> Manual Entry
                </h3>
                <form onSubmit={onSubmit}>
                    <div className="form-control mb-4">
                        <label htmlFor="text" className="block text-gray-300 mb-2 font-medium">Description</label>
                        <input type="text" id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter description..." className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>

                    <div className="form-control mb-4">
                        <label htmlFor="date" className="block text-gray-300 mb-2 font-medium">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="form-control mb-4">
                        <label htmlFor="amount" className="block text-gray-300 mb-2 font-medium">
                            Amount <span className="text-xs text-gray-500 ml-1">(- for expense, + for income)</span>
                        </label>
                        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount..." className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>

                    <div className="form-control mb-5">
                        <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none">
                            {['Salary', 'Freelance', 'Investment', 'Food', 'Travel', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Education', 'Other'].map(cat => (
                                <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Checkboxes Row */}
                    <div className="flex flex-col gap-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        {/* Ghost Mode */}
                        <div className="flex items-center">
                            <input
                                id="ghost-mode"
                                type="checkbox"
                                checked={isHidden}
                                onChange={(e) => setIsHidden(e.target.checked)}
                                className="w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                            />
                            <label htmlFor="ghost-mode" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer select-none flex items-center gap-1">
                                👻 Hide from Balance <span className="text-gray-500">(Ghost Mode)</span>
                            </label>
                        </div>

                        {/* Freelance Mode */}
                        <div className="flex items-center">
                            <input
                                id="freelance-mode"
                                type="checkbox"
                                checked={isFreelance}
                                onChange={(e) => setIsFreelance(e.target.checked)}
                                className="w-5 h-5 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="freelance-mode" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer select-none flex items-center gap-1">
                                💼 Mark as Business/Freelance
                            </label>
                        </div>
                    </div>

                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2">
                        <span>➕</span> Add Transaction
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;