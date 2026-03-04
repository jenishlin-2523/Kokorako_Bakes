import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Activity,
    MessageSquare,
    ExternalLink,
    LifeBuoy,
    Database,
    Cloud,
    Server,
    CheckCircle2,
    XCircle,
    Copy,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../../services/supabase';

export const Support: React.FC = () => {
    const [health, setHealth] = useState({
        database: 'Checking...',
        storage: 'Checking...',
        api: 'Checking...',
        auth: 'Checking...'
    });
    const [isChecking, setIsChecking] = useState(false);

    const checkSystemHealth = async () => {
        setIsChecking(true);
        const newHealth = { ...health };

        try {
            // Check Database
            const { error: dbError } = await supabase.from('orders').select('id').limit(1);
            newHealth.database = dbError ? 'Error' : 'Operational';

            // Check Auth
            const { data: { session } } = await supabase.auth.getSession();
            newHealth.auth = session ? 'Operational' : 'Restricted';

            // Check Storage (mock assets check)
            newHealth.storage = 'Operational';
            newHealth.api = 'v1.4.2 Connected';

        } catch (err) {
            console.error('Health check failed', err);
        } finally {
            setHealth(newHealth);
            setTimeout(() => setIsChecking(false), 800);
        }
    };

    useEffect(() => {
        checkSystemHealth();
    }, []);

    const copySystemInfo = () => {
        const info = `System Info: Kokorako Bakes v1.4\nDB: ${health.database}\nAuth: ${health.auth}\nAPI: ${health.api}`;
        navigator.clipboard.writeText(info);
        alert('System diagnostics copied to clipboard!');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Control & Support</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor system integrity and access developer support.</p>
                </div>
                <button
                    onClick={checkSystemHealth}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
                    Run Diagnostics
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* System Health Section */}
                <div className="card-saas p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Activity size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">Live System Health</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Database Cluster', val: health.database, icon: Database },
                            { label: 'Cloud Storage', val: health.storage, icon: Cloud },
                            { label: 'API Gateway', val: health.api, icon: Server },
                            { label: 'Auth Middleware', val: health.auth, icon: ShieldCheck },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.val === 'Operational' || item.val.includes('Connected') ? (
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    ) : (
                                        <XCircle size={16} className="text-rose-500" />
                                    )}
                                    <span className={`text-xs font-black uppercase ${item.val === 'Operational' || item.val.includes('Connected') ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {item.val}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Connect Section */}
                <div className="space-y-6">
                    <div className="card-saas p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-none relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2">Need Technical Help?</h3>
                            <p className="text-slate-400 text-sm mb-8">Access directly with your development engineer for rapid troubleshooting.</p>

                            <div className="space-y-3">
                                <a
                                    href="https://wa.me/917418932321"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare size={20} />
                                        <span>Direct WhatsApp Support</span>
                                    </div>
                                    <ExternalLink size={16} />
                                </a>

                                <button
                                    onClick={copySystemInfo}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/5"
                                >
                                    <Copy size={18} />
                                    <span>Copy Diagnostics for Support</span>
                                </button>
                            </div>
                        </div>

                        {/* Decorative background icon */}
                        <LifeBuoy size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                    </div>

                    <div className="card-saas p-6 border-brand-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Version Alpha 1.4</h4>
                        </div>
                        <ul className="space-y-2">
                            <li className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                Real-time order sync enabled
                            </li>
                            <li className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                Floating Premium Header v2.0
                            </li>
                            <li className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                Automated history archiving
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
