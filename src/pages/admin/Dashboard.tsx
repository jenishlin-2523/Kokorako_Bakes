import React, { useEffect, useState } from 'react'
import {
    Package,
    Users,
    TrendingUp,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
    })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
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
                setRecentOrders(orders.slice(0, 8))
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            {/* SaaS Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time telemetry and management insights.</p>
                </div>
                <div className="flex items-center gap-3">

                    <button className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 rounded-xl text-xs font-bold text-white hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                        <Download size={14} />
                        <span>EXPORT PDF</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        className="card-saas p-6 flex flex-col justify-between group"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`${stat.lightColor} ${stat.textColor} p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon size={22} />
                            </div>
                            <div className={`flex items-center gap-1 ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'} text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100`}>
                                {stat.trend}
                                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            </div>
                        </div>
                        <div className="mt-8">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5">{stat.label}</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                                {stat.label === 'SKUs in stock' && (
                                    <Link to="/admin/products" className="text-brand-600 hover:text-brand-700 p-1 hover:bg-brand-50 rounded-lg transition-all">
                                        <ArrowUpRight size={16} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 card-saas overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Live Transaction Feed</h3>
                            <p className="text-slate-400 text-xs mt-0.5">Automated synchronization with sales ledger.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Counterparty</th>
                                    <th className="px-6 py-4">Gross Nominal</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4 text-right">Settlement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs font-medium tracking-wide">FETCHING DATA...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : recentOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg shadow-slate-900/10">
                                                    {order.customer_name?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 underline decoration-slate-200 underline-offset-4 cursor-pointer hover:decoration-brand-500 transition-colors">{order.customer_name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">Verified Customer</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">₹{order.total?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-mono font-bold text-slate-400">
                                                ID-{order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`
                                                inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm
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
                </motion.div>

                <div className="space-y-8">
                    {/* Insights Card */}
                    <motion.div variants={itemVariants} className="card-saas p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <AlertCircle size={16} className="text-slate-400" />
                            System Integrity
                        </h3>
                        <div className="space-y-5">
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
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}


