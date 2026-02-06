"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { Mail, MapPin } from 'lucide-react';

interface TeamMember {
    id: string;
    prenom: string;
    nom: string;
    statut: string;
    poste: string;
    pole: string;
    region: string;
    avatar_url: string;
    email: string;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [currentUserRegion, setCurrentUserRegion] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Get Current User Region
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('region')
                    .eq('id', session.user.id)
                    .single();
                if (userProfile) setCurrentUserRegion(userProfile.region);
            }

            // 2. Get Team Members
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('statut', ['copil', 'copil_plus', 'referent']);

            if (error) {
                console.error("Error fetching team:", error);
            } else {
                setMembers(data as TeamMember[]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Chargement de l&apos;équipe...</div>;

    // --- Grouping Logic ---

    // 1. Presidency
    const presidence = members.filter(m =>
        ['copil', 'copil_plus'].includes(m.statut) &&
        (['Présidence', 'Bureau'].includes(m.pole) || m.poste?.toLowerCase().includes('président'))
    );

    // 2. Poles (COPIL members NOT in Presidence)
    // Group by Pole
    const polesMembers = members.filter(m =>
        ['copil', 'copil_plus'].includes(m.statut) &&
        !presidence.find(p => p.id === m.id)
    );

    // Group logic: { "Communication": [Member1, Member2], ... }
    const poles: Record<string, TeamMember[]> = {};
    polesMembers.forEach(m => {
        const poleName = m.pole || 'Autres';
        if (!poles[poleName]) poles[poleName] = [];
        poles[poleName].push(m);
    });

    // 3. Referents
    const distinctReferents = members.filter(m => m.statut === 'referent');

    // Sort Referents: My Region First, then alphabetical by Region
    const sortedReferents = [...distinctReferents].sort((a, b) => {
        // Priority to current user region
        if (currentUserRegion) {
            if (a.region === currentUserRegion && b.region !== currentUserRegion) return -1;
            if (a.region !== currentUserRegion && b.region === currentUserRegion) return 1;
        }
        // Then sort by region name
        return (a.region || '').localeCompare(b.region || '');
    });


    // --- Render Helpers ---
    const MemberCard = ({ member, highlight = false }: { member: TeamMember, highlight?: boolean }) => (
        <div style={{
            background: highlight ? '#f0f9ff' : 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            border: highlight ? '2px solid var(--color-primary)' : '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%'
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <Avatar
                    url={member.avatar_url}
                    firstName={member.prenom}
                    lastName={member.nom}
                    size={100}
                />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{member.prenom} {member.nom}</h3>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {member.poste || 'Membre actif'}
            </div>
            {member.region && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    <MapPin size={14} /> {member.region}
                </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <a href={`mailto:${member.email}`} style={{ color: '#666' }}>
                    <Mail size={18} />
                </a>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '3rem 1rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>L&apos;Équipe JA Alumni</h1>

            {/* 1. Présidence */}
            {presidence.length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>La Présidence</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        {presidence.map(m => (
                            <div key={m.id} style={{ width: '280px' }}>
                                <MemberCard member={m} highlight />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 2. Pôles */}
            {Object.keys(poles).length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>Nos Pôles</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {Object.entries(poles).map(([poleName, members]) => (
                            <div key={poleName} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #eee' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem', display: 'inline-block', width: '100%' }}>
                                    Pôle {poleName}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {members.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <Avatar url={m.avatar_url} firstName={m.prenom} lastName={m.nom} size={50} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{m.prenom} {m.nom}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{m.poste}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. Référents */}
            {sortedReferents.length > 0 && (
                <section>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>Les Référents Régionaux</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                        {sortedReferents.map(m => (
                            <div key={m.id}>
                                <MemberCard member={m} highlight={m.region === currentUserRegion} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {members.length === 0 && (
                <div style={{ textAlign: 'center', color: '#666' }}>
                    Aucun membre de l&apos;équipe n&apos;a encore été configuré.
                </div>
            )}
        </div>
    );
}
