import React from 'react'
import { motion } from 'framer-motion'
import type { Product } from '../types'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProductCardProps {
    product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const lowestPrice = product.prices ? Math.min(...Object.values(product.prices as Record<string, number>).filter(p => p > 0)) : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            className="group bg-white rounded-2xl overflow-hidden border border-bakery-warm/40 hover:shadow-lg transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/3] bg-bakery-cream">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-bakery-teal/20">
                        <ShoppingBag size={36} strokeWidth={1.5} />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <span className="text-[9px] font-black text-bakery-gold uppercase tracking-widest">{product.category}</span>

                <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm font-black text-bakery-teal line-clamp-1 group-hover:text-bakery-gold transition-colors tracking-tight">{product.name}</h3>
                </Link>

                <p className="text-xs text-bakery-teal/40 line-clamp-2 leading-relaxed flex-grow">{product.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-bakery-warm/40 mt-auto">
                    <div>
                        <span className="text-base font-black text-bakery-gold">₹{lowestPrice}</span>
                        <span className="text-[9px] text-bakery-teal/30 font-medium ml-1">onwards</span>
                    </div>
                    <Link
                        to={`/product/${product.id}`}
                        className="bg-bakery-teal text-white px-4 py-2 rounded-xl font-black text-[9px] tracking-widest hover:bg-bakery-gold transition-all uppercase"
                    >
                        View
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
