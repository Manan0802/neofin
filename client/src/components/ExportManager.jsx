import React from 'react';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';

const ExportManager = ({ transactions }) => {

    const exportCSV = () => {
        if (!transactions || transactions.length === 0) return;

        // Define Headers
        const headers = ["Date", "Description", "Amount", "Category", "Type", "Is Business"];

        // Map Data
        const rows = transactions.map(t => [
            new Date(t.date || t.createdAt).toLocaleDateString(),
            t.text.replace(/,/g, ""), // Remove commas to prevent CSV breakage
            t.amount,
            t.category || "Other",
            t.type,
            t.isFreelance ? "Yes" : "No"
        ]);

        // Join with commas and newlines
        let csvContent = headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `NeoFin_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mt-8">
            <div className="flex items-center gap-2 mb-6">
                <Download className="text-emerald-400 w-5 h-5" />
                <h3 className="text-white font-bold text-lg">Export Reports</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={exportCSV}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">Export as CSV</p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Excel / Google Sheets</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handlePrint}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">Print PDF Report</p>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">High Quality Print</p>
                        </div>
                    </div>
                </button>
            </div>

            <p className="mt-4 text-slate-500 text-[10px] italic text-center">
                Financial reports are generated instantly from your active transactions.
            </p>
        </div>
    );
};

export default ExportManager;
