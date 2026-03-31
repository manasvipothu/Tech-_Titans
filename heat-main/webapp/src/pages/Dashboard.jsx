import React from 'react';
import mockHistory from '../api/mockData';
import { Activity, Clock, Flame, Zap } from 'lucide-react';

export default function Dashboard() {
    const totalOrders = mockHistory.length;
    const lateNightOrders = mockHistory.filter(d => {
        const h = new Date(d.date).getHours();
        return h >= 22 || h <= 3;
    }).length;
    
    const avgRisk = Math.floor(mockHistory.reduce((acc, curr) => acc + curr.riskScore, 0) / totalOrders) || 0;
    const recentOrders = mockHistory.slice(0, 5);

    return (
        <div className="space-y-8 animate-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">Health Overview</h1>
                    <p className="text-slate-400 mt-2">Welcome back! Your metabolic trends are looking stable.</p>
                </div>
                <div className="px-4 py-2 glass-card border-indigo-500/30 flex items-center gap-2">
                    <Zap className="text-amber-400" size={18} />
                    <span className="text-sm font-bold text-amber-400">7 Day Streak</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-panel group hover:bg-slate-800/80 cursor-default">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Orders</h3>
                            <p className="text-4xl font-black mt-2 text-white">{totalOrders}</p>
                        </div>
                        <Activity className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
                <div className="card-panel group hover:bg-slate-800/80 cursor-default border-b-4 border-b-risky/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Late Night</h3>
                            <p className="text-4xl font-black mt-2 text-risky">{lateNightOrders}</p>
                        </div>
                        <Clock className="text-risky group-hover:scale-110 transition-transform" />
                    </div>
                </div>
                <div className="card-panel group hover:bg-slate-800/80 cursor-default border-b-4 border-b-healthy/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Risk</h3>
                            <p className="text-4xl font-black mt-2 text-healthy">{avgRisk}%</p>
                        </div>
                        <Flame className="text-healthy group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-panel">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-indigo-400" />
                        Heatmap Preview
                    </h3>
                    <div className="heatmap-container pb-2">
                        <div className="heatmap-labels">
                            <span className="heatmap-label">S</span>
                            <span className="heatmap-label">M</span>
                            <span className="heatmap-label">T</span>
                            <span className="heatmap-label">W</span>
                            <span className="heatmap-label">T</span>
                            <span className="heatmap-label">F</span>
                            <span className="heatmap-label">S</span>
                        </div>
                        <div className="heatmap-grid">
                            {mockHistory.slice(0, 84).map((day, i) => (
                                <div 
                                    key={i}
                                    className={`heatmap-cell ${
                                        day.riskScore > 75 ? 'bg-red-500/60' : 
                                        day.riskScore > 40 ? 'bg-amber-500/50' : 'bg-emerald-500/30 border border-emerald-500/10'
                                    }`}
                                    title={`${new Date(day.date).toLocaleDateString()}: ${day.riskScore}% Risk`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4 text-right italic">Last 84 active windows</p>
                </div>
                
                <div className="card-panel">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-400" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {recentOrders.map((order, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-slate-200">{order.foodName}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-black">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {order.cals} kcal</span>
                                </div>
                                <div className={`status-pill ${
                                    order.riskScore > 75 ? 'text-risky border-risky/30 bg-risky/10' : 
                                    order.riskScore > 40 ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-healthy border-healthy/30 bg-healthy/10'
                                }`}>
                                    {order.riskScore}% Risk
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

