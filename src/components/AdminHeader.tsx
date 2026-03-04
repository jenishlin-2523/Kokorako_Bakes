import React, { useEffect, useState } from 'react';
import { Menu, ChevronDown, Plus, RefreshCw, Activity, Calendar } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AdminHeaderProps {
    user: any;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
    user,
    isSidebarOpen,
    setSidebarOpen,
    setIsMobileMenuOpen
}) => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTodayStats = async () => {
        setIsRefreshing(true);
        try {


            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .not('status', 'in', '("Completed","Cancelled")');

            setPendingCount(count || 0);
        } catch (err) {
            console.error('Header stats fetch error:', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    useEffect(() => {
        fetchTodayStats();

        // Subscribe to real-time changes in the orders table
        const channel = supabase
            .channel('admin-header-stats')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                () => {
                    console.log('Real-time update detected, refreshing header stats...');
                    fetchTodayStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const todayDisplay = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
    });

    return (
        <header className="sticky top-0 z-30 w-full px-4 sm:px-8 pt-4 pb-2 transition-all duration-300">
            <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 rounded-[24px] border border-white/40 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300">

                {/* Left Section: Context & Controls */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2.5 hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-all active:scale-95 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-all active:scale-95 hidden lg:block"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200/60 mx-1 hidden md:block" />

                    {/* Operational Quick View */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                            <Activity size={14} className="text-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                                {pendingCount} Pending Orders
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                {todayDisplay}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center space-x-3 sm:space-x-5">
                    {/* Primary System Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchTodayStats}
                            className={`p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-brand-600' : ''}`}
                            title="Refresh Dashboard"
                        >
                            <RefreshCw size={18} />
                        </button>

                        <a
                            href="/admin/products"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            <Plus size={16} />
                            <span className="text-xs font-bold uppercase tracking-wide">Quick Add</span>
                        </a>
                    </div>

                    <div className="h-8 w-px bg-slate-200/60 mx-1 hidden sm:block" />

                    {/* Profile Dropdown */}
                    <div className="flex items-center gap-3 group cursor-pointer select-none">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Administrator</p>
                        </div>

                        <div className="relative">
                            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-brand-500 via-brand-400 to-brand-600 p-[2px] shadow-lg shadow-brand-500/10 transition-transform group-hover:scale-105 duration-300">
                                <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden border border-white/50">
                                    <span className="text-brand-600 font-black text-sm">{user.email?.[0].toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                                <ChevronDown size={10} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
