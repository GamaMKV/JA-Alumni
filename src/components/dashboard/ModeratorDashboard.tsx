"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MembersTable from './MembersTable';
import EventList from '../events/EventList';

export default function ModeratorDashboard({ user }: { user: any }) {
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ totalContext: 0, newThisMonth: 0, upcomingEvents: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchRegionData = async () => {
            try {
                if (mounted) setLoading(true);
                // Get user region
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('region')
                    .eq('id', user.id)
                    .single();

                if (userError) throw userError;

                if (userData?.region) {
                    if (mounted) setProfile(userData);

                    // Fetch stats parallel
                    const p1 = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('region', userData.region);

                    const day30ago = new Date();
                    day30ago.setDate(day30ago.getDate() - 30);
                    const p2 = supabase.from('profiles').select('*', { count: 'exact', head: true })
                        .eq('region', userData.region)
                        .gte('created_at', day30ago.toISOString());

                    // Events count (Upcoming)
                    const p3 = supabase.from('evenements').select('*', { count: 'exact', head: true })
                        .or(`region_id.eq.${userData.region},region_id.is.null`)
                        .gte('date', new Date().toISOString());

                    const [resTotal, resNew, resEvents] = await Promise.all([p1, p2, p3]);

                    if (mounted) {
                        setStats({
                            totalContext: resTotal.count || 0,
                            newThisMonth: resNew.count || 0,
                            upcomingEvents: resEvents.count || 0
                        });
                    }
                } else {
                    if (mounted) setError("Aucune région associée à ce profil.");
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                if (mounted) setError(err.message || 'Erreur lors du chargement');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (user?.id) {
            fetchRegionData();
        }

        return () => {
            mounted = false;
        };
    }, [user]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du tableau de bord...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Effectuez une action pour résoudre : {error}</div>;
    if (!profile) return <div style={{ padding: '2rem', textAlign: 'center' }}>Profil introuvable.</div>;

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
                        {stats.upcomingEvents}
                    </div>
                </div>
            </div>

            {/* Tabs / Sections */}
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Gestion des Membres</h2>
                <MembersTable region={profile.region} />
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Gestion des Événements</h2>
                <EventList regionFilter={profile.region} adminMode={true} />
            </div>
        </div>
    );
}
