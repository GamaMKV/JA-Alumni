"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Download, Eye } from 'lucide-react';
import MemberDetailModal from './MemberDetailModal';

interface MembersTableProps {
    region?: string; // If provided, filter by this region
}

export default function MembersTable({ region }: MembersTableProps) {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    // Modal State
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('statut').eq('id', user.id).single();
                if (data) setUserRole(data.statut);
            }
        };
        fetchUserRole();
    }, []);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const start = (page - 1) * LIMIT;
            const end = start + LIMIT - 1;

            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            // Apply Region Filter
            if (region) {
                query = query.eq('region', region);
            }

            if (debouncedSearch) {
                query = query.or(`nom.ilike.%${debouncedSearch}%,prenom.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
            }

            const { data, count, error } = await query;

            if (error) throw error;

            setMembers(data || []);
            if (count) setTotalPages(Math.ceil(count / LIMIT));
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, region]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleExport = async () => {
        try {
            let query = supabase.from('profiles').select('*');
            if (region) query = query.eq('region', region);

            const { data, error } = await query;

            if (error) throw error;
            if (!data || data.length === 0) return alert('Aucune donnée à exporter');

            const headers = ['id', 'email', 'nom', 'prenom', 'telephone', 'region', 'statut'];
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(fieldName => `"${row[fieldName] || ''}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `membres_ja_alumni_${region || 'all'}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Erreur lors de l\'export CSV');
        }
    };

    const handleOpenModal = (member: any) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={handleExport} className="btn btn-outline" style={{ gap: '0.5rem' }}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-primary-dark)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Nom</th>
                            <th style={{ padding: '0.75rem' }}>Email</th>
                            {!region && <th style={{ padding: '0.75rem' }}>Région</th>}
                            <th style={{ padding: '0.75rem' }}>Statut</th>
                            <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Aucun membre trouvé.</td></tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ fontWeight: 600 }}>{member.nom || 'Sans nom'} {member.prenom}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{member.situation || 'Situation inconnue'}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{member.email}</td>
                                    {!region && <td style={{ padding: '0.75rem' }}>{member.region || '-'}</td>}
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            background: ['copil', 'copil_plus'].includes(member.statut) ? 'var(--color-primary)' : 'var(--color-primary-light)',
                                            color: ['copil', 'copil_plus'].includes(member.statut) ? 'white' : 'var(--color-primary-dark)'
                                        }}>
                                            {member.statut === 'alumni' ? 'Alumni' :
                                                member.statut === 'referent' ? 'Référent' :
                                                    member.statut === 'copil' ? 'COPIL' :
                                                        member.statut === 'copil_plus' ? 'COPIL+' : member.statut}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.5rem' }}
                                                onClick={() => handleOpenModal(member)}
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '1rem', alignItems: 'center' }}>
                <button
                    className="btn btn-outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ opacity: page === 1 ? 0.5 : 1 }}
                >
                    <ChevronLeft size={16} />
                </button>
                <span>Page {page} sur {totalPages}</span>
                <button
                    className="btn btn-outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{ opacity: page === totalPages ? 0.5 : 1 }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <MemberDetailModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={() => {
                    fetchMembers(); // Refresh list after edit
                }}
                currentUserRole={userRole}
            />
        </div>
    );
}
