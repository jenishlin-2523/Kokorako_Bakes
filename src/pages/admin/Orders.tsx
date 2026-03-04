import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Package,
    Calendar,
    MapPin,
    Search,
    MoreHorizontal
} from 'lucide-react';
import { supabase } from '../../services/supabase';

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<any | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const statuses = ['All', 'Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'];

    useEffect(() => {
        fetchOrders();
        const subscription = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setSelectedOrderForStatus(null);
            setActiveMenu(null);
        } catch (err) {
            alert('Failed to update order status.');
        }
    };

    const openWhatsApp = (phone: string, orderNumber: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Hi! Regarding your order ${orderNumber}...`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const filteredOrders = orders.filter(o => {
        const now = new Date();
        const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const currentHour = now.getHours();

        // If shift is over (10 PM), today's orders are considered 'Historic'
        const orderDate = (o.delivery_date || '').trim();
        const isPastDate = orderDate && orderDate < todayStr;
        const isTodayAndShiftOver = orderDate === todayStr && currentHour >= 22;

        if (isPastDate || isTodayAndShiftOver) return false;

        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        const query = searchQuery.toLowerCase();
        const customerName = String(o.customer_name || '').toLowerCase();
        const orderNumber = String(o.order_number || '').toLowerCase();
        const customerPhone = String(o.customer_phone || '');

        const matchesSearch = customerName.includes(query) ||
            orderNumber.includes(query) ||
            customerPhone.includes(query);

        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Out for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status: string, size = 12) => {
        switch (status) {
            case 'Pending': return <Clock size={size} />;
            case 'Processing': return <Package size={size} />;
            case 'Out for Delivery': return <Truck size={size} />;
            case 'Completed': return <CheckCircle size={size} />;
            case 'Cancelled': return <XCircle size={size} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Order Management
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage all customer purchases and deliveries.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer transition-all hover:bg-slate-50 w-full"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            {statuses.map(s => <option key={s} value={s}>{s} Status</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4 mb-20">
                {/* Desktop Table View */}
                <div className="hidden lg:block card-saas">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm font-medium">Updating Orders...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium tracking-wide">
                                            NO ORDERS FOUND WITHIN SPECIFIED PARAMETERS.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <motion.tr
                                                layout
                                                className={`group transition-colors ${expandedOrder === order.id ? 'bg-brand-50/30' : 'hover:bg-slate-50/80'}`}
                                            >
                                                <td className="px-6 py-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-1.5 rounded-lg transition-colors ${expandedOrder === order.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                            {expandedOrder === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 leading-none">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg shadow-slate-900/10">
                                                            {order.customer_name?.[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm leading-none">{order.customer_name}</p>
                                                            <p className="text-[11px] text-slate-500 font-medium mt-1">{order.customer_phone}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-slate-900 text-sm tracking-tight">₹{order.total.toLocaleString()}</span>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                                        {getStatusIcon(order.status, 11)}
                                                        {order.status}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openWhatsApp(order.customer_phone, order.order_number); }}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                            title="WhatsApp Customer"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrderForStatus(order);
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-100`}
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* Expanded Details Row */}
                                            <AnimatePresence>
                                                {expandedOrder === order.id && (
                                                    <motion.tr
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-slate-50/50"
                                                    >
                                                        <td colSpan={5} className="px-6 py-8 border-b border-slate-100">
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                                                                            <Package size={16} className="text-brand-500" />
                                                                            Order Items ({order.items?.length || 0})
                                                                        </h4>
                                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ID: {order.id.slice(0, 12)}</span>
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        {order.items?.map((item: any, idx: number) => (
                                                                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                                                                        <Package size={14} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                                                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                                            {item.customization?.weight || 'Standard SKU'} × {item.quantity}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <p className="font-bold text-slate-900 text-sm">₹{(item.price || 0) * item.quantity}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-6">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                                                <Calendar size={14} /> Delivery Date
                                                                            </h4>
                                                                            <p className="text-sm font-bold text-slate-900">
                                                                                {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Standard Priority'}
                                                                            </p>
                                                                        </div>
                                                                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                                                <Clock size={14} /> Delivery Time
                                                                            </h4>
                                                                            <p className="text-sm font-bold text-slate-900">{order.delivery_time || 'Regular Feed'}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                                                        <div className="flex items-center justify-between mb-4">
                                                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <MapPin size={14} /> Shipping Address
                                                                            </h4>
                                                                        </div>
                                                                        <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                                                                            {order.address || 'Pickup at Store'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                            <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Syncing...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center card-saas text-slate-400 font-bold text-xs uppercase tracking-widest">
                            No Active Transactions
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="card-saas p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg">
                                            {order.customer_name?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{order.customer_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                {order.order_number || `#${order.id.slice(0, 8)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-3 border-y border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                                        <p className="text-base font-bold text-slate-900">₹{order.total.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order Date</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="text-[10px] font-bold text-brand-600 uppercase tracking-[0.15em] flex items-center gap-1"
                                    >
                                        {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                                        {expandedOrder === order.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openWhatsApp(order.customer_phone, order.order_number)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-50"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrderForStatus(order)}
                                            className="p-2 rounded-lg transition-colors text-slate-400 bg-slate-50"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pt-4 border-t border-slate-50 space-y-4"
                                        >
                                            <div className="space-y-2">
                                                {((typeof order.items === 'string' ? JSON.parse(order.items) : order.items) || []).map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                        <p className="text-xs font-bold text-slate-800">{item.name} <span className="text-[10px] text-slate-400 ml-1">×{item.quantity}</span></p>
                                                        <p className="text-xs font-bold text-slate-900">₹{(item.price || 0) * item.quantity}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-xl text-white space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={12} className="text-brand-400 mt-0.5" />
                                                    <p className="text-[10px] font-medium leading-relaxed opacity-80">{order.address || 'Pickup at Store'}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} className="text-brand-400" />
                                                        <p className="text-[10px] font-bold uppercase">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'ASAP'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={12} className="text-brand-400" />
                                                        <p className="text-[10px] font-bold uppercase">{order.delivery_time || 'Reg'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>
                {/* Status Selection Modal */}
                <AnimatePresence>
                    {selectedOrderForStatus && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedOrderForStatus(null)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Update Status</h3>
                                    <p className="text-xs text-slate-500 mt-1">Order: {selectedOrderForStatus.order_number || `#${selectedOrderForStatus.id.slice(0, 8)}`}</p>
                                </div>
                                <div className="p-3">
                                    {statuses.filter(s => s !== 'All').map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateOrderStatus(selectedOrderForStatus.id, s)}
                                            className={`w-full text-left p-3.5 rounded-xl text-sm font-bold flex items-center gap-4 transition-all ${selectedOrderForStatus.status === s ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${selectedOrderForStatus.status === s ? 'bg-brand-100' : 'bg-slate-100'}`}>
                                                {getStatusIcon(s, 14)}
                                            </div>
                                            {s}
                                            {selectedOrderForStatus.status === s && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100">
                                    <button
                                        onClick={() => setSelectedOrderForStatus(null)}
                                        className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
