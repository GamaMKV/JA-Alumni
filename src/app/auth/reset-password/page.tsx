"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if we have a session (the callback should have established it)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
            }
        };
        checkSession();
    }, [router]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Les mots de passe ne correspondent pas." });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: "Le mot de passe doit faire au moins 6 caractères." });
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: "Votre mot de passe a été mis à jour avec succès !" });
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 glass-card">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Nouveau mot de passe
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Choisissez votre nouveau mot de passe sécurisé.
                    </p>
                </div>

                {message && (
                    <div className={`px-4 py-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        {message.text}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleReset}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-2.5 flex justify-center uppercase tracking-wide text-sm font-bold"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Mettre à jour'}
                    </button>
                </form>
            </div>
        </div>
    );
}
