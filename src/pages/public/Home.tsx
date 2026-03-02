import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, ChevronRight, Star, Package, Flame, Truck, Sparkles } from 'lucide-react'
import { supabase } from '../../services/supabase'
import type { Product } from '../../types'

export const Home: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('cakes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3)
            .then(({ data, error }) => {
                if (!error) setProducts(data || [])
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-bakery-cream overflow-hidden text-bakery-teal font-sans">

            {/* Hero Section */}
            <section className="relative pt-36 pb-24 px-6 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 bg-bakery-peach text-bakery-teal rounded-full border border-bakery-warm">
                        Handcrafted with Love · Kokorako Bakes
                    </span>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none font-display text-bakery-teal">
                        Delight in<br />
                        <span className="text-bakery-gold">every bite.</span>
                    </h1>

                    <p className="text-bakery-teal/50 font-medium text-base max-w-md mx-auto leading-relaxed">
                        Freshly baked brownies, cakes & pastries — crafted to make every occasion special.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link to="/catalog">
                            <button className="bg-bakery-teal text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-bakery-gold transition-all flex items-center gap-2 group">
                                ORDER NOW
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link to="/catalog">
                            <button className="text-bakery-teal font-black text-xs uppercase tracking-widest hover:text-bakery-gold transition-colors flex items-center gap-2">
                                View All <ArrowRight size={14} />
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            <section className="py-20 px-6 bg-bakery-peach/40">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-black text-bakery-teal tracking-tight font-display">
                            Our Treats
                        </h2>
                        <p className="text-bakery-teal/40 text-sm font-medium">
                            Popular picks from our kitchen
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-bakery-warm/20" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-16 text-bakery-teal/30 border-2 border-dashed border-bakery-teal/10 rounded-3xl">
                            <Package size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-black uppercase tracking-widest">No products found</p>
                        </div>
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map((product, idx) => {
                                // Calculate minimum price safely
                                const minPrice = product.prices
                                    ? Math.min(...Object.values(product.prices).map(p => Number(p)))
                                    : 0;

                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -6 }}
                                    >
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-bakery-warm/30 group"
                                        >
                                            {/* Image Container */}
                                            <div className="aspect-[4/3] overflow-hidden bg-bakery-cream relative">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-bakery-teal/20">
                                                        <ShoppingBag size={40} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-2">
                                                <span className="text-[9px] font-black text-bakery-gold uppercase tracking-widest">
                                                    {product.category}
                                                </span>
                                                <h3 className="font-black text-bakery-teal text-base tracking-tight leading-tight group-hover:text-bakery-gold transition-colors">
                                                    {product.name}
                                                </h3>

                                                <div className="flex items-center justify-between pt-1">
                                                    <p className="text-bakery-gold font-black text-sm">
                                                        ₹{minPrice}
                                                        <span className="text-bakery-teal/20 font-medium text-[10px] ml-1">onwards</span>
                                                    </p>
                                                    <div className="flex items-center gap-1 text-bakery-gold">
                                                        <Star size={10} fill="currentColor" />
                                                        <span className="text-[9px] font-black text-bakery-teal/30">4.9</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer Action */}
                    <div className="text-center pt-4">
                        <Link to="/catalog">
                            <button className="border-2 border-bakery-teal/20 text-bakery-teal px-10 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-bakery-teal hover:text-white hover:border-bakery-teal transition-all duration-300 shadow-sm active:scale-95">
                                See Full Catalog
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Sparkles, title: 'Premium Ingredients', desc: 'Only the finest cocoa, flour, and dairy in every recipe.' },
                        { icon: Flame, title: 'Baked Fresh', desc: 'Every order is baked fresh — never frozen, never stale.' },
                        { icon: Truck, title: 'Local Delivery', desc: 'Fast, reliable delivery right to your doorstep.' },
                    ].map(({ icon: Icon, title, desc }, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-bakery-warm/40 shadow-sm space-y-3 hover:shadow-md transition-all flex flex-col">
                            <div className="w-10 h-10 bg-bakery-peach rounded-xl flex items-center justify-center text-bakery-teal">
                                <Icon size={20} strokeWidth={1.8} />
                            </div>
                            <h3 className="font-black text-bakery-teal text-sm tracking-tight">{title}</h3>
                            <p className="text-bakery-teal/40 text-sm leading-relaxed font-medium">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How to Order Section */}
            <section className="py-20 px-6 bg-bakery-peach/40">
                <div className="max-w-3xl mx-auto text-center space-y-16">
                    <h2 className="text-3xl font-black text-bakery-teal tracking-tight font-display">How to Order</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="absolute top-6 left-1/6 right-1/6 h-px bg-bakery-teal/10 hidden md:block" />
                        {[
                            { step: '01', title: 'Browse', desc: 'Pick from our curated catalog.' },
                            { step: '02', title: 'Customize', desc: 'Choose size and preferences.' },
                            { step: '03', title: 'Checkout', desc: 'Place & confirm via WhatsApp.' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 bg-bakery-teal text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg">
                                    {item.step}
                                </div>
                                <h4 className="font-black text-bakery-teal text-sm tracking-tight">{item.title}</h4>
                                <p className="text-bakery-teal/40 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <Link to="/catalog">
                        <button className="bg-bakery-teal text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all shadow-lg">
                            START ORDERING
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
