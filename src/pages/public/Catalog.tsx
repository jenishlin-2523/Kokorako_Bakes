import React, { useEffect, useState } from 'react'
import type { Product } from '../../types'
import { ProductCard } from '../../components/ProductCard'
import { Search } from 'lucide-react'
import { supabase } from '../../services/supabase'

export const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const categories = ['All', 'Cakes', 'Brownies', 'Cookies', 'Cupcakes']

    useEffect(() => {
        fetchProducts()
        const subscription = supabase
            .channel('public:cakes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cakes' }, (payload: any) => {
                setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
            })
            .subscribe()
        return () => { supabase.removeChannel(subscription) }
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('cakes').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setProducts(data || [])
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="bg-bakery-cream min-h-screen font-sans">

            {/* Header */}
            <div className="pt-24 pb-10 px-6 border-b border-bakery-warm/40">
                <div className="max-w-5xl mx-auto space-y-1">
                    <h1 className="text-3xl font-black text-bakery-teal tracking-tight font-display">Our Products</h1>
                    <p className="text-bakery-teal/40 text-sm font-medium">Freshly baked, made to order.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-grow max-w-xs">
                        <input
                            type="text"
                            placeholder="Search treats..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-bakery-warm/60 rounded-xl outline-none focus:border-bakery-teal transition-all text-sm font-medium placeholder:text-bakery-teal/20 text-bakery-teal"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-teal/20" size={16} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat
                                    ? 'bg-bakery-teal text-white border-bakery-teal'
                                    : 'bg-white text-bakery-teal/50 border-bakery-warm/60 hover:border-bakery-teal/30 hover:text-bakery-teal'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl h-72 border border-bakery-warm/40" />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 space-y-4">
                        <Search size={28} className="mx-auto text-bakery-teal/20" />
                        <h3 className="text-base font-black text-bakery-teal/50 uppercase tracking-wide">No results found</h3>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                            className="text-xs font-black text-bakery-gold underline underline-offset-4 hover:text-bakery-teal transition-colors uppercase tracking-widest"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
