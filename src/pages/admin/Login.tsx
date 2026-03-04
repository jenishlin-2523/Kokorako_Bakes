import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, ChevronRight, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Navigate } from 'react-router-dom'

export const Login: React.FC = () => {
    const { signIn, user } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    if (user) {
        return <Navigate to="/admin" replace />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { error: signInError } = await signIn(email, password)
            if (signInError) throw signInError
            navigate('/admin')
        } catch (err: any) {
            setError(err.message || 'Access Denied: Invalid Credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-900/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl mb-6 shadow-2xl shadow-slate-900/20"
                    >
                        <ShieldCheck size={32} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Securely sign in to your admin dashboard
                    </p>
                </div>

                <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-medium text-sm text-slate-900 placeholder:text-slate-300 transition-all"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider">Forgot Password?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-medium text-sm text-slate-900 placeholder:text-slate-300 transition-all"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign in to System</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    &copy; 2026 Admin Portal &bull; Enterprise Grade Security
                </p>
            </motion.div>
        </div>
    )
}

