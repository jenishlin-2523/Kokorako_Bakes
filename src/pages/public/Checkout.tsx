import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, MapPin, CreditCard, ChevronLeft, CheckCircle2, Truck, Clock, ShieldCheck, Phone, Mail, Calendar, User, ChevronRight } from 'lucide-react'
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
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
            const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
            const orderNumber = `BJKO-${dateStr}-${randomStr}`

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

            if (orderError) throw orderError

            sendWhatsAppOrder({
                orderNumber,
                customerName: formData.name,
                customerPhone: formData.phone,
                address: formData.address,
                items,
                total
            })

            setOrderComplete(true)
            onClearCart()
        } catch (err) {
            console.error(err)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const labelClass = "block text-[10px] font-black text-bakery-teal/40 uppercase tracking-widest mb-1.5"

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center p-6 text-center">
                <ShoppingBag size={40} className="text-bakery-teal/20 mb-4" strokeWidth={1.5} />
                <h2 className="text-xl font-black text-bakery-teal mb-2 uppercase tracking-tight">Basket is empty</h2>
                <p className="text-sm text-bakery-teal/40 mb-6">Add some treats before checking out.</p>
                <Link to="/catalog">
                    <button className="bg-bakery-teal text-white px-7 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all">
                        Browse Products
                    </button>
                </Link>
            </div>
        )
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-bakery-cream flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-bakery-peach rounded-2xl flex items-center justify-center text-bakery-teal mb-6">
                    <CheckCircle2 size={36} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-bakery-teal mb-2 uppercase tracking-tight">Order Placed!</h2>
                <p className="text-sm text-bakery-teal/50 max-w-xs mx-auto mb-8 leading-relaxed">
                    Your order has been received. We'll confirm via WhatsApp shortly.
                </p>
                <Link to="/">
                    <button className="bg-bakery-teal text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all">
                        Back to Home
                    </button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-bakery-cream min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-bakery-teal tracking-tight">Checkout</h1>
                    <p className="text-bakery-teal/40 text-sm mt-1">Complete your order in a few steps.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {['Contact', 'Delivery', 'Payment'].map((label, idx) => (
                        <React.Fragment key={idx}>
                            <div className={`flex items-center gap-2 ${step === idx + 1 ? 'text-bakery-teal' : step > idx + 1 ? 'text-bakery-gold' : 'text-bakery-teal/20'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${step === idx + 1 ? 'bg-bakery-teal text-white border-bakery-teal' : step > idx + 1 ? 'bg-bakery-gold text-white border-bakery-gold' : 'bg-white border-bakery-warm/60 text-bakery-teal/20'}`}>
                                    {step > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
                            </div>
                            {idx < 2 && <div className={`flex-1 h-px ${step > idx + 1 ? 'bg-bakery-gold' : 'bg-bakery-warm/60'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    className="bg-white rounded-2xl border border-bakery-warm/40 p-6 space-y-5"
                                >
                                    <div className="flex items-center gap-3 pb-4 border-b border-bakery-warm/40">
                                        <div className="w-8 h-8 bg-bakery-peach rounded-xl flex items-center justify-center text-bakery-teal"><User size={16} /></div>
                                        <h2 className="font-black text-bakery-teal text-sm uppercase tracking-wide">Contact Details</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <div className="flex items-center gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                                <User size={14} className="text-bakery-teal/20 flex-shrink-0" />
                                                <input type="text" name="name" className="w-full bg-transparent text-sm text-bakery-teal placeholder:text-bakery-teal/20 focus:outline-none font-medium" placeholder="Your name" value={formData.name} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <div className="flex items-center gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                                <Phone size={14} className="text-bakery-teal/20 flex-shrink-0" />
                                                <input type="tel" name="phone" className="w-full bg-transparent text-sm text-bakery-teal placeholder:text-bakery-teal/20 focus:outline-none font-medium" placeholder="+91" value={formData.phone} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <div className="flex items-center gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                            <Mail size={14} className="text-bakery-teal/20 flex-shrink-0" />
                                            <input type="email" name="email" className="w-full bg-transparent text-sm text-bakery-teal placeholder:text-bakery-teal/20 focus:outline-none font-medium" placeholder="you@email.com" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <button onClick={nextStep} disabled={!formData.name || !formData.phone || !formData.email} className="w-full bg-bakery-teal text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all disabled:opacity-30 flex items-center justify-center gap-2 mt-2">
                                        Continue <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    className="bg-white rounded-2xl border border-bakery-warm/40 p-6 space-y-5"
                                >
                                    <div className="flex items-center gap-3 pb-4 border-b border-bakery-warm/40">
                                        <div className="w-8 h-8 bg-bakery-peach rounded-xl flex items-center justify-center text-bakery-teal"><Truck size={16} /></div>
                                        <h2 className="font-black text-bakery-teal text-sm uppercase tracking-wide">Delivery Details</h2>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Delivery Address</label>
                                        <div className="flex items-start gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                            <MapPin size={14} className="text-bakery-teal/20 flex-shrink-0 mt-0.5" />
                                            <textarea name="address" rows={3} className="w-full bg-transparent text-sm text-bakery-teal placeholder:text-bakery-teal/20 focus:outline-none font-medium resize-none" placeholder="Full address" value={formData.address} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Preferred Date</label>
                                            <div className="flex items-center gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                                <Calendar size={14} className="text-bakery-teal/20 flex-shrink-0" />
                                                <input type="date" name="deliveryDate" className="w-full bg-transparent text-sm text-bakery-teal focus:outline-none font-medium" value={formData.deliveryDate} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Time Slot</label>
                                            <div className="flex items-center gap-2 bg-bakery-cream border border-bakery-warm/60 rounded-xl px-3 py-2.5 focus-within:border-bakery-teal transition-all">
                                                <Clock size={14} className="text-bakery-teal/20 flex-shrink-0" />
                                                <select name="deliveryTime" className="w-full bg-transparent text-sm text-bakery-teal focus:outline-none font-medium appearance-none cursor-pointer" value={formData.deliveryTime} onChange={handleInputChange}>
                                                    <option>10:00 AM - 01:00 PM</option>
                                                    <option>01:00 PM - 04:00 PM</option>
                                                    <option>04:00 PM - 07:00 PM</option>
                                                    <option>07:00 PM - 10:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button onClick={prevStep} className="px-4 py-3 bg-bakery-cream rounded-xl text-bakery-teal font-black text-xs uppercase tracking-widest hover:bg-bakery-peach transition-all flex items-center gap-1">
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button onClick={nextStep} disabled={!formData.address || !formData.deliveryDate} className="flex-1 bg-bakery-teal text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                                            Continue <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    className="bg-white rounded-2xl border border-bakery-warm/40 p-6 space-y-5"
                                >
                                    <div className="flex items-center gap-3 pb-4 border-b border-bakery-warm/40">
                                        <div className="w-8 h-8 bg-bakery-peach rounded-xl flex items-center justify-center text-bakery-teal"><CreditCard size={16} /></div>
                                        <h2 className="font-black text-bakery-teal text-sm uppercase tracking-wide">Payment</h2>
                                    </div>

                                    <div className="p-4 rounded-xl border-2 border-bakery-teal/20 bg-bakery-teal/5 flex items-center gap-4">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-bakery-gold border border-bakery-warm/60">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-bakery-teal text-sm">Cash on Delivery</p>
                                            <p className="text-xs text-bakery-teal/40">Pay when you receive your order.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-1 text-center">
                                        {[
                                            { icon: ShieldCheck, label: "Secure" },
                                            { icon: Truck, label: "Tracked" },
                                            { icon: Clock, label: "On Time" }
                                        ].map(({ icon: Icon, label }, idx) => (
                                            <div key={idx} className="flex-1 bg-bakery-cream rounded-xl py-3 border border-bakery-warm/40 flex flex-col items-center gap-1.5">
                                                <Icon size={15} className="text-bakery-teal/30" />
                                                <p className="text-[9px] font-black text-bakery-teal/40 uppercase tracking-wide">{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button onClick={prevStep} className="px-4 py-3 bg-bakery-cream rounded-xl text-bakery-teal font-black text-xs hover:bg-bakery-peach transition-all flex items-center">
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-bakery-teal text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-bakery-gold transition-all disabled:opacity-30">
                                            {loading ? 'Placing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-bakery-warm/40 p-5 space-y-4">
                            <h3 className="font-black text-bakery-teal text-xs uppercase tracking-widest flex items-center gap-2">
                                <ShoppingBag size={14} />
                                Order Summary
                            </h3>

                            <div className="space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="text-xs font-black text-bakery-teal line-clamp-1">{item.name}</p>
                                            <p className="text-[9px] text-bakery-teal/30 font-medium">{item.quantity}× {item.customization?.weight}</p>
                                        </div>
                                        <p className="text-xs font-black text-bakery-gold shrink-0">₹{(item.prices[item.customization?.weight] || 0) * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-bakery-warm/40 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-bakery-teal/40">
                                    <span>Subtotal</span><span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-semibold text-bakery-teal/40">
                                    <span>Delivery</span><span>₹{deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs font-black text-bakery-teal uppercase tracking-wide">Total</span>
                                    <span className="text-xl font-black text-bakery-gold">₹{total}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bakery-peach/40 rounded-2xl p-4 border border-bakery-warm/40">
                            <p className="text-xs text-bakery-teal/60 leading-relaxed">
                                You'll receive a WhatsApp confirmation after placing your order.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
