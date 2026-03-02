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
