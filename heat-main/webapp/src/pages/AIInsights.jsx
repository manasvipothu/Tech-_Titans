import React, { useState } from 'react';
import base44 from '../api/base44Client';
import { BrainCircuit } from 'lucide-react';

export default function AIInsights() {
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState(null);

    const generateInsights = async () => {
        setLoading(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM("Analyze 30-day mock data");
            setInsight(result);
        } catch(e) { console.error(e); }
        setLoading(false);
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-500" size={32} />
                <h1 className="text-2xl font-bold text-slate-800">AI Behavioral Analysis</h1>
            </div>
            <p className="text-slate-500">Generate a comprehensive LLM report on your late-night eating triggers and NCD risks.</p>

            <button onClick={generateInsights} disabled={loading} className="btn-primary w-full shadow-md py-4 text-lg">
                {loading ? 'Analyzing your metabolic patterns...' : 'Generate New Insight Report'}
            </button>

            {insight && (
                <div className="card-panel bg-indigo-50/50 border-indigo-100 space-y-4 animate-in">
                    <h3 className="font-bold text-indigo-900 border-b border-indigo-100 pb-2">Analysis Complete</h3>
                    <p className="text-slate-700 leading-relaxed text-sm"><strong>LLM Conclusion:</strong> {insight.ai_analysis}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                         <div className="bg-white p-3 rounded-lg border border-border">
                            <span className="text-xs text-slate-500 block">Identified Risk</span>
                            <span className="font-bold text-red-500">{insight.category} (Score: {insight.risk_score})</span>
                         </div>
                         <div className="bg-white p-3 rounded-lg border border-border">
                            <span className="text-xs text-slate-500 block">AI Suggestion</span>
                            <span className="font-bold text-green-600">{insight.healthier_alternative}</span>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
}
