"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';
import MembersTable from './MembersTable';
import { Users, UserPlus, Zap } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>({
        total: 0,
        newMembers: 0,
        activeMembers: 0,
        sectors: {},
        regions: {},
        ages: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // Fetch all profiles to calculate local stats (efficient for < 1000 users)
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, secteur, region, age, created_at, date_dernier_event');

            if (error || !profiles) {
                console.error("Error fetching stats:", error);
                setLoading(false);
                return;
            }

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const s = {
                total: profiles.length,
                newMembers: 0,
                activeMembers: 0,
                sectors: {} as Record<string, number>,
                regions: {} as Record<string, number>,
                ages: { "18-25": 0, "26-35": 0, "36-50": 0, "50+": 0 } as Record<string, number>
            };

            profiles.forEach((p: any) => {
                // Sectors
                const sec = p.secteur || 'Non défini';
                s.sectors[sec] = (s.sectors[sec] || 0) + 1;

                // Regions
                const reg = p.region || 'Non défini';
                s.regions[reg] = (s.regions[reg] || 0) + 1;

                // Ages
                if (p.age) {
                    if (p.age <= 25) s.ages["18-25"]++;
                    else if (p.age <= 35) s.ages["26-35"]++;
                    else if (p.age <= 50) s.ages["36-50"]++;
                    else s.ages["50+"]++;
                }

                // New Members (This Month)
                if (p.created_at && new Date(p.created_at) >= startOfMonth) {
                    s.newMembers++;
                }

                // Active (e.g. joined recently OR attended event recently)
                // For now, let's just count people with a recent event or creation
                if (p.date_dernier_event || (p.created_at && new Date(p.created_at) >= startOfMonth)) {
                    s.activeMembers++;
                }
            });

            setStats(s);
            setLoading(false);
        };
        fetchStats();
    }, []);

    const pieData = {
        labels: Object.keys(stats.sectors),
        datasets: [{
            data: Object.values(stats.sectors),
            backgroundColor: ['#8FCB9B', '#5B9279', '#E8F5E9', '#2C3E50', '#64748B', '#F1C40F', '#E74C3C'],
        }]
    };

    const barData = {
        labels: Object.keys(stats.regions),
        datasets: [{
            label: 'Membres par Région',
            data: Object.values(stats.regions),
            backgroundColor: 'var(--color-primary)',
            borderRadius: 4
        }]
    };

    const ageData = {
        labels: Object.keys(stats.ages),
        datasets: [{
            label: 'Tranche d\'âge',
            data: Object.values(stats.ages),
            backgroundColor: ['#A2D9CE', '#76D7C4', '#48C9B0', '#1ABC9C'],
            borderRadius: 4
        }]
    };

    const KPICard = ({ title, value, icon: Icon, color }: any) => (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', background: `${color}20`, color: color }}>
                <Icon size={24} />
            </div>
            <div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{value}</h3>
            </div>
        </div>
    );

    if (loading) return <div>Chargement des KPIs...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem' }}>Vision Globale (KPIs)</h1>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Total des Membres" value={stats.total} icon={Users} color="#2196F3" />
                <KPICard title="Nouveaux (ce mois)" value={stats.newMembers} icon={UserPlus} color="#4CAF50" />
                <KPICard title="Membres Actifs" value={stats.activeMembers} icon={Zap} color="#FF9800" />
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Répartition par Région</h3>
                    <div style={{ height: '250px' }}>
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card">
                    <h3>Répartition par Secteur</h3>
                    <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card">
                    <h3>Pyramide des Âges</h3>
                    <div style={{ height: '250px' }}>
                        <Bar data={ageData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Gestion des Membres</h3>
                <MembersTable />
            </div>
        </div>
    );
}
