"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center z-50">
            <div className="text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto">
                        <Loader2 className="w-full h-full text-[var(--color-primary-600)] animate-spin" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto bg-[var(--color-primary-100)] rounded-full blur-2xl opacity-50 animate-pulse"></div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Chargement<span className="inline-block w-8 text-left">{dots}</span>
                </h2>
                <p className="text-slate-500 text-sm">
                    Préparation de votre espace
                </p>
            </div>
        </div>
    );
}
