import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Home } from './pages/public/Home'
import { Catalog } from './pages/public/Catalog'
import { ProductDetail } from './pages/public/ProductDetail'
import { Checkout } from './pages/public/Checkout'
import { AdminLayout } from './components/AdminLayout'
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard'
import { Orders as AdminOrders } from './pages/admin/Orders'
import { OrderHistory as AdminHistory } from './pages/admin/History'
import { Products as AdminProducts } from './pages/admin/Products'
import { Login as AdminLogin } from './pages/admin/Login'
import { Settings as AdminSettings } from './pages/admin/Settings'
import { Support as AdminSupport } from './pages/admin/Support'
import { CartSidebar } from './components/CartSidebar'
import { SplashScreen } from './components/SplashScreen'
import { ScrollToTop } from './components/ScrollToTop'
import type { Product } from './types'
import { Lock, ShieldAlert } from 'lucide-react'

interface CartItem extends Product {
  quantity: number
  customization: {
    weight: string
  }
}


const AppContent: React.FC = () => {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  const [isSiteBlocked, setIsSiteBlocked] = useState(() => {
    return localStorage.getItem('kokorako_client_blocked') === 'true'
  })

  // Sync with localStorage changes (from settings)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsSiteBlocked(localStorage.getItem('kokorako_client_blocked') === 'true')
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check every few seconds as backup
    const interval = setInterval(handleStorageChange, 2000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
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

  if (isSiteBlocked && !isAdminPath) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="h-24 w-24 bg-rose-500 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/20 rotate-3">
            <Lock size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System Offline</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              We are currently performing essential maintenance or the store is temporarily closed. Please check back later or contact support.
            </p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 text-left">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Note</p>
              <p className="text-xs font-bold text-slate-700">Access Restricted</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">© Kokorako Bakes Enterprise</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden">
      <ScrollToTop />
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
            <Route path="history" element={<AdminHistory />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="help" element={<AdminSupport />} />
          </Route>
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  )
}

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <AuthProvider>
      <Router>
        {showSplash && !window.location.pathname.startsWith('/admin') && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
