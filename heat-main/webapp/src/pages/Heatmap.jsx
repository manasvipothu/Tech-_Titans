import React from 'react';
import mockHistory from '../api/mockData';

export default function Heatmap() {
    const now = new Date();
    const days = [];
    for (let i = 90; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const dailyData = {};
    mockHistory.forEach(item => {
        const dateStr = item.date.split('T')[0];
        if (!dailyData[dateStr] || item.riskScore > dailyData[dateStr].score) {
            dailyData[dateStr] = { score: item.riskScore, food: item.foodName };
        }
    });

    const getCellColor = (score) => {
        if (!score && score !== 0) return 'bg-slate-800/30';
        if (score > 75) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
        if (score > 40) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
        return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    };

    return (
        <div className="space-y-8 animate-in">
            <div>
                <h1 className="text-3xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">Habit Heatmap</h1>
                <p className="text-slate-400 mt-2">Visualizing your metabolic risk patterns over the last 90 days.</p>
            </div>

            <div className="card-panel">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 overflow-x-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">Activity Grid (90 Days)</h3>
                            <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80"></div> Healthy</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80"></div> Moderate</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500/80"></div> Risky</div>
                            </div>
                        </div>

                        <div className="heatmap-container pb-2">
                            <div className="heatmap-labels">
                                <span className="heatmap-label text-slate-700">S</span>
                                <span className="heatmap-label text-slate-700">M</span>
                                <span className="heatmap-label text-slate-700">T</span>
                                <span className="heatmap-label text-slate-700">W</span>
                                <span className="heatmap-label text-slate-700">T</span>
                                <span className="heatmap-label text-slate-700">F</span>
                                <span className="heatmap-label text-slate-700">S</span>
                            </div>
                            <div className="heatmap-grid px-2">
                                {days.map(day => (
                                    <div 
                                        key={day}
                                        title={`${day}: ${dailyData[day]?.food || 'No orders'}`}
                                        className={`heatmap-cell ${getCellColor(dailyData[day]?.score)}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-48 shrink-0 flex flex-col gap-8 justify-center border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-12">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Avg Weekly Risk</span>
                            <span className="text-4xl font-black text-amber-500">42%</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Consistency</span>
                            <span className="text-4xl font-black text-emerald-500">85%</span>
                        </div>
                        <div className="mt-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                           <span className="text-[9px] font-black text-indigo-400 uppercase">AI Score</span>
                           <p className="text-[11px] text-indigo-200/70 mt-1 leading-tight">Trending towards 12% lower risk this month.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-panel border-l-4 border-l-indigo-500">
                    <h4 className="font-bold mb-2">Weekend Surge</h4>
                    <p className="text-sm text-slate-400">Your high-risk orders are 2.5x more likely on Saturday nights. Consider meal-prepping for weekends to reduce late-night cravings.</p>
                </div>
                <div className="card-panel border-l-4 border-l-emerald-500">
                    <h4 className="font-bold mb-2">Steady Improvement</h4>
                    <p className="text-sm text-slate-400">You've chosen healthy alternatives 4 times this week! Your metabolic stability score has increased by 12 points.</p>
                </div>
            </div>
        </div>
    );
}

