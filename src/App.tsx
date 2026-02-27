import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Catalog } from './pages/public/Catalog'
import { ProductDetail } from './pages/public/ProductDetail'
import { Checkout } from './pages/public/Checkout'
import { AdminLayout } from './components/AdminLayout'
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard'
import { Orders as AdminOrders } from './pages/admin/Orders'
import { Products as AdminProducts } from './pages/admin/Products'
import { Login as AdminLogin } from './pages/admin/Login'
import { CartSidebar } from './components/CartSidebar'
import type { Product } from './types'

interface CartItem extends Product {
  quantity: number
  customization: {
    weight: string
  }
}

// Temporary Home Component
const Home = () => (
  <div className="min-h-screen">
    <section className="relative h-[80vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Artisanal Cakes <br /> Baked with Love</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">Experience the finest home-baked delights in Madurai, delivered straight to your doorstep.</p>
        <Link to="/catalog">
          <button className="bg-bakery-gold hover:bg-bakery-gold/90 text-white px-10 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-xl">
            BROWSE CATALOG
          </button>
        </Link>
      </div>
    </section>
  </div>
)

const AppContent: React.FC = () => {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kokorako_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('kokorako_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product, customization: { weight: string }, quantity: number = 1) => {
    setCartItems(prev => {
      const itemIndex = prev.findIndex(item =>
        item.id === product.id && item.customization.weight === customization.weight
      )

      if (itemIndex > -1) {
        const newItems = [...prev]
        newItems[itemIndex].quantity += quantity
        return newItems
      }

      return [...prev, { ...product, quantity, customization }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (id: string, delta: number, weight: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.customization.weight === weight) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) }
      }
      return item
    }))
  }

  const removeItem = (id: string, weight: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.customization.weight === weight)))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('kokorako_cart')
  }

  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden">
      {!isAdminPath && (
        <Navbar
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}

      {!isAdminPath && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
          <Route path="/checkout" element={<Checkout items={cartItems} onClearCart={clearCart} />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
