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

            // Only update if user CHANGED. 
            // 'SIGNED_IN' can fire on focus/recovery, so we must check if it's actually a different user.
            const curUserId = session?.user?.id;
            const prevUserId = user?.id;

            if (curUserId && curUserId !== prevUserId) {
                setUser(session.user);
                // Fetch profile only if new user
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', curUserId)
                    .single();
                if (mounted) setProfile(data);
            } else if (!curUserId) {
                // Signed out
                if (prevUserId) {
                    setUser(null);
                    if (mounted) setProfile(null);
                }
            } else {
                // User exists and is same, just update session object if needed (e.g. token refresh)
                // But avoid triggering renders if object is deep-equal? 
                // For simplicity, we just set it if we want to keep session fresh in state, 
                // but if 'user' state causes children re-renders, consider checking equality.
                // However, session.user ref might change. 
                // To stop the loop, we simply DO NOT fetch profile again.
                // We update 'user' state which is cheap.
                if (JSON.stringify(user) !== JSON.stringify(session.user)) {
                    setUser(session.user);
                }
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
                            <Link href="/team" className="btn btn-outline">L&apos;équipe</Link>
                            {(profile?.statut === 'copil_plus' || profile?.statut === 'referent') && (
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
