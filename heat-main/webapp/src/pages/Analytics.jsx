import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTC, ResponsiveContainer,
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
    Legend as ChartLegend
} from 'recharts';
import { Calendar } from 'lucide-react';

const dailyTrendData = [
  { date: 'Mar 18', orders: 0, risk: 0 }, { date: 'Mar 19', orders: 0, risk: 0 },
  { date: 'Mar 20', orders: 0, risk: 0 }, { date: 'Mar 21', orders: 0, risk: 0 },
  { date: 'Mar 22', orders: 0, risk: 0 }, { date: 'Mar 23', orders: 0.1, risk: 0.05 },
  { date: 'Mar 24', orders: 3, risk: 2 }, { date: 'Mar 25', orders: 1, risk: 0.2 },
  { date: 'Mar 26', orders: 2.2, risk: 1.5 }, { date: 'Mar 27', orders: 3, risk: 2 },
  { date: 'Mar 28', orders: 1, risk: 1 }, { date: 'Mar 29', orders: 1, risk: 0 },
  { date: 'Mar 30', orders: 1, risk: 1 }, { date: 'Mar 31', orders: 0, risk: 0 },
];

const hourlyData = [
    { hour: '0:00', frequency: 0 }, { hour: '3:00', frequency: 2 }, 
    { hour: '6:00', frequency: 3 }, { hour: '9:00', frequency: 2 },
    { hour: '12:00', frequency: 0 }, { hour: '15:00', frequency: 2 },
    { hour: '18:00', frequency: 1 }, { hour: '21:00', frequency: 2 },
];

const radarData = [
    { subject: 'Frequency', A: 80, fullMark: 100 },
    { subject: 'Late Night', A: 95, fullMark: 100 },
    { subject: 'Junk Food', A: 60, fullMark: 100 },
    { subject: 'High Calories', A: 70, fullMark: 100 },
    { subject: 'Stress Eating', A: 40, fullMark: 100 },
    { subject: 'High Sodium', A: 55, fullMark: 100 },
];

const platformData = [
    { name: 'Zomato', value: 3 }, { name: 'Swiggy', value: 4 },
    { name: 'Manual', value: 3 }, { name: 'UberEats', value: 1 },
    { name: 'DoorDash', value: 1 },
];

const moodData = [
    { name: 'craving', value: 2 }, { name: 'hungry', value: 3 },
    { name: 'stressed', value: 0.75 }, { name: 'happy', value: 2 },
    { name: 'bored', value: 2 }, { name: 'social', value: 0.75 },
    { name: 'sad', value: 0.75 },
];

export default function Analytics() {
    return (
        <div className="space-y-8 animate-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">Analytics & Trends</h1>
                    <p className="text-slate-400 mt-2">Deep dive into your eating patterns and health metrics</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl text-slate-300">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">View</span>
                    <span className="text-sm font-bold flex items-center gap-2">30 Days <Calendar size={14} /></span>
                </div>
            </div>
            
            {/* Main Daily Trend Chart */}
            <div className="card-panel">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Daily Order & Risk Trend</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <AreaChart data={dailyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="orderColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="riskColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <RTC contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                            <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#orderColor)" strokeWidth={2} />
                            <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#riskColor)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hourly Distribution */}
                <div className="card-panel">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Hourly Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <RTC cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                                <Bar dataKey="frequency" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center mt-4">
                        <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-2">
                           🌙 10PM–4AM = Late Night Zone
                        </span>
                    </div>
                </div>

                {/* Risk Profile Radar */}
                <div className="card-panel">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Risk Profile Radar</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Risk Factor" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Usage */}
                <div className="card-panel">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Platform Usage</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={platformData} margin={{ left: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Bar dataKey="value" fill="#0c4a6e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Mood Mapping */}
                <div className="card-panel">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Mood When Ordering</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={moodData} margin={{ left: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Bar dataKey="value" fill="#4c1d95" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
