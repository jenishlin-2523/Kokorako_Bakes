import React from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
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
                        className="fixed inset-0 bg-bakery-cocoa/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        <div className="p-8 border-b border-bakery-warm flex justify-between items-center bg-bakery-cream/30">
                            <div>
                                <h2 className="text-2xl font-serif font-black text-bakery-cocoa uppercase tracking-tight">Your Collection</h2>
                                <p className="text-[10px] font-black text-bakery-gold uppercase tracking-widest mt-1">
                                    {items.length} {items.length === 1 ? 'Masterpiece' : 'Masterpieces'} Reserved
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white rounded-full transition-colors text-bakery-cocoa/40 hover:text-bakery-cocoa shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 bg-bakery-cream rounded-full flex items-center justify-center text-bakery-gold">
                                        <ShoppingBag size={32} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-bakery-cocoa">Your collection is empty</h3>
                                        <p className="text-sm text-bakery-cocoa/40 mt-2">Start adding artisanal cakes to your next celebration.</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="bg-bakery-gold text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bakery-gold/20"
                                    >
                                        Browse Catalog
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={`${item.id}-${item.customization.weight}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex gap-4 p-4 bg-bakery-cream/20 rounded-3xl border border-bakery-warm"
                                        >
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-serif font-bold text-bakery-cocoa">{item.name}</h4>
                                                        <p className="text-[10px] font-black text-bakery-gold uppercase tracking-widest mt-1">
                                                            {item.customization.weight}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => onRemoveItem(item.id, item.customization.weight)}
                                                        className="text-red-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-bakery-warm shadow-sm">
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, -1, item.customization.weight)}
                                                            className="text-bakery-cocoa/40 hover:text-bakery-gold transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, 1, item.customization.weight)}
                                                            className="text-bakery-cocoa/40 hover:text-bakery-gold transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="font-black text-bakery-cocoa">
                                                        ₹{(item.prices[item.customization.weight] || 0) * item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-8 bg-white border-t border-bakery-warm space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-bakery-cocoa/40 uppercase tracking-widest">Total Investment</span>
                                    <span className="text-3xl font-serif font-black text-bakery-cocoa">₹{total}</span>
                                </div>
                                <Link to="/checkout" onClick={onClose} className="block">
                                    <button className="w-full bg-bakery-cocoa hover:bg-bakery-gold text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all group flex items-center justify-center space-x-3">
                                        <span>Secure Checkout</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <p className="text-[9px] font-black text-bakery-cocoa/20 text-center uppercase tracking-widest">
                                    Freshness guaranteed • Tax calculated at checkout
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
