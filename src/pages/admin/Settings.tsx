import React, { useState } from 'react';
import { RefreshCw, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const Settings: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [isBlocked, setIsBlocked] = useState(() => {
        const saved = localStorage.getItem('kokorako_client_blocked');
        return saved === 'true';
    });

    const handleToggleBlock = async () => {
        setIsSaving(true);
        const newState = !isBlocked;

        try {
            // 1. Update working state in LocalStorage for instant global effect
            localStorage.setItem('kokorako_client_blocked', String(newState));

            // 2. Persist to Supabase if the table exists
            await supabase
                .from('settings')
                .upsert({ id: 'access_control', is_blocked: newState });

            setIsBlocked(newState);
            alert(newState ? 'Website has been BLOCKED for all clients.' : 'Website is now OPEN for clients.');
        } catch (err) {
            console.error('Failed to update status:', err);
            // Fallback: Still update local state so the feature works immediately
            setIsBlocked(newState);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Access Control</h1>
                <p className="text-slate-500 text-sm mt-1">Manage public accessibility of the storefront.</p>
            </div>

            <div className={`card-saas p-8 border-2 transition-all duration-500 ${isBlocked ? 'border-rose-500 bg-rose-50/30' : 'border-emerald-500 bg-emerald-50/30'}`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className={`h-24 w-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isBlocked ? 'bg-rose-500 text-white rotate-12' : 'bg-emerald-500 text-white'}`}>
                        {isBlocked ? <Lock size={48} /> : <Unlock size={48} />}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Status: {isBlocked ? 'CLIENTS BLOCKED' : 'SYSTEM OPERATIONAL'}
                        </h2>
                        <p className="text-slate-600 mt-2 max-w-md">
                            {isBlocked
                                ? 'The public storefront is currently inaccessible. Clients will see a "Service Temporarily Unavailable" screen.'
                                : 'The website is currently live and accepting visitors. All client features are active.'}
                        </p>
                    </div>

                    <button
                        onClick={handleToggleBlock}
                        disabled={isSaving}
                        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center gap-3 ${isBlocked
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                            : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                            }`}
                    >
                        {isSaving ? <RefreshCw className="animate-spin" /> : isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                        {isBlocked ? 'Unblock Website' : 'Block Website'}
                    </button>
                </div>
            </div>

            {isBlocked && (
                <div className="p-6 bg-slate-900 rounded-[24px] border border-white/10 flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-amber-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Active Restriction</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            Blocking prevents all users from accessing the Catalog, Home, and Checkout pages.
                            Admin access remains unaffected.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
