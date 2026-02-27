import React from 'react'
import { ShoppingCart, User, Menu, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NavbarProps {
    onOpenCart: () => void
    cartCount: number
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, cartCount }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    return (
        <nav className="bg-bakery-cream border-b border-bakery-warm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center">
                        <button
                            className="sm:hidden p-2 text-bakery-cocoa"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-serif font-bold text-bakery-cocoa tracking-tight">
                                KOKORAKO <span className="text-bakery-gold">BAKES</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex items-center space-x-8">
                        <Link to="/" className="text-bakery-cocoa hover:text-bakery-gold transition-colors font-medium">HOME</Link>
                        <Link to="/catalog" className="text-bakery-cocoa hover:text-bakery-gold transition-colors font-medium">CATALOG</Link>
                        <Link to="/about" className="text-bakery-cocoa hover:text-bakery-gold transition-colors font-medium">OUR STORY</Link>
                        <Link to="/contact" className="text-bakery-cocoa hover:text-bakery-gold transition-colors font-medium">CONTACT</Link>
                    </div>

                    <div className="flex items-center space-x-5">
                        <button className="p-2 text-bakery-cocoa hover:text-bakery-gold transition-colors">
                            <Search size={22} />
                        </button>
                        <Link to="/account" className="p-2 text-bakery-cocoa hover:text-bakery-gold transition-colors">
                            <User size={22} />
                        </Link>
                        <button
                            onClick={onOpenCart}
                            className="p-2 text-bakery-cocoa hover:text-bakery-gold transition-colors relative"
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 h-4 w-4 bg-bakery-gold text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-bakery-warm border-t border-bakery-warm px-4 py-6 space-y-4">
                    <Link to="/" className="block text-bakery-cocoa font-medium">HOME</Link>
                    <Link to="/catalog" className="block text-bakery-cocoa font-medium">CATALOG</Link>
                    <Link to="/about" className="block text-bakery-cocoa font-medium">OUR STORY</Link>
                    <Link to="/contact" className="block text-bakery-cocoa font-medium">CONTACT</Link>
                </div>
            )}
        </nav>
    )
}
