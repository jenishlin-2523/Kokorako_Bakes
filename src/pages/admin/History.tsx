import React, { useEffect, useState } from 'react';
import {
    History,
    Search
} from 'lucide-react';
import { supabase } from '../../services/supabase';

export const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('delivery_date', { ascending: false });

            if (error) throw error;

            console.log('DEBUG: Raw data from Supabase:', data);

            const now = new Date();
            // Get YYYY-MM-DD in local timezone
            const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            const currentHour = now.getHours();

            console.log('DEBUG: Filtering for todayStr:', todayStr, 'Current Hour:', currentHour);

            const archives = (data || []).filter(o => {
                const orderDate = (o.delivery_date || '').split('T')[0].trim();
                const isPastDate = orderDate && orderDate < todayStr;
                const isTodayAndShiftOver = orderDate === todayStr && currentHour >= 22;

                const isArchived = Boolean(isPastDate || isTodayAndShiftOver);
                if (isArchived) console.log('DEBUG: Archiving order:', o.order_number || o.id, 'Date:', orderDate);
                return isArchived;
            });

            console.log('DEBUG: Total archives found:', archives.length);
            setOrders(archives);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = (orders || []).filter(o => {
        const query = searchQuery.toLowerCase();
        const customerName = String(o.customer_name || '').toLowerCase();
        const orderNumber = String(o.order_number || '').toLowerCase();
        const customerPhone = String(o.customer_phone || '');

        return customerName.includes(query) ||
            orderNumber.includes(query) ||
            customerPhone.includes(query);
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };



    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">

                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Order History
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-widest">Archive</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm">Review logs of completed, cancelled, and past deliveries.</p>
                </div>

                <div className="relative group w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4 mb-20">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Records...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="card-saas p-20 text-center">
                        <History size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found for the given criteria</p>
                    </div>
                ) : (
                    <div className="card-saas overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-10 w-10 min-w-[2.5rem] bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs border border-slate-200">
                                            {order.customer_name?.[0]?.toUpperCase() || '#'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{order.customer_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                ID: {order.order_number || order.id.slice(0, 8)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                                            <p className="text-sm font-bold text-slate-900">₹{parseFloat(order.total || 0).toLocaleString()}</p>
                                        </div>

                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dispatched</p>
                                            <p className="text-[11px] font-bold text-slate-600">
                                                {new Date(order.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest h-fit ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
