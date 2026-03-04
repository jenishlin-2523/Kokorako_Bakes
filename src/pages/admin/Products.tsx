import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Search, Camera, Filter, X, Grid, List as ListIcon, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '../../services/supabase'

interface Product {
    id: string
    name: string
    description: string
    image_url: string
    category: string
    prices: Record<string, number>
}

export const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('All')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isViewOnly, setIsViewOnly] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Cakes',
        prices: {
            '250g': 0,
            '500g': 0,
            '1kg': 0,
            '1.5kg': 0,
            '2kg': 0
        },
        image_url: '',
    })

    const weights = ['250g', '500g', '1kg', '1.5kg', '2kg']
    const categories = ['All', 'Cakes', 'Brownies', 'Cookies', 'Pastries']

    useEffect(() => {
        // Set initial view mode based on screen size
        if (window.innerWidth < 768) {
            setViewMode('list')
        }
        fetchProducts()
    }, [])

    const handleViewDetails = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            category: product.category,
            prices: {
                '250g': product.prices?.['250g'] || 0,
                '500g': product.prices?.['500g'] || 0,
                '1kg': product.prices?.['1kg'] || 0,
                '1.5kg': product.prices?.['1.5kg'] || 0,
                '2kg': product.prices?.['2kg'] || 0
            },
            image_url: product.image_url,
        })
        setIsViewOnly(true)
        setShowModal(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
        } catch (err) {
            console.error('Error uploading image:', err)
            alert('Failed to upload image. Please ensure the bucket "product-images" exists and is public.')
        } finally {
            setUploading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('cakes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (err: any) {
            console.error('Error fetching products:', err)
            alert(err.message || 'Error fetching products')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from('cakes')
                    .update(formData)
                    .eq('id', editingProduct.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('cakes')
                    .insert(formData)
                if (error) throw error
            }
            setShowModal(false)
            fetchProducts()
        } catch (err: any) {
            console.error('Error saving product:', err)
            alert(err.message || 'Error saving product')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        try {
            const { error } = await supabase
                .from('cakes')
                .delete()
                .eq('id', id)
            if (error) throw error
            fetchProducts()
        } catch (err) {
            console.error('Error deleting product:', err)
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    })

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your product catalog, pricing, and stock levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null)
                            setFormData({
                                name: '',
                                description: '',
                                category: 'Cakes',
                                prices: { '250g': 0, '500g': 0, '1kg': 0, '1.5kg': 0, '2kg': 0 },
                                image_url: '',
                            })
                            setIsViewOnly(false)
                            setShowModal(true)
                        }}
                        className="flex-grow sm:flex-grow-0 flex items-center justify-center space-x-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 text-sm"
                    >
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card-saas p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer transition-all"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid/List */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card-saas h-80 sm:h-96 animate-pulse bg-slate-50 border border-slate-100 rounded-2xl" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center card-saas">
                    <ImageIcon className="mx-auto text-slate-200 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="card-saas group overflow-hidden"
                        >
                            <div className="relative h-48 sm:h-56 overflow-hidden">
                                <img src={product.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1089&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingProduct(product)
                                            setFormData({
                                                name: product.name,
                                                description: product.description,
                                                category: product.category,
                                                prices: {
                                                    '250g': product.prices?.['250g'] || 0,
                                                    '500g': product.prices?.['500g'] || 0,
                                                    '1kg': product.prices?.['1kg'] || 0,
                                                    '1.5kg': product.prices?.['1.5kg'] || 0,
                                                    '2kg': product.prices?.['2kg'] || 0
                                                },
                                                image_url: product.image_url,
                                            })
                                            setShowModal(true)
                                        }}
                                        className="p-2.5 bg-white rounded-lg text-slate-900 hover:bg-brand-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2.5 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm border border-white/20">
                                        {product.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{product.name}</h3>
                                </div>
                                <p className="text-slate-500 text-xs line-clamp-2 mb-4 sm:mb-6">
                                    {product.description}
                                </p>

                                <div className="bg-slate-50/50 rounded-xl p-3 sm:p-4 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Starting Prices</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline space-x-1">
                                            <span className="text-lg sm:text-xl font-bold text-slate-900">₹{product.prices?.['250g'] || '0'}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">/ 250g</span>
                                        </div>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleViewDetails(product)
                                            }}
                                            className="flex items-center text-brand-600 font-bold text-xs group/link cursor-pointer hover:text-brand-700 transition-colors"
                                        >
                                            Details <ExternalLink size={12} className="ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4 lg:space-y-0 lg:card-saas lg:overflow-hidden">
                    {/* Desktop View Table */}
                    <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing (500g)</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                                    <img src={product.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587'} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                <div className="truncate max-w-[300px]">
                                                    <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 uppercase">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                            ₹{product.prices?.['250g'] || '0'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product)
                                                        setFormData({
                                                            name: product.name,
                                                            description: product.description,
                                                            category: product.category,
                                                            prices: {
                                                                '250g': product.prices?.['250g'] || 0,
                                                                '500g': product.prices?.['500g'] || 0,
                                                                '1kg': product.prices?.['1kg'] || 0,
                                                                '1.5kg': product.prices?.['1.5kg'] || 0,
                                                                '2kg': product.prices?.['2kg'] || 0
                                                            },
                                                            image_url: product.image_url,
                                                        })
                                                        setShowModal(true)
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="lg:hidden space-y-3">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleViewDetails(product)}
                                className="card-saas p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                    <img src={product.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587'} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
                                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">₹{product.prices?.['250g'] || '0'}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{product.category}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingProduct(product)
                                                setFormData({
                                                    name: product.name,
                                                    description: product.description,
                                                    category: product.category,
                                                    prices: {
                                                        '250g': product.prices?.['250g'] || 0,
                                                        '500g': product.prices?.['500g'] || 0,
                                                        '1kg': product.prices?.['1kg'] || 0,
                                                        '1.5kg': product.prices?.['1.5kg'] || 0,
                                                        '2kg': product.prices?.['2kg'] || 0
                                                    },
                                                    image_url: product.image_url,
                                                })
                                                setIsViewOnly(false)
                                                setShowModal(true)
                                            }}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] hover:text-brand-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(product.id)
                                            }}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                        <div
                            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                        {isViewOnly ? 'Product Details' : editingProduct ? 'Update Product Details' : 'Configure New Product'}
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                        {isViewOnly ? 'Review catalog positioning and pricing.' : 'Define SKU and catalog positioning attributes.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form id="product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                                    {/* Left Column: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Name</label>
                                            <input
                                                required
                                                readOnly={isViewOnly}
                                                placeholder="e.g. Belgian Chocolate Truffle"
                                                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all ${isViewOnly ? 'bg-slate-100 cursor-default' : ''}`}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Category</label>
                                            <select
                                                disabled={isViewOnly}
                                                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer ${isViewOnly ? 'bg-slate-100 cursor-default' : ''}`}
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Description</label>
                                            <textarea
                                                rows={4}
                                                readOnly={isViewOnly}
                                                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none ${isViewOnly ? 'bg-slate-100 cursor-default' : ''}`}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Elaborate on ingredients, flavor profile..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Visuals & Pricing */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Asset (Image)</label>
                                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                                <div className="relative group w-full sm:w-32 h-40 sm:h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center transition-all hover:bg-slate-100 hover:border-slate-300">
                                                    {formData.image_url ? (
                                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <Camera className="text-slate-300 mb-2" size={24} />
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Upload</span>
                                                        </>
                                                    )}
                                                    {!isViewOnly && (
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                    )}
                                                    {formData.image_url && !isViewOnly && (
                                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">{uploading ? 'Processing...' : 'Change'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow w-full space-y-3">
                                                    <div className="relative">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Image URL</label>
                                                        <input
                                                            readOnly={isViewOnly}
                                                            className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500/10 outline-none transition-all ${isViewOnly ? 'bg-slate-100 cursor-default' : ''}`}
                                                            value={formData.image_url}
                                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                                            placeholder="https://cloud.storage/asset.png"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 text-center">Pricing Structure (INR)</label>
                                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-2">
                                                {weights.map(size => (
                                                    <div key={size} className="space-y-1 sm:space-y-2 text-center">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{size}</p>
                                                        <input
                                                            type="number"
                                                            required
                                                            readOnly={isViewOnly}
                                                            className={`w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 outline-none font-bold text-center text-slate-700 text-xs shadow-sm ${isViewOnly ? 'bg-slate-100 cursor-default' : ''}`}
                                                            value={formData.prices[size as keyof typeof formData.prices]}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                prices: { ...formData.prices, [size]: Number(e.target.value) }
                                                            })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 px-0 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all text-sm uppercase tracking-wide"
                                    >
                                        {isViewOnly ? 'Dismiss' : 'Cancel'}
                                    </button>
                                    {!isViewOnly && (
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto order-1 sm:order-2 px-8 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition-all shadow-xl shadow-slate-900/20 text-sm uppercase tracking-wide"
                                        >
                                            {editingProduct ? 'Save Changes' : 'Initialize SKU'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
