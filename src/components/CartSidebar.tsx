import React from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface CartItem extends Product {
    quantity: number
    customization: {
        weight: string
    }
}

interface CartSidebarProps {
    isOpen: boolean
    onClose: () => void
    items: CartItem[]
    onUpdateQuantity: (id: string, delta: number, weight: string) => void
    onRemoveItem: (id: string, weight: string) => void
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
    isOpen,
    onClose,
    items,
    onUpdateQuantity,
    onRemoveItem
}) => {
    const total = items.reduce((acc, item) => {
        const price = item.prices[item.customization.weight] || 0
        return acc + price * item.quantity
    }, 0)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 flex justify-between items-center border-b border-bakery-warm/50">
                            <div>
                                <h2 className="text-lg font-black text-bakery-teal tracking-tight uppercase">Your Basket</h2>
                                <p className="text-[10px] font-black text-bakery-teal/30 uppercase tracking-widest mt-0.5">
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 bg-bakery-cream rounded-xl flex items-center justify-center text-bakery-teal hover:bg-bakery-peach transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                                    <ShoppingBag size={36} className="text-bakery-teal/20" strokeWidth={1.5} />
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-bakery-teal uppercase tracking-wide">Basket is empty</h3>
                                        <p className="text-xs text-bakery-teal/30 font-medium">Browse treats and add them here.</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="mt-2 bg-bakery-teal text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-bakery-gold transition-all"
                                    >
                                        Browse
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.customization.weight}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 p-3 bg-bakery-cream/60 rounded-2xl border border-bakery-warm/40"
                                    >
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-bakery-warm/40">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-bakery-teal/20">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0 space-y-1.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-black text-bakery-teal text-xs tracking-tight line-clamp-1 leading-tight">{item.name}</h4>
                                                <button
                                                    onClick={() => onRemoveItem(item.id, item.customization.weight)}
                                                    className="text-bakery-teal/20 hover:text-red-400 transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <span className="text-[9px] font-black text-bakery-gold uppercase tracking-wide">{item.customization.weight}</span>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-bakery-warm/40">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, -1, item.customization.weight)}
                                                        className="w-6 h-6 flex items-center justify-center text-bakery-teal/40 hover:text-bakery-gold transition-colors"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-xs font-black text-bakery-teal w-5 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, 1, item.customization.weight)}
                                                        className="w-6 h-6 flex items-center justify-center text-bakery-teal/40 hover:text-bakery-gold transition-colors"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                                <p className="font-black text-bakery-gold text-sm tracking-tight">
                                                    ₹{(item.prices[item.customization.weight] || 0) * item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-6 py-5 border-t border-bakery-warm/50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-bakery-teal/30 uppercase tracking-widest">Subtotal</span>
                                    <p className="text-2xl font-black text-bakery-teal tracking-tight">₹{total}</p>
                                </div>
                                <Link to="/checkout" onClick={onClose}>
                                    <button className="w-full bg-bakery-teal hover:bg-bakery-gold text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group">
                                        Checkout
                                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
