import React from 'react';

export default function Orders() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Food Log</h1>
                <button className="btn-primary">+ Log Order</button>
            </div>
            
            <div className="card-panel min-h-[400px]">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border text-slate-500">
                            <th className="pb-3 font-semibold">Food Name</th>
                            <th className="pb-3 font-semibold">Time</th>
                            <th className="pb-3 font-semibold">Risk Score</th>
                            <th className="pb-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" className="py-8 text-center text-slate-400">
                                No orders logged yet.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
