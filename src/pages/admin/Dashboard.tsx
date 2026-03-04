import React, { useEffect, useState } from 'react'
import {
    Package,
    Users,
    TrendingUp,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    AlertCircle,
    Clock,
    Calendar
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { Link } from 'react-router-dom'

const formatDateWithOrdinal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'long' });

    const suffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${day}${suffix(day)} ${month}`;
};

const getTimeValue = (timeRange: string) => {
    if (!timeRange) return 9999;
    try {
        const startTimePart = timeRange.split('-')[0].trim();
        const parts = startTimePart.split(' ');
        if (parts.length < 2) return 9999;

        const time = parts[0];
        const period = parts[1].toUpperCase();
        let [hours, minutes] = time.split(':').map(Number);

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + (minutes || 0);
    } catch (e) {
        return 9999;
    }
};

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [todaysDeliveries, setTodaysDeliveries] = useState<any[]>([])
    const [tomorrowsDeliveries, setTomorrowsDeliveries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError

            const { count: productCount, error: productsError } = await supabase
                .from('cakes')
                .select('*', { count: 'exact', head: true })

            if (productsError) throw productsError

            if (orders) {
                const sales = orders
                    .filter(o => o.status === 'Completed')
                    .reduce((sum, o) => sum + (o.total || 0), 0)

                const uniqueCustomers = new Set(orders.map(o => o.customer_phone)).size

                setStats({
                    totalSales: sales,
                    totalOrders: orders.length,
                    totalCustomers: uniqueCustomers,
                    totalProducts: productCount || 0
                })

                // Only show current orders in the Live Transaction Feed
                const now = new Date();
                const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                const currentHour = now.getHours();

                const currentOrders = orders.filter(o => {
                    const isFuture = o.delivery_date > todayStr;
                    const isTodayActive = o.delivery_date === todayStr && currentHour < 22;
                    return isFuture || isTodayActive;
                });
                setRecentOrders(currentOrders.slice(0, 8))

                // Get local dates and current time for "Refresh" logic
                // Reuse existing variables

                // Get local date string YYYY-MM-DD
                const tmrw = new Date(now);
                tmrw.setDate(tmrw.getDate() + 1);
                const tomorrowStr = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000).toISOString().split('T')[0];

                // "Refresh at 10 PM": If it's 10 PM or later, clear "Today's" tasks as the shift is over.
                // This keeps the dashboard clean for the next morning.
                const isAfterShift = currentHour >= 22;

                const todayDeliveries = isAfterShift
                    ? []
                    : orders
                        .filter(o => (o.delivery_date || '').trim() === todayStr && o.status !== 'Cancelled')
                        .sort((a, b) => getTimeValue(a.delivery_time) - getTimeValue(b.delivery_time))

                const tomorrowDeliveries = orders
                    .filter(o => (o.delivery_date || '').trim() === tomorrowStr && o.status !== 'Cancelled')
                    .sort((a, b) => getTimeValue(a.delivery_time) - getTimeValue(b.delivery_time))

                setTodaysDeliveries(todayDeliveries)
                setTomorrowsDeliveries(tomorrowDeliveries)
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: `₹${stats.totalSales.toLocaleString()}`,
            icon: TrendingUp,
            trend: '+12.5%',
            isPositive: true,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders.toString(),
            icon: ShoppingBag,
            trend: '+5.2%',
            isPositive: true,
            color: 'bg-brand-500',
            lightColor: 'bg-brand-50',
            textColor: 'text-brand-600'
        },
        {
            label: 'Customers',
            value: stats.totalCustomers.toString(),
            icon: Users,
            trend: '-2.4%',
            isPositive: false,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
        },
        {
            label: 'SKUs in stock',
            value: stats.totalProducts.toString(),
            icon: Package,
            trend: '+3.1%',
            isPositive: true,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
    ]





    return (
        <div className="space-y-6 sm:space-y-10">
            {/* SaaS Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">Real-time telemetry and management insights.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex-grow sm:flex-grow-0 flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 rounded-xl text-xs font-bold text-white hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                        <Download size={14} />
                        <span>EXPORT PDF</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="card-saas p-5 sm:p-6 flex flex-col justify-between group"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`${stat.lightColor} ${stat.textColor} p-2.5 sm:p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon size={20} className="sm:w-5.5 sm:h-5.5" />
                            </div>
                            <div className={`flex items-center gap-1 ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'} text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100`}>
                                {stat.trend}
                                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            </div>
                        </div>
                        <div className="mt-6 sm:mt-8">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                                {stat.label === 'SKUs in stock' && (
                                    <Link to="/admin/products" className="text-brand-600 hover:text-brand-700 p-1 hover:bg-brand-50 rounded-lg transition-all">
                                        <ArrowUpRight size={16} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery Schedules Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Today's Deliveries */}
                <div className="card-saas overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-white">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Today's Deliveries</h3>
                            <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">Priority dispatch queue for current operations.</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                            {todaysDeliveries.length} Tasks
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {todaysDeliveries.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">No deliveries for today.</div>
                        ) : todaysDeliveries.map((order) => (
                            <div key={order.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{order.customer_name}</p>
                                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{order.customer_phone}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-100 text-[10px] font-bold">
                                            <Clock size={12} />
                                            {order.delivery_time || 'General'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[10px] font-bold">
                                            <Calendar size={12} />
                                            {formatDateWithOrdinal(order.delivery_date)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'text-emerald-500' : 'text-brand-500'}`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tomorrow's Deliveries */}
                <div className="card-saas overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-white">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Tomorrow's Deliveries</h3>
                            <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">Advance logistical planning for next session.</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 uppercase tracking-wider">
                            {tomorrowsDeliveries.length} Tasks
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {tomorrowsDeliveries.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">No deliveries for tomorrow.</div>
                        ) : tomorrowsDeliveries.map((order) => (
                            <div key={order.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{order.customer_name}</p>
                                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{order.customer_phone}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 text-[10px] font-bold">
                                            <Clock size={12} />
                                            {order.delivery_time || 'General'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[10px] font-bold">
                                            <Calendar size={12} />
                                            {formatDateWithOrdinal(order.delivery_date)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 card-saas overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">Live Transaction Feed</h3>
                            <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">Automated synchronization with sales ledger.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs font-medium tracking-wide text-slate-400">SYNCING LEDGER...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : recentOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg shadow-slate-900/10 flex-shrink-0">
                                                    {order.customer_name?.[0].toUpperCase()}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-slate-900 underline decoration-slate-200 underline-offset-4 cursor-pointer hover:decoration-brand-500 transition-colors truncate max-w-[120px] sm:max-w-none">{order.customer_name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">Verified</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">₹{order.total?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                                ID-{order.id.slice(0, 6)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`
                                                inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm
                                                ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-brand-50 text-brand-600 border-brand-100'}
                                            `}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Insights Card */}
                    <div className="card-saas p-6">
                        <h3 className="text-xs font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <AlertCircle size={16} className="text-slate-400" />
                            System Integrity
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Query Engine', status: 'Optimal', color: 'bg-emerald-500', pulse: true },
                                { label: 'Storage Cluster', status: 'Stable', color: 'bg-emerald-500', pulse: false },
                                { label: 'Webhooks', status: 'Active', color: 'bg-brand-500', pulse: false }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-sm shadow-current/50`} />
                                            {item.pulse && <div className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${item.color} animate-ping opacity-50`} />}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


