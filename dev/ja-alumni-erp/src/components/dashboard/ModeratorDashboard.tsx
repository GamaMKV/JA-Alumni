"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MembersTable from './MembersTable';

export default function ModeratorDashboard({ user }: { user: any }) {
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ totalContext: 0, newThisMonth: 0 });

    useEffect(() => {
        const fetchRegionData = async () => {
            // Get user region
            const { data: userData } = await supabase.from('profiles').select('region').eq('id', user.id).single();
            if (userData?.region) {
                setProfile(userData);

                // Fetch stats parallel
                const p1 = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('region', userData.region);

                const day30ago = new Date();
                day30ago.setDate(day30ago.getDate() - 30);
                const p2 = supabase.from('profiles').select('*', { count: 'exact', head: true })
                    .eq('region', userData.region)
                    .gte('created_at', day30ago.toISOString());

                const [resTotal, resNew] = await Promise.all([p1, p2]);
                setStats({
                    totalContext: resTotal.count || 0,
                    newThisMonth: resNew.count || 0
                });
            }
        };
        fetchRegionData();
    }, [user]);

    if (!profile) return <div>Chargement du profil...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Régional ({profile.region})</h1>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Membres Totaux</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {stats.totalContext}
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Nouveaux (30j)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'green' }}>
                        +{stats.newThisMonth}
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Événements à venir</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'orange' }}>
                        0
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>(Bientôt disponible)</div>
                </div>
            </div>

            {/* Tabs / Sections */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Gestion des Membres</h2>
                <MembersTable region={profile.region} />
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Gestion des Événements</h3>
                <p style={{ color: '#666' }}>Le module de gestion des événements sera intégré prochainement.</p>
                <button className="btn btn-outline" disabled>Créer un événement (Bientôt)</button>
            </div>
        </div>
    );
}
