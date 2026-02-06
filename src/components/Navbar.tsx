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
        let mounted = true;

        const setupAuth = async () => {
            // 1. Get Initial Session
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (mounted) setProfile(data);
                }
            }
        };

        setupAuth();

        // 2. Set up Realtime Listener (Synchronously returned)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            // Only update if strictly necessary (SIGNED_IN or user ID changed) to avoid re-fetches on TOKEN_REFRESHED
            const curUserId = session?.user?.id;

            // If we have a user, and it's a new login or user changed, fetch profile
            if (curUserId && (event === 'SIGNED_IN' || user?.id !== curUserId)) {
                setUser(session.user);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', curUserId)
                    .single();
                if (mounted) setProfile(data);
            } else if (!curUserId) {
                // Initial load or signed out
                setUser(null);
                if (mounted) setProfile(null);
            } else {
                // Just token refresh, update user object but don't refetch profile
                setUser(session.user);
            }
        });

        // 3. Cleanup
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
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
                            {(profile?.statut === 'admin' || profile?.statut === 'superadmin' || profile?.statut === 'moderateur') && (
                                <Link href="/dashboard" className="btn btn-primary">Dashboard</Link>
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
