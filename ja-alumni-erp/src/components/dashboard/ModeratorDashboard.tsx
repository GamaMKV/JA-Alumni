"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ModeratorDashboard({ user }: { user: any }) {
    const [profile, setProfile] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchRegionData = async () => {
            // Get user region
            const { data: userData } = await supabase.from('profiles').select('region').eq('id', user.id).single();
            if (userData) {
                setProfile(userData);

                // Mock fetching alerts for region
                // In real app: select * from profiles where region = userData.region and date_dernier_event < now() - interval '6 months'
                setAlerts([
                    { id: 1, nom: 'Dupont', prenom: 'Jean', reason: 'Inactif > 6 mois' }
                ]);
            }
        };
        fetchRegionData();
    }, [user]);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1>Dashboard Régional ({profile?.region || '...'})</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="card">
                    <h3>🎂 Anniversaires (7 jours)</h3>
                    <p>Aucun anniversaire cette semaine.</p>
                </div>

                <div className="card">
                    <h3>⚠️ Alertes Inactivité</h3>
                    <ul>
                        {alerts.map((a: any) => (
                            <li key={a.id}>{a.prenom} {a.nom} - {a.reason}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Gestion des Événements Régionaux</h3>
                <button className="btn btn-primary">Créer un événement</button>
            </div>
        </div>
    );
}
