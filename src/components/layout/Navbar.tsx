"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const isAuthPage = pathname?.startsWith('/auth');
    if (isAuthPage) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            JA <span className="text-[var(--color-primary-600)]">Alumni</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {!user ? (
                                <>
                                    <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary-600)] transition-colors">
                                        À propos
                                    </Link>
                                    <Link href="/auth/login" className="btn-ghost text-sm">
                                        Se connecter
                                    </Link>
                                    <Link href="/auth/register" className="btn-primary text-sm shadow-lg shadow-green-500/20">
                                        Rejoindre le réseau
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary-600)]">
                                        Dashboard
                                    </Link>
                                    <Link href="/directory" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary-600)]">
                                        Réseau
                                    </Link>
                                    <Link href="/calendar" className="text-sm font-medium text-slate-600 hover:text-[var(--color-primary-600)]">
                                        Événements
                                    </Link>

                                    <div className="ml-4 flex items-center gap-2 pl-4 border-l border-slate-200">
                                        <Link href="/profile" className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 hover:bg-slate-200 transition-colors">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Mon Espace</span>
                                        </Link>
                                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        {!user ? (
                            <>
                                <Link href="/auth/login" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary-600)]">
                                    Se connecter
                                </Link>
                                <Link href="/auth/register" className="block rounded-md px-3 py-2 text-base font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)]">
                                    Rejoindre
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50">
                                    Dashboard
                                </Link>
                                <Link href="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50">
                                    Mon Profil
                                </Link>
                                <Link href="/calendar" className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50">
                                    Calendrier
                                </Link>
                                <button onClick={handleLogout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50">
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
