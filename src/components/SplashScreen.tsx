import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, CakeSlice, Dessert, Wheat, UtensilsCrossed, Flame } from 'lucide-react'

interface SplashScreenProps {
    onComplete: () => void
}

const SketchItem: React.FC<{
    children: React.ReactNode;
    top: string;
    left: string;
    rotate?: number;
    scale?: number;
    color?: string;
}> = ({ children, top, left, rotate = 0, scale = 1, color = 'text-bakery-teal' }) => (
    <div
        className={`absolute pointer-events-none opacity-[0.12] ${color}`}
        style={{
            top,
            left,
            transform: `rotate(${rotate}deg) scale(${scale})`,
        }}
    >
        {children}
    </div>
)

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'reveal' | 'done'>('intro')

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('reveal'), 800)
        const t2 = setTimeout(onComplete, 2000)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [onComplete])

    const colors = {
        bg: '#FFF9F3',
        pencilBlue: '#4A90E2',
        pencilRed: '#E66A53',
        pencilGreen: '#2D5A54'
    }

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
            {/* ─── LEFT CURTAIN PANEL ─── */}
            <motion.div
                initial={{ x: 0 }}
                animate={phase === 'reveal' ? { x: '-100%' } : { x: 0 }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-0 left-0 w-1/2 h-full z-[100] overflow-hidden"
                style={{ backgroundColor: colors.bg }}
            >
                {/* Widely Dispersed Sketch Art - Left Side */}
                <SketchItem top="12%" left="15%" rotate={-15} scale={3} color="text-pencilBlue/50">
                    <CakeSlice size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="18%" left="65%" rotate={20} scale={2} color="text-pencilGreen/40">
                    <div className="w-20 h-20 border-2 border-dashed border-current rounded-full flex items-center justify-center opacity-30">
                        <span className="text-2xl italic font-serif">K</span>
                    </div>
                </SketchItem>
                <SketchItem top="42%" left="10%" rotate={10} scale={4} color="text-pencilRed/50">
                    <Cookie size={48} strokeWidth={0.8} />
                </SketchItem>
                <SketchItem top="52%" left="60%" rotate={-5} scale={3} color="text-pencilBlue/40">
                    <Flame size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="75%" left="20%" rotate={15} scale={4} color="text-pencilGreen/50">
                    <Wheat size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="85%" left="75%" rotate={-10} scale={2.5} color="text-pencilRed/40">
                    <Cookie size={48} strokeWidth={1} />
                </SketchItem>

                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute right-0 top-0 h-full w-px bg-black/5" />
            </motion.div>

            {/* ─── RIGHT CURTAIN PANEL ─── */}
            <motion.div
                initial={{ x: 0 }}
                animate={phase === 'reveal' ? { x: '100%' } : { x: 0 }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-0 right-0 w-1/2 h-full z-[100] overflow-hidden"
                style={{ backgroundColor: colors.bg }}
            >
                {/* Widely Dispersed Sketch Art - Right Side */}
                <SketchItem top="15%" left="20%" rotate={30} scale={2.5} color="text-pencilRed/50">
                    <Cookie size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="10%" left="75%" rotate={-10} scale={3} color="text-pencilBlue/50">
                    <Dessert size={48} strokeWidth={0.8} />
                </SketchItem>
                <SketchItem top="45%" left="25%" rotate={15} scale={4} color="text-pencilGreen/40">
                    <div className="w-20 h-20 border-2 border-dashed border-current rounded-full flex items-center justify-center opacity-30">
                        <span className="text-2xl italic font-serif">K</span>
                    </div>
                </SketchItem>
                <SketchItem top="55%" left="70%" rotate={-25} scale={3} color="text-pencilBlue/50">
                    <Wheat size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="82%" left="15%" rotate={10} scale={3.5} color="text-pencilRed/40">
                    <CakeSlice size={48} strokeWidth={1} />
                </SketchItem>
                <SketchItem top="88%" left="80%" rotate={45} scale={2.5} color="text-pencilGreen/40">
                    <UtensilsCrossed size={48} strokeWidth={1} />
                </SketchItem>

                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute left-0 top-0 h-full w-px bg-black/5" />
            </motion.div>

            {/* ─── CENTRE CONTENT ─── */}
            <AnimatePresence>
                {phase === 'intro' && (
                    <motion.div
                        key="content"
                        className="absolute inset-0 flex flex-col items-center justify-center z-[110] p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-bakery-teal/30 mb-8">
                                Artisanal Bakes
                            </span>

                            <h1 className="text-7xl md:text-9xl font-hanoble text-bakery-teal tracking-tighter">
                                Kokorako
                            </h1>
                            <h2 className="text-4xl md:text-6xl font-hanoble text-bakery-gold tracking-[0.4em] -mt-4 opacity-80">
                                Bakes
                            </h2>

                            <div className="w-16 h-px bg-bakery-teal/10 mt-12" />

                            <p className="text-xs font-semibold text-bakery-teal/30 mt-8 tracking-[0.3em] uppercase">
                                Freshly baked for you
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vignette depth */}
            <div className="absolute inset-0 pointer-events-none z-[105] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]" />
        </div>
    )
}
