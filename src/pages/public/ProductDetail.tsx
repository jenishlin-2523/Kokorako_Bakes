import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Clock, ShieldCheck, Truck, ChevronLeft, Minus, Plus } from 'lucide-react'
import { supabase } from '../../services/supabase'
import type { Product } from '../../types'

interface ProductDetailProps {
    onAddToCart: (product: Product, customization: { weight: string }, quantity: number) => void
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ onAddToCart }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedWeight, setSelectedWeight] = useState<string>('')
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    useEffect(() => {
        if (id) fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('cakes').select('*').eq('id', id).single()
            if (error) throw error
            setProduct(data)
            if (data?.prices) {
                const weights = Object.keys(data.prices)
                if (weights.length > 0) setSelectedWeight(weights[0])
            }
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bakery-cream flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-bakery-teal border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center gap-4 text-center">
                <ShoppingBag size={32} className="text-bakery-teal/30" />
                <p className="font-black text-bakery-teal text-sm uppercase tracking-widest">Product not found</p>
                <button
                    onClick={() => navigate('/catalog')}
                    className="text-bakery-teal/40 font-black text-xs uppercase tracking-widest hover:text-bakery-teal transition-colors flex items-center gap-1"
                >
                    <ChevronLeft size={14} /> Back to Catalog
                </button>
            </div>
        )
    }

    const price = product.prices ? product.prices[selectedWeight] || 0 : 0

    const handleAddToCart = () => {
        onAddToCart(product, { weight: selectedWeight }, quantity)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="bg-bakery-cream min-h-screen pt-28 pb-16 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-bakery-teal/40 font-black text-[10px] uppercase tracking-widest hover:text-bakery-teal transition-colors mb-8 group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* Image */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-bakery-warm/40">
                        <div className="aspect-square">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-bakery-cream text-bakery-teal/20">
                                    <ShoppingBag size={64} strokeWidth={1} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-black text-bakery-teal uppercase tracking-widest px-3 py-1 bg-bakery-teal/10 rounded-full">
                                {product.category}
                            </span>
                        </div>

                        {/* Name & Description */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-bakery-teal tracking-tight leading-tight font-display">
                                {product.name}
                            </h1>
                            <p className="text-bakery-teal/50 text-sm leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Size selector */}
                        {product.prices && (
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-bakery-teal/30 uppercase tracking-[0.3em]">
                                    Choose Size
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(product.prices)
                                        .sort((a, b) => {
                                            const getWeightInGrams = (str: string) => {
                                                const value = parseFloat(str);
                                                if (isNaN(value)) return 0;
                                                return str.toLowerCase().includes('kg') ? value * 1000 : value;
                                            };
                                            return getWeightInGrams(a) - getWeightInGrams(b);
                                        })
                                        .map(weight => (
                                            <button
                                                key={weight}
                                                type="button"
                                                onClick={() => setSelectedWeight(weight)}
                                                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all ${selectedWeight === weight
                                                    ? 'bg-bakery-teal text-white shadow-md -translate-y-0.5'
                                                    : 'bg-white text-bakery-teal border border-bakery-warm/60 hover:border-bakery-teal/30'
                                                    }`}
                                            >
                                                {weight}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between py-4 border-t border-b border-bakery-warm/40">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-bakery-teal/30 uppercase tracking-[0.3em]">Quantity</label>
                                <div className="flex items-center gap-1 bg-white rounded-xl border border-bakery-warm/60 p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-bakery-teal hover:text-bakery-gold transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-black text-bakery-teal text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center text-bakery-teal hover:text-bakery-gold transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <label className="text-[9px] font-black text-bakery-teal/30 uppercase tracking-[0.3em]">Total</label>
                                <p className="text-3xl font-black text-bakery-gold tracking-tighter">₹{price * quantity}</p>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAddToCart}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 ${added
                                ? 'bg-green-500 text-white'
                                : 'bg-bakery-teal text-white hover:bg-bakery-gold'
                                }`}
                        >
                            <ShoppingBag size={16} />
                            {added ? 'Added to Basket!' : 'Add to Basket'}
                        </motion.button>

                        {/* Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Clock, label: "Fresh Daily" },
                                { icon: Truck, label: "Local Delivery" },
                                { icon: ShieldCheck, label: "Pure Quality" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-3 border border-bakery-warm/40 flex flex-col items-center gap-2 text-center">
                                    <item.icon size={16} className="text-bakery-teal/40" />
                                    <p className="text-[8px] font-black text-bakery-teal/40 uppercase tracking-wide leading-none">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
