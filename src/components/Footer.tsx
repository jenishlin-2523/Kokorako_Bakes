import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react'

export const Footer: React.FC = () => {
    return (
        <footer className="bg-bakery-cocoa text-bakery-cream pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold">KOKORAKO BAKES</h3>
                    <p className="text-bakery-cream/70 text-sm leading-relaxed">
                        Crafting artisanal moments of joy in Madurai. From classic brownies to bespoke wedding cakes, we bake with love and local flavors.
                    </p>
                    <div className="flex space-x-4 pt-2">
                        <Facebook size={20} className="hover:text-bakery-gold cursor-pointer transition-colors" />
                        <Instagram size={20} className="hover:text-bakery-gold cursor-pointer transition-colors" />
                        <Twitter size={20} className="hover:text-bakery-gold cursor-pointer transition-colors" />
                    </div>
                </div>

                <div>
                    <h4 className="font-bold mb-6 tracking-wide">QUICK LINKS</h4>
                    <ul className="space-y-3 text-sm text-bakery-cream/70">
                        <li><Link to="/catalog" className="hover:text-bakery-gold">Browse Catalog</Link></li>
                        <li><Link to="/custom-orders" className="hover:text-bakery-gold">Custom Cakes</Link></li>
                        <li><Link to="/delivery" className="hover:text-bakery-gold">Delivery Areas</Link></li>
                        <li><Link to="/faq" className="hover:text-bakery-gold">FAQs</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 tracking-wide">CONTACT US</h4>
                    <ul className="space-y-3 text-sm text-bakery-cream/70">
                        <li className="flex items-center space-x-3 text-bakery-cream/70">
                            <MapPin size={16} /> <span>Anna Nagar, Madurai, TN</span>
                        </li>
                        <li className="flex items-center space-x-3 text-bakery-cream/70">
                            <Phone size={16} /> <span>+91 98765 43210</span>
                        </li>
                        <li className="flex items-center space-x-3 text-bakery-cream/70">
                            <Mail size={16} /> <span>hello@kokorakobakes.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-6 tracking-wide">NEWSLETTER</h4>
                    <p className="text-sm text-bakery-cream/70 mb-4">Get sweet treats and deals in your inbox.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="bg-bakery-cream/10 border border-bakery-cream/20 px-4 py-2 w-full text-sm focus:outline-none focus:border-bakery-gold rounded-l"
                        />
                        <button className="bg-bakery-gold text-white px-4 py-2 text-sm font-bold rounded-r">JOIN</button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-bakery-cream/10 text-center text-xs text-bakery-cream/40">
                © {new Date().getFullYear()} Kokorako Bakes. All rights reserved.
            </div>
        </footer>
    )
}
