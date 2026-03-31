import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, CalendarDays, PieChart, Brain, Trophy, BarChart3, Settings, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/orders', label: 'Food Orders', icon: UtensilsCrossed },
    { path: '/heatmap', label: 'Activity Heatmap', icon: CalendarDays },
    { path: '/plate', label: 'Plate Visualizer', icon: PieChart },
    { path: '/ai-insights', label: 'AI Insights', icon: Brain },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-[#0c0c0e] text-white overflow-hidden relative font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0c0c0e] flex flex-col border-r border-[#1f2937]/50 z-10">
                <div className="p-6 pb-8 border-b border-[#1f2937]/30 mb-2 mt-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#166534] flex items-center justify-center flex-shrink-0">
                            <Moon size={20} className="text-[#4ade80] fill-[#4ade80]" strokeWidth={2}/>
                        </div>
                        <div>
                            <h1 className="text-[17px] font-bold tracking-wide text-[#f3f4f6]">NightBite AI</h1>
                            <p className="text-[11px] font-semibold text-[#6b7280] tracking-wider uppercase mt-0.5 font-mono">v2.0 • Health Guard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${isActive ? 'bg-[#166534] text-[#4ade80]' : 'text-[#6b7280] hover:text-[#d1d5db] hover:bg-[#1f2937]/30'}`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#4ade80]' : 'text-[#6b7280]'}/>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main View Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a] sm:rounded-tl-3xl shadow-2xl sm:border-l sm:border-t border-[#1e293b] sm:mt-4 sm:ml-2 sm:mr-4 sm:mb-4 overflow-hidden relative">
                <header className="h-16 flex items-center px-8 justify-between border-b border-[#1e293b]/50">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                </header>

                <div className="p-8 flex-1 w-full relative overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full text-textMain"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            {/* Chatbot Overlay */}
            <Chatbot />
        </div>
    );
}

