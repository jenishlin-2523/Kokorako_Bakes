import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Instagram } from 'lucide-react'

export const Footer: React.FC = () => {
    return (
        <footer className="bg-bakery-teal text-white font-sans">
            <div className="max-w-5xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-bakery-gold rounded-xl flex items-center justify-center text-white">
                                <span className="font-black text-sm">K</span>
                            </div>
                            <span className="text-base font-black tracking-tight">
                                KOKORAKO <span className="text-bakery-gold">BAKES</span>
                            </span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Handcrafted brownies, cakes & pastries — made fresh for every occasion.
                        </p>
                        <div className="flex gap-3">
                            {[Instagram].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:bg-bakery-gold hover:text-white transition-all">
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-bakery-gold uppercase tracking-[0.3em]">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', path: '/' },
                                { label: 'Products', path: '/catalog' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link to={item.path} className="text-xs font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-bakery-gold uppercase tracking-[0.3em]">Contact</h4>
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/917418932321?text=Hi%20Kokorako%20Bakes!%20I%27d%20like%20to%20place%20an%20order."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-white/60 hover:text-green-400 transition-colors group"
                            >
                                <MessageCircle size={14} className="text-bakery-gold group-hover:text-green-400 flex-shrink-0 transition-colors" />
                                <span className="text-xs font-semibold">+91 74189 32321</span>
                                <span className="text-[9px] font-black text-green-500/60 uppercase tracking-widest">WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">© {new Date().getFullYear()} Kokorako Bakes. All rights reserved.</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Made with ♥ for sweet lovers</p>
                </div>
            </div>
        </footer>
    )
}
