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
        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        const matchesSearch = o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_phone?.includes(searchQuery);
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
                    <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track all customer orders in real-time.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer transition-all hover:bg-slate-50"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            {statuses.map(s => <option key={s} value={s}>{s} Status</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="card-saas overflow-hidden mb-20">
                <div className="overflow-x-auto custom-scrollbar pb-90">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
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
                                            <span className="text-sm">Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                        No orders found matching your criteria.
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
                                                        <p className="text-sm font-bold text-slate-900">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                                                        <p className="font-semibold text-slate-900 text-sm">{order.customer_name}</p>
                                                        <p className="text-[11px] text-slate-500 font-medium">{order.customer_phone}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-slate-900 text-sm">₹{order.total.toLocaleString()}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${getStatusStyles(order.status)}`}>
                                                    {getStatusIcon(order.status, 11)}
                                                    {order.status}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openWhatsApp(order.customer_phone, order.order_number); }}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                        title="Message Customer"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenu(activeMenu === order.id ? null : order.id);
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${activeMenu === order.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {activeMenu === order.id && (
                                                                <motion.div
                                                                    ref={menuRef}
                                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1"
                                                                >
                                                                    <div className="px-3 py-2 border-b border-slate-50">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Update Status</span>
                                                                    </div>
                                                                    {statuses.filter(s => s !== 'All' && s !== order.status).map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => updateOrderStatus(order.id, s)}
                                                                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors flex items-center gap-3"
                                                                        >
                                                                            <span className="opacity-50">{getStatusIcon(s, 14)}</span>
                                                                            {s}
                                                                        </button>
                                                                    ))}

                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
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
                                                                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                                        <Package size={16} className="text-brand-500" />
                                                                        Items ({order.items?.length || 0})
                                                                    </h4>
                                                                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Order Payload</span>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    {order.items?.map((item: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 group-hover:border-brand-100 transition-colors">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                                                                    <Package size={14} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                                                        {item.customization?.weight || 'Standard'} × {item.quantity}
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
                                                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-0.5">
                                                                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                                                            <Calendar size={14} /> Fulfillment Date
                                                                        </h4>
                                                                        <p className="text-sm font-bold text-slate-900">
                                                                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'ASAP Fulfillment'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-0.5">
                                                                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                                                            <Clock size={14} /> Time Window
                                                                        </h4>
                                                                        <p className="text-sm font-bold text-slate-900">{order.delivery_time || 'Regular Window'}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                                            <MapPin size={14} /> Destination
                                                                        </h4>
                                                                        <button className="text-[10px] font-bold text-brand-600 hover:underline">Copy Address</button>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                                                        {order.address || 'Self-Pickup from Main Facility'}
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
        </div>
    );
};
