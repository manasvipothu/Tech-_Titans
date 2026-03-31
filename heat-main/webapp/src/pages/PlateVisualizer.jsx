import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Healthy', value: 400 },
  { name: 'Moderate', value: 300 },
  { name: 'Unhealthy', value: 300 },
];
const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function PlateVisualizer() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Plate Visualizer</h1>
            <p className="text-slate-500">Macro and category distribution of your diet.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-panel flex flex-col items-center">
                    <h3 className="font-semibold text-slate-700 w-full mb-4">Diet Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={data} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="card-panel">
                    <h3 className="font-semibold text-slate-700 mb-4">Hidden Dangers</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-red-700 border border-red-100">
                            <span>Avg Sugar / Meal</span>
                            <span className="font-bold">42g ⚠️</span>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg text-amber-700 border border-amber-100">
                            <span>Avg Sodium / Meal</span>
                            <span className="font-bold">950mg ⚠️</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
