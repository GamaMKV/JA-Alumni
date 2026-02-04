"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(data);
                } else {
                    setProfile(null);
                }
            });

            return () => subscription.unsubscribe();
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    if (pathname === '/auth') return null;

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link href="/" className="logo">
                    JA Alumni
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link href="/events" className="btn btn-outline">Événements</Link>
                            {profile?.statut === 'admin' && (
                                <Link href="/dashboard" className="btn btn-primary">Dashboard Admin</Link>
                            )}
                            <Link href="/profile" className="btn btn-outline" title="Mon Profil">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    👤 {profile?.prenom || 'Mon compte'}
                                </span>
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--color-primary-dark)', color: 'var(--color-primary-dark)' }}>Déconnexion</button>
                        </>
                    ) : (
                        <Link href="/auth" className="btn btn-primary">
                            Connexion
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
