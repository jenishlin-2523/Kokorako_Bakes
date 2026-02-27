import React, { useEffect, useState } from 'react'
import type { Product } from '../../types'
import { ProductCard } from '../../components/ProductCard'
import { Filter, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'

export const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const categories = ['All', 'Cakes', 'Brownies', 'Cookies', 'Cupcakes']

    useEffect(() => {
        fetchProducts()

        // Real-time listener for cakes updates
        const subscription = supabase
            .channel('public:cakes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cakes' }, (payload: any) => {
                setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('cakes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="bg-bakery-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-bakery-cocoa mb-4">Our Creations</h1>
                        <p className="text-bakery-cocoa/60 max-w-xl">Each treat is handcrafted in our Madurai kitchen using the finest ingredients and a sprinkle of magic.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                        <div className="relative flex-grow sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-cocoa/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search treats..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-bakery-warm rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-gold/20 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative sm:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-bakery-cocoa/40" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-white border border-bakery-warm rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-gold/20 transition-all text-sm appearance-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-bakery-warm aspect-[4/5] rounded-2xl mb-4"></div>
                                <div className="h-4 bg-bakery-warm rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-bakery-warm rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-serif text-bakery-cocoa/40">No treats found matching your search.</h3>
                    </div>
                )}
            </div>
        </div>
    )
}
