import React from 'react'
import { motion } from 'framer-motion'
import type { Product } from '../types'
import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProductCardProps {
    product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Get the lowest price for the "From ₹..." display
    const lowestPrice = product.prices ? Math.min(...Object.values(product.prices).filter(p => p > 0)) : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-bakery-warm group flex flex-col h-full"
        >
            <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-bakery-cocoa/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-[10px] font-bold text-bakery-gold uppercase tracking-widest">
                        {product.category}
                    </span>
                </div>

                <div className="absolute bottom-4 right-4 bg-bakery-cocoa text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight size={20} />
                </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-yellow-500 space-x-0.5">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                    </div>
                </div>

                <Link to={`/product/${product.id}`}>
                    <h3 className="font-serif text-xl font-bold text-bakery-cocoa mb-2 line-clamp-1 hover:text-bakery-gold transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs text-bakery-cocoa/50 mb-6 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-bakery-warm/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-bakery-cocoa/30 uppercase tracking-widest leading-none mb-1">Starting from</span>
                        <span className="text-xl font-bold text-bakery-cocoa leading-none">₹{lowestPrice}</span>
                    </div>
                    <Link
                        to={`/product/${product.id}`}
                        className="bg-bakery-cream text-bakery-cocoa px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-[0.1em] hover:bg-bakery-gold hover:text-white transition-all uppercase shadow-sm"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
