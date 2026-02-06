"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const code = searchParams.get('code');
            const next = searchParams.get('next') ?? '/dashboard';

            if (code) {
                try {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;

                    // Successful exchange, redirect
                    router.push(next);
                } catch (err: any) {
                    console.error('Auth callback error:', err);
                    setError(err.message || 'Une erreur est survenue lors de l\'authentification.');
                    // Optionally redirect to error page after a delay
                    setTimeout(() => router.push('/auth/login'), 3000);
                }
            } else {
                // No code, redirect to home or login
                router.push('/auth/login');
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white p-6 rounded-lg shadow-md border border-red-200 text-center max-w-md">
                    <h2 className="text-red-600 font-bold mb-2">Erreur d'authentification</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <p className="text-sm text-slate-400">Redirection vers la connexion...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <Loader className="animate-spin text-[var(--color-primary-600)] mb-4" size={32} />
            <p className="text-slate-600 font-medium">Finalisation de l'authentification...</p>
        </div>
    );
}

// Force client-side rendering for search params
export const dynamic = 'force-dynamic';
