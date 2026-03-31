import React from 'react';
import { Settings as SettingsIcon, User, Sun, Bell, Shield, Download } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-8 animate-in max-w-4xl">
            <div>
                <h1 className="text-3xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                    <SettingsIcon className="text-slate-400" size={32} />
                    Settings
                </h1>
                <p className="text-slate-400 mt-2">Configure your NightBite AI experience</p>
            </div>

            {/* Profile Section */}
            <div className="card-panel space-y-6">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest pb-2 border-b border-white/5">
                    <User size={16} /> Profile
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Name</span>
                        <span className="text-sm font-bold text-slate-200">sandeep vishwakarma</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Email</span>
                        <span className="text-sm font-bold text-slate-200">vu1f2324084@pvppcoe.ac.in</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Role</span>
                        <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">User</span>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="card-panel space-y-6">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest pb-2 border-b border-white/5">
                    <Sun size={16} /> Appearance
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-200">Dark Mode</span>
                    <div className="w-10 h-5 bg-slate-800 rounded-full relative cursor-pointer border border-white/5">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-slate-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="card-panel space-y-8">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest pb-2 border-b border-white/5">
                    <Bell size={16} /> Notifications & Interventions
                </div>
                
                {[
                    { title: 'Push Notifications', sub: 'Get alerts about your eating habits', active: true },
                    { title: 'Late Night Alerts', sub: 'Warn when ordering 10PM–4AM', active: true },
                    { title: 'Decision Delay', sub: 'Pause before confirming unhealthy orders', active: true },
                    { title: 'Auto AI Analysis', sub: 'Automatically analyze food when logging', active: true }
                ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-200">{item.title}</span>
                            <p className="text-[11px] text-slate-500">{item.sub}</p>
                        </div>
                        <div className={`w-10 h-5 border border-white/10 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                            <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Privacy Section */}
            <div className="card-panel space-y-6">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest pb-2 border-b border-white/5">
                    <Shield size={16} /> Data & Privacy
                </div>
                <p className="text-xs text-slate-500">Your data is encrypted and privacy-preserved. Export your data anytime.</p>
                <div className="flex gap-4">
                    <button className="btn-secondary text-[10px] flex items-center gap-2 bg-slate-100 text-slate-900 border-none px-6">
                        <Download size={14} /> Export Data
                    </button>
                    <button className="btn-primary text-[10px] bg-emerald-600 hover:bg-emerald-500 border-none px-6 shadow-emerald-500/10">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
