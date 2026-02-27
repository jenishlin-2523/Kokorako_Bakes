import React, { useState } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    ShoppingCart,
    Cake,
    LogOut,
    Menu,
    ChevronRight,
    Settings,
    HelpCircle
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const AdminLayout: React.FC = () => {
    const { user, loading, signOut } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setSidebarOpen] = useState(true)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/products', label: 'Inventory', icon: Cake },
    ]

    const secondaryItems = [
        { path: '/admin/settings', label: 'Settings', icon: Settings },
        { path: '/admin/help', label: 'Support', icon: HelpCircle },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex font-sans">
            {/* SaaS Sidebar */}
            <aside className={`
                ${isSidebarOpen ? 'w-72' : 'w-20'} 
                bg-sidebar-bg transition-all duration-300 ease-in-out
                hidden lg:flex flex-col relative z-30 shadow-2xl
            `}>
                {/* Brand Section */}
                <div className="h-20 flex items-center px-6 mb-4">
                    <Link to="/admin" className="flex items-center space-x-3 overflow-hidden">
                        <div className="h-10 w-10 min-w-[2.5rem] bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <span className="text-white font-black text-xl">K</span>
                        </div>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col"
                            >
                                <span className="text-white font-bold tracking-tight text-lg leading-tight">Kokorako</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Enterprise</span>
                            </motion.div>
                        )}
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex-grow px-4 space-y-1">
                    <div className={`${isSidebarOpen ? 'px-4 mb-2' : 'text-center mb-4'}`}>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Menu</span>
                    </div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link key={item.path} to={item.path}>
                                <div className={`
                                    sidebar-item mb-1
                                    ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                                    ${!isSidebarOpen && 'justify-center px-0'}
                                `}>
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="ml-4"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {isActive && isSidebarOpen && (
                                        <motion.div layoutId="activePill" className="ml-auto">
                                            <ChevronRight size={14} className="opacity-50" />
                                        </motion.div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}

                    <div className={`${isSidebarOpen ? 'px-4 mt-8 mb-2' : 'text-center mt-8 mb-4'}`}>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">System</span>
                    </div>
                    {secondaryItems.map((item) => (
                        <div key={item.label} className={`sidebar-item sidebar-item-inactive mb-1 cursor-pointer ${!isSidebarOpen && 'justify-center px-0'}`}>
                            <item.icon size={20} />
                            {isSidebarOpen && <span className="ml-4">{item.label}</span>}
                        </div>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-4 mt-auto border-t border-slate-800/50">
                    <div className={`
                        flex items-center p-2 rounded-xl bg-slate-800/30
                        ${!isSidebarOpen ? 'justify-center p-1' : 'justify-between'}
                    `}>
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="h-9 w-9 min-w-[2.25rem] rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-sm">
                                {user.email?.[0].toUpperCase()}
                            </div>
                            {isSidebarOpen && (
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
                                </div>
                            )}
                        </div>
                        {isSidebarOpen && (
                            <button
                                onClick={() => signOut()}
                                className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col h-screen overflow-hidden">
                {/* SaaS Header */}
                <header className="h-20 glass sticky top-0 z-20 flex items-center justify-between px-8 border-b border-slate-200/50">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">{user.email?.split('@')[0]}</p>
                                <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Premium Plan</p>
                            </div>
                            <div className="h-10 w-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center p-1">
                                <div className="h-full w-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                    <span className="text-slate-600 font-bold text-xs">{user.email?.[0].toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-surface-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
