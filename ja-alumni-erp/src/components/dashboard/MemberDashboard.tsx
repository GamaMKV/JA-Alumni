"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MemberDashboard({ user }: { user: any }) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        const { error } = await supabase
            .from('profiles')
            .update({
                nom: profile.nom,
                prenom: profile.prenom,
                telephone: profile.telephone,
                secteur: profile.secteur,
                departement: profile.departement,
                updated_at: new Date(),
            })
            .eq('id', user.id);

        setUpdating(false);
        if (!error) alert('Profil mis à jour !');
    };

    if (loading) return <div>Chargement du profil...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1>Espace Membre</h1>
            <p>Bienvenue, {profile?.prenom || user.email}</p>

            <div className="card" style={{ maxWidth: '600px', marginTop: '2rem' }}>
                <h3>Modifier mon profil</h3>
                <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label className="label">Nom</label>
                        <input
                            className="input"
                            value={profile?.nom || ''}
                            onChange={e => setProfile({ ...profile, nom: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Prénom</label>
                        <input
                            className="input"
                            value={profile?.prenom || ''}
                            onChange={e => setProfile({ ...profile, prenom: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Téléphone</label>
                        <input
                            className="input"
                            value={profile?.telephone || ''}
                            onChange={e => setProfile({ ...profile, telephone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Secteur</label>
                        <input
                            className="input"
                            value={profile?.secteur || ''}
                            onChange={e => setProfile({ ...profile, secteur: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={updating}>
                        {updating ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </form>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'gray' }}>
                    Dernière mise à jour: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Jamais'}
                </div>
            </div>
        </div>
    );
}
