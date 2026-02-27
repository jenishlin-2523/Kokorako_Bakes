import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, MapPin, CreditCard, ChevronLeft, CheckCircle2, MessageCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { sendWhatsAppOrder } from '../../services/whatsappService'

interface CheckoutProps {
    items: any[]
    onClearCart: () => void
}

export const Checkout: React.FC<CheckoutProps> = ({ items, onClearCart }) => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [orderComplete, setOrderComplete] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        deliveryDate: '',
        deliveryTime: '10:00 AM - 01:00 PM',
    })

    const subtotal = items.reduce((sum, item) => {
        const price = item.prices ? item.prices[item.customization?.weight] || 0 : 0
        return sum + (price * item.quantity)
    }, 0)

    const deliveryCharge = 50
    const total = subtotal + deliveryCharge

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    const handleSubmit = async () => {
        try {
            setLoading(true)

            // Generate order number KOKO-YYYYMMDD-Random
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
            const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
            const orderNumber = `KOKO-${dateStr}-${randomStr}`

            // Save order to Supabase
            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    address: formData.address,
                    total: total,
                    status: 'Pending',
                    delivery_date: formData.deliveryDate,
                    delivery_time: formData.deliveryTime,
                    items: items.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.prices[item.customization?.weight] || 0,
                        customization: item.customization
                    }))
                })

            if (orderError) {
                console.error('Supabase Order Error:', orderError)
                throw orderError
            }

            // Send WhatsApp notification
            sendWhatsAppOrder({
                orderNumber: orderNumber,
                customerName: formData.name,
                customerPhone: formData.phone,
                address: formData.address,
                items: items,
                total: total
            })

            setOrderComplete(true)
            onClearCart()
        } catch (err) {
            console.error('Error placing order:', err)
            alert('Something went wrong while saving your order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center p-4">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-bakery-warm text-center space-y-6">
                    <div className="w-20 h-20 bg-bakery-cream rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag size={40} className="text-bakery-gold/40" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-bakery-cocoa">Your basket is empty</h2>
                    <Link to="/catalog">
                        <button className="bg-bakery-cocoa text-white px-8 py-4 rounded-xl font-bold hover:bg-bakery-gold transition-all shadow-lg uppercase tracking-widest text-xs">
                            Return to Catalog
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-8 rounded-full text-green-600 mb-8 shadow-inner"
                >
                    <CheckCircle2 size={64} />
                </motion.div>
                <h2 className="text-4xl font-serif font-bold text-bakery-cocoa mb-4">Order Received!</h2>
                <p className="text-bakery-cocoa/60 max-w-md mb-8 font-medium">
                    We've received your order and details on WhatsApp.
                    Our bakers are getting ready! We'll contact you shortly for final confirmation.
                </p>
                <Link to="/catalog">
                    <button className="bg-bakery-cocoa text-white px-10 py-4 rounded-xl font-bold hover:bg-bakery-gold transition-all shadow-xl uppercase tracking-widest text-xs">
                        Back to Home
                    </button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-bakery-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-16 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-bakery-warm -translate-y-1/2 z-0 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-bakery-gold -translate-y-1/2 z-10 transition-all duration-700 rounded-full"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`relative z-20 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= i ? 'bg-bakery-gold text-white scale-110 shadow-xl' : 'bg-white text-bakery-cocoa/20 border-2 border-bakery-warm'
                            }`}>
                            {i}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white p-10 rounded-[2.5rem] border border-bakery-warm shadow-sm space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-serif font-bold text-bakery-cocoa flex items-center">
                                            <MessageCircle className="mr-4 text-bakery-gold" size={28} />
                                            Contact Info
                                        </h2>
                                        <p className="text-xs text-bakery-cocoa/40 font-bold uppercase tracking-widest">Where should we reach you?</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter your name"
                                                className="w-full p-4 bg-bakery-cream/50 border border-bakery-warm rounded-2xl focus:ring-2 focus:ring-bakery-gold/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest ml-1">WhatsApp Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+91"
                                                className="w-full p-4 bg-bakery-cream/50 border border-bakery-warm rounded-2xl focus:ring-2 focus:ring-bakery-gold/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextStep}
                                        disabled={!formData.name || !formData.phone}
                                        className="w-full bg-bakery-cocoa text-white py-5 rounded-2xl font-bold hover:bg-bakery-gold transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300 uppercase tracking-widest text-xs"
                                    >
                                        Continue to Delivery
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white p-10 rounded-[2.5rem] border border-bakery-warm shadow-sm space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-serif font-bold text-bakery-cocoa flex items-center">
                                            <MapPin className="mr-4 text-bakery-gold" size={28} />
                                            Delivery Place
                                        </h2>
                                        <p className="text-xs text-bakery-cocoa/40 font-bold uppercase tracking-widest">Tell us where to bring the goodness</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest ml-1">Full Address</label>
                                            <textarea
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="Street, Landmark, City..."
                                                className="w-full p-4 bg-bakery-cream/50 border border-bakery-warm rounded-2xl focus:ring-2 focus:ring-bakery-gold/20 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest ml-1">Delivery Date</label>
                                                <input
                                                    type="date"
                                                    name="deliveryDate"
                                                    required
                                                    value={formData.deliveryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full p-4 bg-bakery-cream/50 border border-bakery-warm rounded-2xl focus:ring-2 focus:ring-bakery-gold/20 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-bakery-cocoa/40 uppercase tracking-widest ml-1">Preferred Time</label>
                                                <select
                                                    name="deliveryTime"
                                                    value={formData.deliveryTime}
                                                    onChange={handleInputChange}
                                                    className="w-full p-4 bg-bakery-cream/50 border border-bakery-warm rounded-2xl focus:ring-2 focus:ring-bakery-gold/20 outline-none font-medium"
                                                >
                                                    <option>10:00 AM - 01:00 PM</option>
                                                    <option>01:00 PM - 04:00 PM</option>
                                                    <option>04:00 PM - 07:00 PM</option>
                                                    <option>07:00 PM - 10:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={prevStep}
                                            className="p-5 bg-bakery-cream border border-bakery-warm rounded-2xl hover:bg-white transition-all"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={nextStep}
                                            disabled={!formData.address || !formData.deliveryDate}
                                            className="flex-grow bg-bakery-cocoa text-white py-5 rounded-2xl font-bold hover:bg-bakery-gold transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300 uppercase tracking-widest text-xs"
                                        >
                                            Review My Order
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white p-10 rounded-[2.5rem] border border-bakery-warm shadow-sm space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-serif font-bold text-bakery-cocoa flex items-center">
                                            <CreditCard className="mr-4 text-bakery-gold" size={28} />
                                            Order Summary
                                        </h2>
                                        <p className="text-xs text-bakery-cocoa/40 font-bold uppercase tracking-widest">Double check your details</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-bakery-cream/50 p-6 rounded-[1.5rem] border border-bakery-warm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-bold text-bakery-cocoa/30 uppercase tracking-widest">Ship To</p>
                                                    <p className="font-bold text-bakery-cocoa">{formData.name}</p>
                                                    <p className="text-sm text-bakery-cocoa/70">{formData.address}</p>
                                                </div>
                                                <button onClick={() => setStep(2)} className="text-[10px] font-bold text-bakery-gold uppercase underline">Edit</button>
                                            </div>
                                            <div className="pt-3 border-t border-bakery-warm/50 flex justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-bakery-cocoa/30 uppercase tracking-widest">Phone</p>
                                                    <p className="text-sm font-bold text-bakery-cocoa">{formData.phone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-bakery-cocoa/30 uppercase tracking-widest">Delivery</p>
                                                    <p className="text-sm font-bold text-bakery-cocoa">{formData.deliveryDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="w-full bg-green-600 text-white py-6 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl flex items-center justify-center space-x-4 disabled:bg-gray-100 disabled:text-gray-300"
                                        >
                                            {loading ? (
                                                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <MessageCircle size={24} />
                                                    <span className="uppercase tracking-[0.2em] text-sm">Send Order via WhatsApp</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-bakery-cocoa/40 font-bold uppercase tracking-widest mt-6 italic">Secure order transmission via WhatsApp Business</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-bakery-warm shadow-sm sticky top-32 space-y-6">
                            <h3 className="font-serif font-bold text-xl text-bakery-cocoa border-b border-bakery-cream pb-4">Your Selection</h3>
                            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item, idx) => {
                                    const price = item.prices ? item.prices[item.customization?.weight] || 0 : 0
                                    return (
                                        <div key={`${item.id}-${idx}`} className="flex justify-between items-start group">
                                            <div className="flex-grow pr-4">
                                                <p className="font-bold text-bakery-cocoa text-sm line-clamp-1 group-hover:text-bakery-gold transition-colors">{item.name}</p>
                                                <p className="text-[10px] text-bakery-cocoa/40 font-bold uppercase tracking-widest mt-1">
                                                    {item.customization?.weight || 'Standard'} • Qty {item.quantity}
                                                </p>
                                            </div>
                                            <span className="font-bold text-bakery-cocoa text-sm">₹{price * item.quantity}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="pt-6 border-t border-bakery-warm space-y-3">
                                <div className="flex justify-between text-xs font-bold text-bakery-cocoa/40 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-bakery-cocoa/40 uppercase tracking-widest">
                                    <span>Delivery</span>
                                    <span>₹{deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-bakery-cream">
                                    <span className="text-lg font-serif font-bold text-bakery-cocoa">Total</span>
                                    <span className="text-2xl font-bold text-bakery-gold">₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
