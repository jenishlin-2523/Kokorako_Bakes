import React, { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface NavbarProps {
    onOpenCart: () => void
    cartCount: number
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, cartCount }) => {
    const [scrolled, setScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/catalog' },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
            <div className={`max-w-5xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-md border border-bakery-warm/60 px-5 py-3 rounded-2xl shadow-sm transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-bakery-teal rounded-xl flex items-center justify-center text-white">
                        <span className="font-black text-sm">K</span>
                    </div>
                    <span className="text-base font-black text-bakery-teal tracking-tight">
                        KOKORAKO <span className="text-bakery-gold">BAKES</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-bakery-gold' : 'text-bakery-teal/50 hover:text-bakery-teal'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link to="/catalog" className="hidden sm:block">
                        <button className="px-5 py-2 bg-bakery-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-bakery-gold transition-all">
                            Order Now
                        </button>
                    </Link>

                    <button
                        onClick={onOpenCart}
                        className="relative p-2 text-bakery-teal hover:text-bakery-gold transition-colors"
                    >
                        <ShoppingBag size={20} strokeWidth={2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-bakery-gold text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        className="md:hidden p-2 text-bakery-teal"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-2 max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-bakery-warm/60 shadow-lg p-5 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-black text-bakery-teal hover:text-bakery-gold transition-colors uppercase tracking-widest"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="w-full py-3 bg-bakery-teal text-white rounded-xl font-black text-xs uppercase tracking-widest">
                                    Order Now
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
