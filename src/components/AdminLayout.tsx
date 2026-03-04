import React, { useState } from 'react'
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    ShoppingCart,
    Cake,
    LogOut,
    ChevronRight,
    Settings,
    History
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AdminHeader } from './AdminHeader'

export const AdminLayout: React.FC = () => {
    const { user, loading, signOut } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        { path: '/admin/history', label: 'History', icon: History },
        { path: '/admin/products', label: 'Inventory', icon: Cake },
    ]

    const secondaryItems = [
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ]

    const SidebarContent = ({ isCollapsed, onLinkClick }: { isCollapsed: boolean, onLinkClick?: () => void }) => (
        <div className="flex flex-col h-full">
            {/* Brand Section */}
            <div className="h-20 flex items-center px-6 mb-4 flex-shrink-0">
                <Link to="/admin" className="flex items-center space-x-3 overflow-hidden" onClick={onLinkClick}>
                    <div className="h-10 w-10 min-w-[2.5rem] bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <span className="text-white font-black text-xl">K</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-white font-bold tracking-tight text-lg leading-tight">Kokorako</span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Enterprise</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className={`${!isCollapsed ? 'px-4 mb-2' : 'text-center mb-4'}`}>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Menu</span>
                </div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path} onClick={onLinkClick}>
                            <div className={`
                                sidebar-item mb-1
                                ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                                ${isCollapsed && 'justify-center px-0'}
                            `}>
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="ml-4"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto">
                                        <ChevronRight size={14} className="opacity-50" />
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}

                <div className={`mt-10 ${!isCollapsed ? 'px-4 mb-2' : 'text-center mb-4'}`}>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">System</span>
                </div>
                {secondaryItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path} onClick={onLinkClick}>
                            <div className={`
                                sidebar-item mb-1
                                ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                                ${isCollapsed && 'justify-center px-0'}
                            `}>
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                {!isCollapsed && <span className="ml-4">{item.label}</span>}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 mt-auto border-t border-white/5 flex-shrink-0">
                <button
                    onClick={() => signOut()}
                    className={`
                        w-full flex items-center p-3 rounded-xl
                        text-slate-400 hover:text-white hover:bg-white/5 transition-all
                        ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-semibold">Sign Out</span>}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-sidebar-bg font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 88 }}
                className="hidden lg:flex flex-col border-r border-white/5 bg-sidebar-bg flex-shrink-0 relative z-40 transition-all duration-300 ease-in-out"
            >
                <SidebarContent isCollapsed={!isSidebarOpen} />
            </motion.aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-sidebar-bg z-[101] lg:hidden shadow-2xl"
                        >
                            <SidebarContent isCollapsed={false} onLinkClick={() => setIsMobileMenuOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col h-screen overflow-hidden w-full bg-[#F8FAFC]">
                {/* Scrollable Content Container */}
                <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <AdminHeader
                        user={user}
                        isSidebarOpen={isSidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />

                    <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 pt-4 sm:pt-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}
