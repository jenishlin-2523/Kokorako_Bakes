import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Star, Clock, ShieldCheck, Truck } from 'lucide-react'
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

    useEffect(() => {
        if (id) fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('cakes')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setProduct(data)

            // Set default weight if prices exist
            if (data?.prices) {
                const weights = Object.keys(data.prices)
                if (weights.length > 0) setSelectedWeight(weights[0])
            }
        } catch (err) {
            console.error('Error fetching product:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bakery-cream flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-bakery-gold border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-serif font-bold text-bakery-cocoa mb-4">Treat Not Found</h2>
                <button
                    onClick={() => navigate('/catalog')}
                    className="text-bakery-gold font-bold flex items-center space-x-2"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Catalog</span>
                </button>
            </div>
        )
    }

    const price = product.prices ? product.prices[selectedWeight] || 0 : 0

    return (
        <div className="bg-bakery-cream min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-12 flex items-center space-x-2 text-bakery-cocoa/40 hover:text-bakery-gold transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Bakery</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-[3rem] overflow-hidden border border-bakery-warm shadow-2xl">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-[2rem] shadow-xl border border-bakery-warm hidden md:block">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-bakery-gold/10 text-bakery-gold rounded-xl">
                                    <Star size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-bakery-cocoa">Top Rated</p>
                                    <p className="text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest leading-none">Customer Favorite</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div>
                            <span className="bg-bakery-gold/10 text-bakery-gold text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block">
                                {product.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-bakery-cocoa mb-4 uppercase tracking-tight leading-tight">{product.name}</h1>
                            <p className="text-lg text-bakery-cocoa/60 leading-relaxed max-w-xl">{product.description}</p>
                        </div>

                        {/* Customization */}
                        <div className="space-y-6">
                            {product.dietary_tags && product.dietary_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {product.dietary_tags.map(tag => (
                                        <span key={tag} className="bg-green-50 text-green-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-green-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h3 className="text-[10px] font-black text-bakery-cocoa/30 uppercase tracking-[0.2em] mb-4">Select Weight</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.prices && Object.keys(product.prices).map(weight => (
                                        <button
                                            key={weight}
                                            onClick={() => setSelectedWeight(weight)}
                                            className={`px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${selectedWeight === weight
                                                ? 'bg-bakery-cocoa text-white shadow-xl shadow-bakery-cocoa/20 scale-105'
                                                : 'bg-white border border-bakery-warm text-bakery-cocoa hover:border-bakery-gold/40'
                                                }`}
                                        >
                                            {weight}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 pt-4">
                                <div>
                                    <h3 className="text-[10px] font-black text-bakery-cocoa/30 uppercase tracking-[0.2em] mb-4 text-left">Quantity</h3>
                                    <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl border border-bakery-warm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-bakery-cream rounded-xl text-xl font-black text-bakery-cocoa"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-black text-bakery-cocoa">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-bakery-cream rounded-xl text-xl font-black text-bakery-cocoa"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-[10px] font-black text-bakery-cocoa/40 uppercase tracking-[0.2em] mb-4 text-right">Investment</h3>
                                    <p className="text-5xl font-serif font-black text-bakery-cocoa text-right leading-none">
                                        ₹{price * quantity}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={() => onAddToCart(product, { weight: selectedWeight }, quantity)}
                            className="w-full flex items-center justify-center space-x-4 bg-bakery-gold hover:bg-bakery-cocoa text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-bakery-gold/20 group"
                        >
                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Add to Collection</span>
                        </button>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-bakery-warm">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center text-bakery-gold"><Clock size={20} /></div>
                                <p className="text-[8px] font-black text-bakery-cocoa/40 uppercase tracking-widest">Fresh Baked</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center text-bakery-gold"><Truck size={20} /></div>
                                <p className="text-[8px] font-black text-bakery-cocoa/40 uppercase tracking-widest">Madurai Delivery</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center text-bakery-gold"><ShieldCheck size={20} /></div>
                                <p className="text-[8px] font-black text-bakery-cocoa/40 uppercase tracking-widest">Quality Assured</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
