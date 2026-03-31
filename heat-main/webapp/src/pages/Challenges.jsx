import React from 'react';
import { Trophy, Star, Flame, CheckCircle, Plus, Info } from 'lucide-react';

const availableChallenges = [
    { title: 'No Junk Week', desc: 'Avoid all unhealthy food for 7 days', duration: '7 days', points: '+100 pts', color: 'indigo' },
    { title: 'Midnight Warrior', desc: 'No late-night orders for 5 days', duration: '5 days', points: '+80 pts', color: 'amber' },
    { title: 'Clean Eating Streak', desc: 'Order only healthy food for 10 days', duration: '10 days', points: '+150 pts', color: 'emerald' },
    { title: 'Calorie Control', desc: 'Keep every order under 500 cal for 7 days', duration: '7 days', points: '+120 pts', color: 'blue' },
];

export default function Challenges() {
    return (
        <div className="space-y-8 animate-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} />
                        Challenges & Gamification
                    </h1>
                    <p className="text-slate-400 mt-2">Build healthy streaks, earn points, transform your habits</p>
                </div>
                <button className="btn-primary text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-none">
                    <Plus size={14} /> Custom Challenge
                </button>
            </div>

            {/* Stat Overview Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-panel flex flex-col items-center justify-center py-8 text-center group transition-transform hover:scale-[1.02]">
                    <Star className="text-amber-400 mb-3 group-hover:animate-pulse" size={28} />
                    <span className="text-4xl font-black text-white">80</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Points</span>
                </div>
                <div className="card-panel flex flex-col items-center justify-center py-8 text-center group transition-transform hover:scale-[1.02]">
                    <Flame className="text-red-500 mb-3 group-hover:animate-bounce" size={28} />
                    <span className="text-4xl font-black text-white">1</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Challenges</span>
                </div>
                <div className="card-panel flex flex-col items-center justify-center py-8 text-center group transition-transform hover:scale-[1.02]">
                    <CheckCircle className="text-emerald-500 mb-3" size={28} />
                    <span className="text-4xl font-black text-white">1</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Completed</span>
                </div>
            </div>

            {/* Active Challenges Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-200">Active Challenges</h3>
                <div className="card-panel border-l-4 border-l-emerald-500 relative overflow-hidden max-w-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-black text-slate-100">No Junk Week</h4>
                            <p className="text-xs text-slate-500 mt-1">Avoid all unhealthy food for 7 days</p>
                        </div>
                        <span className="text-xs font-black text-amber-500/80 uppercase tracking-widest">+100 pts</span>
                    </div>
                    
                    <div className="mt-6">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                             <span>Day 3 / 7</span>
                             <span>43%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[43%] transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                         <button className="btn-secondary text-[10px] flex-1 py-1 px-4 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30">
                            ✅ Mark Day Complete
                         </button>
                         <button className="text-[10px] font-black text-red-500/50 uppercase ml-4 hover:text-red-500 px-2 transition-colors">Reset</button>
                    </div>
                </div>
            </div>

            {/* Marketplace Grid */}
            <div className="space-y-6 pt-4">
                <h3 className="text-lg font-black text-slate-200">Start a Challenge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableChallenges.map((ch, idx) => (
                        <div key={idx} className="card-panel group hover:border-white/20 transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-200 group-hover:text-white transition-colors">{ch.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-[80%]">{ch.desc}</p>
                                </div>
                                <Info size={14} className="text-slate-700" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Duration</span>
                                        <span className="text-xs font-bold text-slate-300">{ch.duration}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Reward</span>
                                        <span className="text-xs font-black text-amber-500">{ch.points}</span>
                                    </div>
                                </div>
                                <button className="btn-secondary text-[10px] py-1 px-5 border-slate-700 hover:bg-slate-700">
                                    Start
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
